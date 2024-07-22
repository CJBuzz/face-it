import { getColor } from "@/utils/misc"
import { Box, Indicator } from "@mantine/core"

interface FaceBoundingBoxProps {
    bbox: number[]
    idx: number
    score: number
    imageHeight: number
    imageNaturalHeight: number
    handleSelect: (value: number) => void
}

const FaceBoundingBox = ({bbox, idx, score, imageHeight, imageNaturalHeight, handleSelect}: FaceBoundingBoxProps) => {
    const x = bbox[0] * imageHeight / imageNaturalHeight
    const y = bbox[1] * imageHeight / imageNaturalHeight
    const h = (bbox[3] - bbox[1]) * imageHeight / imageNaturalHeight
    const w = (bbox[2] - bbox[0]) * imageHeight / imageNaturalHeight
    
    const color = getColor(score)
    
    return <Box onClick={() => handleSelect(idx+1)} pos='absolute' left={x} top={y} h={h} w={w}>
                <Indicator inline label={(idx+1).toString()} size={16} color={color} processing>    
                    <Box h={h} w={w} bd={`3px solid ${color}`}/>
                </Indicator>
            </Box>
}

export default FaceBoundingBox