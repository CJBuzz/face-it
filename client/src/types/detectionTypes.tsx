export interface BoundingBoxes {
    id: string
    bbox: number[]
    names: string[]
    probs: number[]
  }
  
export interface DetectionResults {
    id: string;
    date_time: string;
    image_data: string;
    bboxes: BoundingBoxes
  }

export interface PersonResults {
    probs: number
    name: string
}