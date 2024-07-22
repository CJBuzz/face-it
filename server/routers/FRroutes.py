from fastapi import APIRouter, Depends, Query, Body, Response, HTTPException, status
from sqlmodel import Session, SQLModel
from typing import Annotated

from managers.FRManager import FRManager
from database.database import get_session, ResponseMessage, MessageType, engine
from database.Personnel import PersonnelFR_Update, PersonnelFR_Read, get_all_PersonFR, get_all_PersonFR_embed, get_one_PersonFR, add_PersonFR, update_PersonFR, delete_PersonFR, delete_all_PersonFR
from database.Detection import Detection_Create, Detection_Read, get_detections, add_detections, delete_detections, delete_all_detections

router = APIRouter(
    prefix="/FR",
    tags=["database"],     
    responses={404: {"description": "Not found"}}
)

with Session(engine) as session:
    SQLModel.metadata.create_all(engine)
    name_list, vector_list = get_all_PersonFR_embed(session)  
    print(len(name_list), len(vector_list))
    fr_manager = FRManager(sql_personnel=[name_list, vector_list])

@router.get("/")
async def test_db():
    return "HELLO THERE"

@router.get("/person/", response_model=PersonnelFR_Read | list[PersonnelFR_Read] | ResponseMessage, status_code=status.HTTP_200_OK)
async def get_person_router(
    *, 
    session: Session = Depends(get_session), 
    name: Annotated[str | None, Query(title="Name of individual")] = None,
    offset: Annotated[int | None, Query(title="Offset")] = None,
    limit: Annotated[int | None, Query(title="Limit")] = None,
    exact_match: Annotated[bool | None, Query(title="Specifiy for exact match")] = False
    ) -> list[PersonnelFR_Read] | ResponseMessage:

    if not exact_match:
        return get_all_PersonFR(session, name, offset, limit)

    res = get_one_PersonFR(session, name)

    if type(res) == ResponseMessage and res.type == MessageType.error: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.message)

    return [res]

@router.post("/person/",  response_model=PersonnelFR_Read | ResponseMessage, status_code=status.HTTP_201_CREATED)
async def post_person_router (
    *, 
    session: Session = Depends(get_session),
    person: Annotated[PersonnelFR_Update, Body(title="Details of individual")]
) -> PersonnelFR_Read | ResponseMessage: 
   
    res = add_PersonFR(session, person, fr_manager)

    if type(res) == ResponseMessage and res.type == MessageType.error: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.message)
    
    return res

@router.patch("/person/", response_model=PersonnelFR_Read | ResponseMessage, status_code=status.HTTP_200_OK)
async def patch_person_router(
    *,
    session: Session = Depends(get_session),
    name: Annotated[str, Query(title="Current Name of individual")],
    person: Annotated[PersonnelFR_Update, Body(title="Personal data to update")],
    response: Response
) -> PersonnelFR_Read | ResponseMessage:
    
    res = update_PersonFR(session, name, person, fr_manager)

    if type(res) == ResponseMessage:
        if res.type == MessageType.error: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.message)
        return res
    
    if res[0] == 'create': 
        response.status_code = status.HTTP_201_CREATED

    return res[1]

@router.delete("/person/", response_model= ResponseMessage, status_code=status.HTTP_200_OK)
async def delete_person_router(
    *, 
    session: Session = Depends(get_session),
    name: Annotated[str | None, Query(title="Name of individual")] = None
) -> ResponseMessage:
    if not name:
        return delete_all_PersonFR(session, fr_manager)
        #return res
    
    res = delete_PersonFR(session, name, fr_manager)
    if res.type == MessageType.error: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.message)
    
    return res

@router.get("/detection/", response_model=list[Detection_Read], status_code=status.HTTP_200_OK)
async def get_detections_router(
    *,
    session: Session = Depends(get_session),
    id: Annotated[str | None, Query(title="ID of detection")] = None, #not implemented yet
    dateRange: Annotated[str | None, Query(title="Date range of detection", pattern="^\d{8}-\d{8}$")] = None,
    offset: Annotated[int | None, Query(title="Offset")] = None,
    limit: Annotated[int | None, Query(title="Limit")] = None
) -> list[Detection_Read]:
    
    return get_detections(session, id, dateRange, offset, limit) 

@router.post("/detection/", response_model=Detection_Read | None, status_code=status.HTTP_201_CREATED)
async def post_detections_router(
    *, 
    session: Session = Depends(get_session),
    image: Annotated[Detection_Create, Body(title='Image Data as base64 string')],
    top_n: Annotated[int, Query(title="Returns top N matches per face")] = 10
) -> Detection_Read | None:
    
    return add_detections(session, fr_manager, image_data=image.image_data, top_n=top_n)

@router.delete("/detection/", response_model=ResponseMessage, status_code=status.HTTP_200_OK)
async def delete_detections_router(
    *, 
    session: Session = Depends(get_session),
    id: Annotated[str | None, Query(title='ID of detection')] = None,
) -> ResponseMessage:
    
    if not id: return delete_all_detections(session)
    
    res = delete_detections(session, id)
    if res.type == MessageType.error: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.message)

    return res