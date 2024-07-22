"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { Image, CloseButton, Box, Flex, Divider, useMatches, Skeleton } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { IconReportSearch } from "@tabler/icons-react";

import ImgDropzone from "@/components/misc/Dropzone";
import Results from "@/components/DetectionResults/Results";
import { BoundingBoxes } from "@/types/detectionTypes";
import FaceBoundingBox from "@/components/DetectionResults/BoundingBox";
import { fetchAPI } from "@/utils/api";

const App = () => {
  const [imgFile, setImgFile] = useState<FileWithPath[]>([]);
  const [selectedFace, setSelectedFace] = useState<number>(0);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxes[] | null>(null)
  const [isPending, setIsPending] = useState<boolean>(false)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const [imageHeights, setImageHeights] = useState<[number, number]>([100, 100])
  const imgObjHeight = useMatches({ base: "200", md: "300", xl: "400" })

//   const fetchAPI = async (image_data: string) => {
//     const request = new Request('http://127.0.0.1:8000/FR/detection',  {
//       method: "POST",
//       body: JSON.stringify({"image_data": image_data}),
//       headers: {
//           "Content-Type": "application/json",
//         },
//   })
//     const response = await fetch(request)
//     if (!response.ok) {
//         throw new Error(`Response status: ${response.status}. Message: ${response.json()}`)
//     }

//     const jsonData = await response.json()
//     console.log(jsonData)
//     const bboxes: BoundingBoxes[] = jsonData?.['bboxes']
//     if (bboxes) setBoundingBoxes([...bboxes])
//     handleResize()
// }   

  const callFetchAPI = async(image_data: string) => {
    const url = "http://127.0.0.1:8000/FR/detection"
    const method='POST'
    const body = {"image_data": image_data}
    const res_data = await fetchAPI({url, method, body})
    const bboxes: BoundingBoxes[] = res_data?.['bboxes']
    if (bboxes) setBoundingBoxes([...bboxes])
    handleResize()

  }

  const handleUpload = (value: FileWithPath[]) => {
    setIsPending(true)
    setImgFile(value)

    const reader = new FileReader();

    reader.onload = async (readerEvent: ProgressEvent<FileReader>) => {
      if (typeof readerEvent.target?.result !== "string") return;
      callFetchAPI(readerEvent.target.result.split(",")[1])
    };

    reader.readAsDataURL(value[0]);
    setIsPending(false)
  }

  const handleClear = () => {
    setImgFile([])
    setSelectedFace(0)
    setBoundingBoxes(null)
  }

  const handleResize = () => {
    if (!imageRef.current) return;
    setImageHeights([imageRef.current.height, imageRef.current.naturalHeight])
  }

  const handleChangeSelection = (target_id: number) => {
    if (selectedFace === target_id) setSelectedFace(0);
    else setSelectedFace(target_id);
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {imgFile.length === 0 ? (
        <ImgDropzone
          multiple={false}
          setImgFile={handleUpload}
          titleText="Upload a photo for facial recognition"
          subtitleText="Drag image here or click to select file"
        />
      ) : (
        <Flex justify="center">
          <Box pos='relative'>
            {boundingBoxes &&
            boundingBoxes?.map((bbox, idx) => imageRef.current && <FaceBoundingBox 
            key={`Bounding Box on Image ${idx+1}`}
            bbox={bbox['bbox']} 
            idx={idx} 
            score={bbox['probs'][0]}
            imageHeight={imageHeights[0]}
            imageNaturalHeight={imageHeights[1]} 
            handleSelect={handleChangeSelection}/>)
           }
          <Image
            ref={imageRef}
            src={URL.createObjectURL(imgFile[0])}
            onLoad={() => URL.revokeObjectURL(URL.createObjectURL(imgFile[0]))}
            h={imgObjHeight}
            w="auto"
            fit="contain"
          />
          </Box>
          
          <Box>
            <CloseButton size="lg" onClick={handleClear} />
          </Box>
        </Flex>
      )}
      {
        imgFile.length !== 0 && <Divider
        mt="md"
        bd='transparent'
        label={
            <>
              <IconReportSearch size={16} /> <Box ml={5}>Results</Box>
            </>
        }
      />
      }
     
      {isPending ? <Skeleton h={150} w="100%" animate />: boundingBoxes && <Results selected={selectedFace} handleSelect={handleChangeSelection} bboxes={boundingBoxes}/>}
    </>
  );
};
export default App;
