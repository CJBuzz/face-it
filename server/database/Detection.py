from sqlmodel import Session, SQLModel, Column, JSON, Field, select, delete, Relationship
import os
from datetime import datetime, time, timedelta
import uuid

from managers.FRManager import FRManager
from database.database import ResponseMessage, MessageType
from database.imgfs import save_img_to_file, fetch_img_from_file, reset_img_db, INFERENCE_IMGS_DIR

DATE_STR_FORMAT = '%Y%m%d'

def generate_uuid():
    #x = uuid.uuid1().hex
    #print("ID TYPE:", type(x))
    return uuid.uuid1().hex
    
class Detection_Create(SQLModel):
    image_data: str #base64 str image data
    
class Detection_Read(SQLModel):
    id: str
    date_time: str #datetime converted to string in ISO format
    image_data: str #base64 str image data
    bboxes: list["Face_Read"]  = []
    
    class Config:
        arbitrary_types_allowed=True
        
    @classmethod
    def model_validate_from_sql(cls, detection_sql: 'Detection_SQL') -> 'Detection_Read':
        return cls(
                id=detection_sql.id,
                date_time=detection_sql.date_time.isoformat(),
                image_data=fetch_img_from_file(detection_sql.image, 1, detection_sql.date_time.strftime(DATE_STR_FORMAT)),
                bboxes = detection_sql.bboxes
                )
    
class Detection_SQL(SQLModel, table = True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    date_time: datetime
    image: str #Reference to image folder
    bboxes: list["Face"] = Relationship(back_populates='detection')
    
    class Config:
        arbitrary_types_allowed=True
        
class Face_Read(SQLModel):
    id: str
    bbox: list[float] = []
    names: list[str] = []
    probs: list[float] = []
    
        
class Face(SQLModel, table = True):
    id: str = Field(default_factory=generate_uuid, primary_key=True, index=True)
    bbox: list[float] = Field(default=[], sa_column=Column(JSON))
    names: list[str] = Field(default=[], sa_column=Column(JSON))
    probs: list[float] = Field(default=[], sa_column=Column(JSON))
    
    detection_id: str = Field(foreign_key='detection_sql.id')
    detection: Detection_SQL = Relationship(back_populates='bboxes')
    
    class Config:
        arbitrary_types_allowed=True
        
def get_detections(session: Session, id: str | None = None, dateRange: str | None = None, offset: int | None = None, limit: int | None = 30) -> Detection_Read:
    """
    Returns detection info
    
    date: filter by this date
    offset: discount the first x results
    limit: limit to the first x results
    """    
    statement = select(Detection_SQL)
    
    if id: statement = statement.where(Detection_SQL.id == id)
    if dateRange: 
        [start_date_str, end_date_str] = dateRange.split('-')
        start_date = datetime.strptime(start_date_str, DATE_STR_FORMAT).date()
        end_date = datetime.strptime(end_date_str, DATE_STR_FORMAT).date()

        start = datetime.combine(start_date, time(0, 0, 0))
        end = datetime.combine(end_date + timedelta(days=1), time(0, 0, 0))
        
        statement = statement.where(Detection_SQL.date_time >=  start).where(Detection_SQL.date_time < end)
    if offset: statement = statement.offset(offset)
    if limit: statement = statement.limit(limit)
    
    print(statement)
    
    detections_sql = session.exec(statement).all()
    
    return [Detection_Read.model_validate_from_sql(detection_sql) for detection_sql in detections_sql]
    
def add_detections(session: Session, fr_manager: FRManager, image_data: str, top_n: int = 10) -> Detection_Read:
    """
    Creates new detection info and returns it 
    
    fr_manager: instance of FRManager created
    image_data: data of image sent represented as a base64 string
    """
    curr_datetime = datetime.now()
    curr_date = curr_datetime.strftime(DATE_STR_FORMAT)
    detection_uuid = uuid.uuid1().hex
    
    img_filename = save_img_to_file(image_data, 1, date_str=curr_date, file_uuid=detection_uuid)
    results = fr_manager.infer(img_filepath=os.path.join(INFERENCE_IMGS_DIR, 
                                                      curr_date, 
                                                      img_filename), 
                            k=top_n)
    
    if len(results) == 0: return None
    
    bboxes = [
        Face(
            bbox=face['bbox'],
            names = face['targets'],
            probs = face['sim_score']
            )
        for face in results
    ]
        
    detection_sql = Detection_SQL(
        id=detection_uuid,
        date_time=curr_datetime,
        image=img_filename,
        bboxes=bboxes
    )
        
    session.add(detection_sql)
    session.commit()
    session.refresh(detection_sql)
    
    return Detection_Read.model_validate_from_sql(detection_sql)

def delete_detections(session: Session, id:str) -> ResponseMessage:
    """
    Deletes selected record in database (chosen by date provided)
    
    Arguments:
    id: id str
    """
    
    detection_sql = session.get(Detection_SQL, id)
    
    if not detection_sql:
        return ResponseMessage(
            type=MessageType.error,
            message='Detection with {} does not exist!.'.format(id)
        )
    
    for face in detection_sql.bboxes:
        session.delete(face)
    session.delete(detection_sql)
    session.commit()
    
    return ResponseMessage(
            type=MessageType.success,
            message='Successfully deleted record of detection {}'.format(detection_sql.date_time)
        )

def delete_all_detections(session: Session) -> ResponseMessage:
    """
    Delete all detection records in the database
    """
    
    session.exec(delete(Detection_SQL))
    session.exec(delete(Face))
    session.commit()
    reset_img_db([1])
    
    return ResponseMessage(
            type=MessageType.success,
            message='Successfully deleted all detection records in database'
        )