'use client'
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Image, CloseButton, Box, Flex, Divider, useMatches, Skeleton } from "@mantine/core";
import { IconReportSearch } from "@tabler/icons-react";

import Results from "@/components/DetectionResults/Results";
import { BoundingBoxes } from "@/types/detectionTypes";
import FaceBoundingBox from "@/components/DetectionResults/BoundingBox";
import { useAPI } from "@/utils/api";

const page = ({params}: {params: {id: string}}) => {
    const [selectedFace, setSelectedFace] = useState<number>(0);
    const [boundingBoxes, setBoundingBoxes] = useState<BoundingBoxes[] | null>(null)
    const [img, setImg] = useState<string | null>(null)

    const {isPending, responseData} = useAPI({url: `http://127.0.0.1:8000/FR/detection?id=${params.id}`, method: "GET"})
    const imageRef = useRef<HTMLImageElement | null>(null)

    const [imageHeights, setImageHeights] = useState<[number, number]>([100, 100])
    const imgObjHeight = useMatches({ base: "200", md: "300", xl: "400" })

    const handleChangeSelection = (target_id: number) => {
        if (selectedFace === target_id) setSelectedFace(0);
        else setSelectedFace(target_id);
      }

    const handleResize = () => {
        if (!imageRef.current) return;
        setImageHeights([imageRef.current.height, imageRef.current.naturalHeight])
      }

    useEffect(() => {
        if (isPending) return;
        if (!isPending && responseData?.length === 0) throw Error('404 not found')
        setImg(responseData?.[0]?.image_data || '')
        const loadedBBoxes: BoundingBoxes[] = responseData?.[0]?.bboxes
        setBoundingBoxes([...loadedBBoxes])
      }, [isPending])

    useLayoutEffect(() => {
        handleResize()
    }, [img])

    useLayoutEffect(() => {
        window.addEventListener('resize', handleResize)
    
        return () => window.removeEventListener('resize', handleResize)
      }, [])

  return (
    <>
        <Flex justify="center">
          {isPending ? <Skeleton h={imgObjHeight} w={imgObjHeight} animate /> : 
            <Box pos='relative'>
                {boundingBoxes &&
                boundingBoxes.map((bbox, idx) => imageRef.current && <FaceBoundingBox 
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
                    src={`data:image/jpg;base64, ${img}`}
                    h={imgObjHeight}
                    w="auto"
                    fit="contain"
                />
            </Box>}
        </Flex>
        <Divider
            mt="md"
            bd='transparent'
            label={
                <>
                <IconReportSearch size={16} /> <Box ml={5}>Results</Box>
                </>
            }
        />
      {!isPending && boundingBoxes && <Results selected={selectedFace} handleSelect={handleChangeSelection} bboxes={boundingBoxes}/>}
    </>
  );
};

export default page;