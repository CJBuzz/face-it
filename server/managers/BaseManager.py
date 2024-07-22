from PIL import Image
import numpy as np

class BaseManager():
    def __init__(self, **kwargs): 
        """
        Loads CV Model
        Necessary configurations will be in arbitrary keyword arguments customised to the needs of each model
        """

        pass

    def infer(self, **kwargs):
        """
        Model conducts inference on data
        """
        raise NotImplemented
    

