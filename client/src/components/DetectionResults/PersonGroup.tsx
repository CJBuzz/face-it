import { Button, Flex, Group, Indicator, Transition } from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import React from "react";
import PersonCard from "./PersonCard";
import { PersonResults } from "@/types/detectionTypes";
import {getColor} from "@/utils/misc";

interface PersonGroupProps {
  curr_selected: number;
  id: number;
  handleSelect: (index: number) => void;
  persGroup: PersonResults[]
}

interface HiddenPersonCardsProps {
  isOpen: boolean;
  hiddenPersons: PersonResults[]
  personGroupId: number 
}

const HiddenPersonCards = ({ isOpen, hiddenPersons, personGroupId }: HiddenPersonCardsProps) => {
  return (
    <Transition
      mounted={isOpen}
      transition="slide-right"
      duration={400}
      timingFunction="ease"
    >
      {(styles) => (
        <Group style={styles} wrap="nowrap" ml={20}>
          {hiddenPersons.map((person, idx) => {
            const score = person['probs'];
           
            return (
              <PersonCard
              key={`Person Card of ${person['name']}, ${idx} of Person Group ${personGroupId}`}
                bColor={`rgb(${255 * (1 - score)}, 20, ${255 * score})`}
                name={person['name']}
                score={score}
              ></PersonCard>
            );
          })}
        </Group>
      )}
    </Transition>
  );
};

const PersonGroup = ({
  curr_selected,
  id,
  handleSelect,
  persGroup
}: PersonGroupProps) => {
  const isSelected: boolean = curr_selected === id;
  const score = persGroup[0]['probs']
  const color: string = getColor(score);

  const handleButtonClick = () => {
    // if (isSelected) setSelected(0);
    // else setSelected(id);

    // setTimeout(() => {
    //   handleScroll(id - 1, id > curr_selected && curr_selected !== 0);
    // }, 400);
    handleSelect(id);
  };

  return (
    <Indicator
      inline
      label={id.toString()}
      color={color}
      withBorder
      size={20}
      mt={20}
    >
      <Flex p={1} bd={isSelected ? `2px dashed grey` : `2px solid ${color}`}>
        <PersonCard
          bColor={isSelected ? color : "transparent"}
          name={persGroup[0]['name']}
          score={score}
        />
        <HiddenPersonCards isOpen={isSelected} hiddenPersons={persGroup.slice(1)} personGroupId={id}/>
        <Button
          variant="light"
          p={0}
          pr={3}
          pl={3}
          m={0}
          h={180}
          color={isSelected ? "grape" : "blue"}
          style={{
            borderRadius: 0,
          }}
          onClick={handleButtonClick}
        >
          {isSelected ? (
            <IconLayoutSidebarLeftCollapse size={14} />
          ) : (
            <IconLayoutSidebarLeftExpand size={14} />
          )}
        </Button>
      </Flex>
    </Indicator>
  );
};

export default PersonGroup;
