import os
import shutil
import uuid
import base64
from enum import IntEnum

class Mode(IntEnum):
    database = 0
    inference = 1

INFERENCE_IMGS_DIR = 'Images/Infer'
DATABASE_IMGS_DIR = 'Images/Database'

def init_img_filesystem():
    os.makedirs(INFERENCE_IMGS_DIR, exist_ok=True)
    os.makedirs(DATABASE_IMGS_DIR, exist_ok=True)
    
def save_img_to_file(img_data_str: str, mode: Mode, name: str = '', date_str: str = '', file_uuid: str = '') -> str:
    #decoded_img = img_data_str.split(',')[1]
    
    match mode:
        case Mode.database:
            folder_path = os.path.join(DATABASE_IMGS_DIR, name)
        case Mode.inference:
            folder_path = os.path.join(INFERENCE_IMGS_DIR, date_str)
        case _:
            raise ValueError('Mode must match one of Mode Enum types!')
        
    os.makedirs(folder_path, exist_ok=True)
    
    if not file_uuid: file_uuid = uuid.uuid1().hex
    
    file_name = file_uuid + '.jpg'
    file_path = os.path.join(folder_path, file_name)
    with open(file_path, 'wb') as file:
        file.write(base64.b64decode(img_data_str.encode('utf-8')))
    
    print(file_name)
        
    return file_name

def fetch_img_from_file(img_name: str, mode: Mode, details:str) -> str:
    match mode:
        case Mode.database:
            folder_path = os.path.join(DATABASE_IMGS_DIR, details)
        case Mode.inference:
            folder_path = os.path.join(INFERENCE_IMGS_DIR, details)
        case _:
            raise ValueError('Mode must match one of Mode Enum types!')
        
    file_path = os.path.join(folder_path, img_name)
    if not os.path.exists(file_path): 
        raise FileNotFoundError('Image with path {} does not exist!'.format(file_path))
        
    with open(file_path, 'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')
    
def rename_img_folder(old_name: str, new_name: str) -> None:
    old_folder_path = os.path.join(DATABASE_IMGS_DIR, old_name)
    new_folder_path = os.path.join(DATABASE_IMGS_DIR, new_name)
    
    os.rename(old_folder_path, new_folder_path)
    return None
    
def reset_img_folder(name: str, remake: bool = False) -> None:
    folder_path = os.path.join(DATABASE_IMGS_DIR, name)
    if os.path.isdir(folder_path): shutil.rmtree(folder_path)
    
    if remake: os.mkdir(folder_path)
    return None
    
def reset_img_db(modes: list[Mode]) -> None:
    if Mode.database in modes:
        shutil.rmtree(DATABASE_IMGS_DIR)
        os.mkdir(DATABASE_IMGS_DIR)
        
    if Mode.inference in modes:
        shutil.rmtree(INFERENCE_IMGS_DIR)
        os.mkdir(INFERENCE_IMGS_DIR)
        
    return None