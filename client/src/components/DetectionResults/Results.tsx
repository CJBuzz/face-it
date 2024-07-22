import { Group, ScrollArea } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import PersonGroup from "./PersonGroup";
import { BoundingBoxes, PersonResults } from "@/types/detectionTypes";

interface ResultsProps {
  selected: number;
  handleSelect: (value: number) => void;
  bboxes: BoundingBoxes[]
}

const Results = ({ selected, handleSelect, bboxes }: ResultsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [reformattedResults, setReformattedResults] = useState<PersonResults[][]>([])
  const [prevSelected, setPrevSelected] = useState<number>(selected)

  const handleScroll = (index: number) => {
    //console.log(index)

    if (!scrollContainerRef.current) return;
    const tgtElement =
      scrollContainerRef.current.children[0].children[0].children[0].children[
        index
      ];
    // if (adjust)
    //   tgtElement.scrollIntoView({
    //     behavior: "smooth",
    //     inline: "nearest",
    //   });

    setTimeout(() => {
      tgtElement?.scrollIntoView({
        behavior: "smooth",
        inline: "start",
      });
    }, 400);
  };

  useEffect(() => {
    setReformattedResults(
    bboxes.map((bbox, _idx) => 
      bbox['names'].map((name, pers_idx) => {
        return {'probs': bbox['probs'][pers_idx],
        'name': name
          }      
        })
    )  )
  }, [])

  useEffect(() => {
    //Have to put into useEffect so that it detects change in selected state when that change is precipitated by clicking on the bounding box of the face in the image
    setTimeout(() => {
      //if selected is 0, it means that the user is closing the hidden persons, so need to check prevSelected to determine the target and scroll there
      handleScroll(selected ? selected-1 : prevSelected - 1);
    }, 400);
    setPrevSelected(selected)
  }, [selected])

  return (
    <ScrollArea
      scrollbars="x"
      offsetScrollbars
      scrollbarSize={5}
      scrollHideDelay={0}
      ref={scrollContainerRef}
    >
      <Group wrap="nowrap">
        {reformattedResults.map((_value, idx) => {
          return (
            <>
              <PersonGroup
                key={`Person Group ${idx + 1}`}
                curr_selected={selected}
                id={idx + 1}
                handleSelect={handleSelect}
                persGroup = {reformattedResults[idx]}
              />
            </>
          );
        })}
      </Group>
    </ScrollArea>
  );
};

export default Results;
