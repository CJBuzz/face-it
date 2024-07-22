import os
import warnings
import io

from insightface.app import FaceAnalysis
from voyager import Index, Space
import numpy as np
from PIL import Image, ImageOps
import torch

from .BaseManager import BaseManager

class FRManager(BaseManager):
    DEFAULT_EMBEDDING_CACHE_PATH = '../temp/vectors_cache.npy'

    def __init__(self, 
                 embedding_filepath: str = DEFAULT_EMBEDDING_CACHE_PATH, 
                 sql_personnel: tuple[list[str], list[np.ndarray]] = ([], []),
                 use_average: bool = False):
        """ 
        Loads FR Model and Voyager Vector Index (pre-load)

        REPLACE DATA WITH SQLITE DATABASE
        """  

        provider: str = 'CUDAExecutionProvider' if torch.cuda.is_available() else 'CPUExecutionProvider'
        
        self.model = FaceAnalysis(providers=[provider])
        self.model.prepare(ctx_id=0)

        self.vector_index = Index(Space.Cosine, num_dimensions=512)
        self.name_list = []
        self.deleted_ids = []
        #self.vector_index, self.name_list = self.load_vectors_from_npy(embedding_filepath, use_average)
        self.load_vectors_from_sql(sql_personnel[0], sql_personnel[1])


    def load_vectors_from_npy(self, filepath:str, use_average: bool = True) -> None:
        """
        Load embeddings from a .npy file into Voyager Vector Index
        """
               
        if not os.path.exists(filepath): 
            warnings.warn("WARNING: {} not found! Returning empty vector index!")
            return None
                                                                 
        embedding_dict = np.load(filepath, allow_pickle=True).item()

        if use_average: 
            for name, em_list in embedding_dict.items():
                self.name_list.append(name)
                self.vector_index.add_item(sum(em_list)/len(em_list))
        else: 
            for name, em_list in embedding_dict.items():
                for em in em_list:
                    self.name_list.append(name)
                    self.vector_index.add_item(em) 

        print("Vector index created! ({})".format("average" if use_average else "complete"))

        return None
    
    def load_vectors_from_sql(self, name_list: list[str], vector_list = list[np.ndarray], reset: bool = False) -> None:
        """
        Load embeddings from a personnel SQL database into Voyager Vector Index
        """
        
        if reset: self.vector_index = Index(Space.Cosine, num_dimensions=512)
        
        if len(vector_list): 
            self.vector_index.add_items(np.array(vector_list))
        
        self.name_list = name_list
        
        #print("Initialised NAME LIST: ", name_list[0], vector_list[0])
        
        return None
    
    def add_to_vector_index(self, name: str, ave_embedding: np.ndarray | None ) -> None:
        """
        Add an embedding into vector index
        """
        
        if not len(ave_embedding): return None

        self.vector_index.add_item(ave_embedding)
        self.name_list.append(name)
        
        print("NAME LIST LENGTH: ", len(self.name_list), self.name_list)
        print("VECTOR LIST LENGTH: ", len(self.vector_index))

        return None
    
    def update_to_vector_index(self, name: str, new_name: str, ave_embedding: np.ndarray) -> None:
        """
        Update an embedding in/remove an embedding from vector index
        """
        
        try: idx = self.name_list.index(name)
        except ValueError: 
            return self.add_to_vector_index(new_name, ave_embedding)
        
        if len(ave_embedding) == 0:
            if idx not in self.deleted_ids: 
                self.vector_index.mark_deleted(idx)
                self.deleted_ids.append(idx)
                print("MARK DELETED: {}".format(new_name))
        else:
            self.vector_index.add_item(ave_embedding, idx)
            if idx in self.deleted_ids:
                print("DELETED index: ", idx)
                self.deleted_ids.remove(idx)
                print("UNMARK DELETED: {}".format(new_name))

            
        self.name_list[idx] = new_name
        
        print("NAME LIST LENGTH: ", len(self.name_list), self.name_list)
        print("VECTOR LIST LENGTH: ", len(self.vector_index))
        
        return None
        
    
    def get_average_embeddings(self, embedding_list: list[np.ndarray] | np.ndarray) -> np.ndarray:
        """
        Returns the average of the embeddings
        """
        if len(embedding_list) == 0: return np.array([])
        return sum(embedding_list)/len(embedding_list)
    
    def extract_embeddings(
            self, 
            img: Image.Image | np.ndarray | bytes | None = None,
            img_filepath: str | None = None,
            max_face: int = 1
        ) -> list[np.ndarray]:
        """
        Extract embeddings either from image data or image filepath

        Arguments
        img: image data either in PIL Image, Numpy array or bytes data
        img_filepath: path to image file
        max_face: enforce maximum number of embeddings; if max_face = -1, there will be no enforcement
        """
        if not max_face: return []

        if not (img or img_filepath): raise Exception("Please provide either img or img_filepath")

        if not img and not os.path.exists(img_filepath):
            raise FileNotFoundError("Image filepath {} provided not found!".format(img_filepath))
        
        if not img: img = Image.open(img_filepath).convert('RGB')

        if type(img) == bytes: img = Image.open(io.BytesIO(img)).convert('RGB')

        if type(img) == Image.Image: img = np.array(img)

        faces = self.model.get(img)
        if max_face != -1: faces = faces[:max_face]

        print("\n EMBEDDINGS EXTRACTED \n")
        return [face.embedding for face in faces]
    
    def extract_embeddings_multi(self, img_list: list[str], folder_path: str, max_face: int = 1) -> tuple[list[str], list[np.ndarray | list[np.ndarray]]]:
        """
        Extract embeddings given a list of images
        """
        validated_img_list = []
        embeddings_list = []
        for img in img_list:
            embeds = self.extract_embeddings(img_filepath=os.path.join(folder_path, img), max_face=max_face)
            if len(embeds) == 0: continue
            
            validated_img_list.append(img)
            if max_face == 1: 
                embeddings_list.append(embeds[0])
            else: 
                embeddings_list.append(embeds)
        
        return validated_img_list, embeddings_list
                        
    def infer(self, img_filepath: str | None = None,
        img: Image.Image | np.ndarray | bytes | None = None, k: int = 1):
        """
        Conducts inference on an image
        
        Arguments:
        img_filepath: path to image file
        img: image data (PIL image, numpy array or in bytes)
        k: return k nearest neighbours
        """
        if not (img or img_filepath): raise Exception("Please provide either img or img_filepath")

        if not img and not os.path.exists(img_filepath):
            raise FileNotFoundError("Image filepath {} provided not found!".format(img_filepath))
        
        if not img: img = Image.open(img_filepath).convert('RGB')

        if type(img) == bytes: img = Image.open(io.BytesIO(img))

        if type(img) == Image.Image: img = np.array(ImageOps.exif_transpose(img))

        faces = self.model.get(img)
        embeddings_list = [face.embedding for face in faces]
        
        if len(embeddings_list) == 0: return []

        neighbours, distances = self.vector_index.query(embeddings_list, k=min(k, len(self.vector_index)))
        
        print(len(neighbours), len(distances), len(self.name_list))
        print(type(distances[0][0]))

        return [dict(face, 
                     bbox=face['bbox'].tolist(), 
                     targets=[self.name_list[neighbour_idx] for neighbour_idx in neighbours[idx]], 
                     sim_score=[float(distance) for distance in distances[idx].tolist()]
                     ) for idx, face in enumerate(faces)]