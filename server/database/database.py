from sqlmodel import Session, SQLModel, create_engine
from pydantic import BaseModel
from enum import Enum
    
class MessageType(str, Enum):
    error = 'error'
    warning = 'warning'
    info = 'info'
    success = "success"

class ResponseMessage(BaseModel):
    type: MessageType
    message: str

sqlite_file_name = "frdatabase.db"
sqlite_url = "sqlite:///{}".format(sqlite_file_name)

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

#SQLModel.metadata.create_all(engine)

def get_session(): 
    with Session(engine) as session: yield session
    
