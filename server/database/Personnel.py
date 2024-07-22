from sqlmodel import Field, Session, SQLModel, select, Column, JSON, delete
import numpy as np
import os

from managers.FRManager import FRManager
from database.database import ResponseMessage, MessageType
from database.imgfs import save_img_to_file, fetch_img_from_file, rename_img_folder, reset_img_folder, reset_img_db, DATABASE_IMGS_DIR

class PersonnelFR_Base(SQLModel):
    #honorific: str | None = None
    name: str | None
    images: list[str] | None = None

class PersonnelFR_Read(PersonnelFR_Base):
    
    @classmethod 
    def model_validate_from_sql(cls, person_sql: 'PersonnelFR_SQL') -> 'PersonnelFR_Read':
        return cls(
            #honorific=person_sql.honorific,
            name=person_sql.name,
            images=[fetch_img_from_file(img, mode=0, details=person_sql.name) for img in person_sql.images]
        )

class PersonnelFR_Update(PersonnelFR_Base):
    """
    Class type for a person, consisting of name and reference images (For receiving updates)
    """
    new_image: str | None = None

class PersonnelFR_SQL(SQLModel, table=True):
    """
    Model for SQL database
    """

    #honorific: str | None = None
    name: str = Field(primary_key=True)
    images: list[str] | None = Field(default=None, sa_column=Column(JSON))
    embeddings: bytes = bytes()
    ave_embedding: bytes = bytes()

    class Config:
        arbitrary_types_allowed=True,    
    
#embeddings = np.frombuffer(person.embeddings, dtype=np.float32).reshape((-1,512)) if len(person.embeddings) else None,
#ave_embedding = np.frombuffer(person.embedding, dtype=np.float32) if person.embeddings.any() else None
 
def get_all_PersonFR(session: Session, name: str | None = None, offset: int | None = None, limit: int | None = None) -> list[PersonnelFR_Read]:
    """
    Returns all personnel info
    """
    statement = select(PersonnelFR_SQL)
    if name: statement = statement.where(PersonnelFR_SQL.name.contains(name)) 
    if offset: statement = statement.offset(offset)
    if limit: statement = statement.limit(limit)
    
    personnel_sql = session.exec(statement).all()
        
    return [PersonnelFR_Read.model_validate_from_sql(person_sql) for person_sql in personnel_sql]

def get_all_PersonFR_embed(session: Session) -> tuple[list[str], list[np.ndarray]]:
    """
    Returns all personnel info
    """

    personnel_sql = session.exec(select(PersonnelFR_SQL)).all()
    
    print("PERSONNEL_SQL RESULTS", len(personnel_sql))
    
    name_list, vector_list = [], []
    for person_sql in personnel_sql:
        #if type(person_sql.ave_embedding)== np.ndarray and person_sql.ave_embedding.shape == (512,):
        name_list.append(person_sql.name)
        vector_list.append(np.frombuffer(person_sql.ave_embedding, dtype=np.float32))
        
    return name_list, vector_list

def get_one_PersonFR(session: Session, name: str) -> PersonnelFR_Read | ResponseMessage:
    """
    Returns info of person with given name
    """

    person_sql = session.get(PersonnelFR_SQL, name)
    if not person_sql:
        return ResponseMessage(
            type=MessageType.error,
            message='Person with name {} does not exist!'.format(name)
        )
    
    # print(
    #         np.frombuffer(person_sql.embeddings, dtype=np.float32).reshape((-1,512)).shape if len(person_sql.embeddings) else None,
    #         np.frombuffer(person_sql.ave_embedding, dtype=np.float32).shape if person_sql.embeddings else None)
    
    return PersonnelFR_Read.model_validate_from_sql(person_sql)

def add_PersonFR(session: Session, create_person: PersonnelFR_Update, fr_manager: FRManager, check: bool = True) -> PersonnelFR_Read | ResponseMessage: 
    """
    Add record of a person to database
    Returns True on success
    """

    if check: 
        check_exist = session.get(PersonnelFR_SQL, create_person.name)
        if check_exist: 
            return ResponseMessage(
            type=MessageType.error,
            message='Person with name {} already exists in database! Please choose a different name.'.format(create_person.name)
        )

    if not create_person.images and create_person.new_image: create_person.images = [create_person.new_image]
    
    #Convert base64 img data to reference filename to img file
    create_person.images = [save_img_to_file(img, mode=0, name = create_person.name) for img in create_person.images]

    person_sql = PersonnelFR_SQL.model_validate(create_person)

    person_sql.images, embeddings_list = fr_manager.extract_embeddings_multi(person_sql.images, os.path.join(DATABASE_IMGS_DIR, person_sql.name))
    
    ave_embedding = fr_manager.get_average_embeddings(embeddings_list)

    person_sql.embeddings = np.array(embeddings_list).tobytes() 
    person_sql.ave_embedding = ave_embedding.tobytes()

    session.add(person_sql)
    session.commit()
    session.refresh(person_sql)
    
    #Convert reference filename to img file to base64 img data
    person_sql.images = [fetch_img_from_file(img, mode=0, details=person_sql.name) for img in person_sql.images]

    #print(person_sql)
    
    if ave_embedding.size != 0: fr_manager.add_to_vector_index(person_sql.name, ave_embedding)

    return PersonnelFR_Read.model_validate(person_sql)

def update_PersonFR(session: Session, name: str, update_person: PersonnelFR_Update, fr_manager=FRManager) -> list[str, PersonnelFR_Read] | ResponseMessage:
    """
    Update record of a person to database
    """

    if name != update_person.name:
        if session.get(PersonnelFR_SQL, update_person.name): return ResponseMessage(type=MessageType.error, message="Name {} already exists in database".format(update_person.name))
        rename_img_folder(name, update_person.name)
        
    person_sql = session.get(PersonnelFR_SQL, name)
    
    if not person_sql: #Post 
        return ['post', add_PersonFR(session, update_person, fr_manager, False)]
    
    img_list = []
    img_list.extend(person_sql.images)
    
    embeddings_list = []

    if update_person.images != None:
        reset_img_folder(update_person.name, remake=True)
        img_list, embeddings_list = fr_manager.extract_embeddings_multi([save_img_to_file(img, mode=0, name=update_person.name) for img in update_person.images], os.path.join(DATABASE_IMGS_DIR, update_person.name))
        ave_embedding = fr_manager.get_average_embeddings(embeddings_list)

        print("RESET IMAGES\n", len(embeddings_list))
    elif update_person.new_image:
        embeddings_list = np.frombuffer(person_sql.embeddings, dtype=np.float32).reshape((-1,512)) if person_sql.embeddings else np.empty((0, 512), dtype=np.float32)
        new_img_ref = save_img_to_file(update_person.new_image, mode=0, name=update_person.name)
        
        embeds = fr_manager.extract_embeddings(img_filepath=os.path.join(DATABASE_IMGS_DIR, update_person.name, new_img_ref))
        
        if len(embeds) == 0:
            new_embedding = np.empty((0, 512), dtype=np.float32)
        else:
            new_embedding = embeds[0]
            img_list.append(new_img_ref)
        
        if embeddings_list.shape[1] != 512 or new_embedding.shape[0] != 512: raise Exception("Embeddings of {} are of incorrect shape!".format(person_sql.name))

        embeddings_list = np.vstack((embeddings_list, new_embedding))
        ave_embedding = fr_manager.get_average_embeddings(embeddings_list)
        print("ADD IMAGES\n", embeddings_list.shape)

    #Updating person_sql in database
    update_person_data = update_person.model_dump(exclude_unset=True)
    person_sql.sqlmodel_update(update_person_data)
    person_sql.images = img_list
    person_sql.embeddings = np.array(embeddings_list).tobytes()
    person_sql.ave_embedding = np.array(ave_embedding).tobytes()
 
    session.add(person_sql)
    session.commit()
    session.refresh(person_sql)
    
    fr_manager.update_to_vector_index(name, person_sql.name, ave_embedding)
    
    person_sql = PersonnelFR_Read.model_validate(person_sql)
    person_sql.images = [fetch_img_from_file(img, mode=0, details=person_sql.name) for img in person_sql.images]
    
    return ['patch', person_sql]

def delete_PersonFR(session: Session, name: str, fr_manager: FRManager) -> ResponseMessage:
    """
    Delete record of a person to database
    """

    person_sql = session.get(PersonnelFR_SQL, name)
    if not person_sql: 
        return ResponseMessage(
            type=MessageType.error,
            message='Person with name {} does not exist!.'.format(name)
        )

    session.delete(person_sql)
    session.commit()
    reset_img_folder(name)
    fr_manager.update_to_vector_index(person_sql.name, person_sql.name, [])

    return ResponseMessage(
            type=MessageType.success,
            message='Successfully deleted record of {}'.format(name)
        )

def delete_all_PersonFR(session: Session, fr_manager: FRManager) -> ResponseMessage:
    """
    Delete all records in database
    """

    session.exec(delete(PersonnelFR_SQL))
    session.commit()
    reset_img_db([0, 1])
    fr_manager.load_vectors_from_sql([], [])

    return ResponseMessage(
            type=MessageType.success,
            message='Successfully deleted all personnel and detection records in database'
        )