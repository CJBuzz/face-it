"use client";
import {
  ActionIcon,
  Anchor,
  Box,
  Divider,
  Group,
  ScrollArea,
  useMatches,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResponsiveTitle from "@/components/misc/ResponsiveTitle";

import '@mantine/dates/styles.css'
import { DatePickerInput } from "@mantine/dates";
import { getDateStr } from "@/utils/misc";

const HistoryLayout = ({ children }: { children: React.ReactNode }) => {
  const [inputValue, setInputValue] = useState<[Date | null, Date | null]>([null, null]);
  const [resultsHeight, setResultsHeight] = useState<number>(1000);
  const router = useRouter();
  const searchBarWidth = useMatches({
    base:200,
    sm:300
  })

  useEffect(() => {
    setResultsHeight(window.innerHeight - 140);
    const handleResize = () => {
      setResultsHeight(window.innerHeight - 140);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener('resize', handleResize)
  }, []);

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === "Enter") {
  //     event.preventDefault();
  //     handleSearch();
  //     console.log(inputValue); //Call submit API here
  //   }
  // };

  const handleSearch = () => {
    const dateRange : string | null = (inputValue[0] && inputValue [1]) ? getDateStr(inputValue[0]) + "-" + getDateStr(inputValue[1]) : null
    dateRange && console.log(dateRange)
    router.push(`/history/search/${dateRange}`);
  };

  return (
    <>
      <Group justify="Space-between" mb={10}>
        <Anchor href="/database" underline="never" c="gray">
          <ResponsiveTitle order={3} mobilesize="h4">
            History
          </ResponsiveTitle>
        </Anchor>
        <DatePickerInput
          type='range'
          placeholder="Pick Dates Range"
          w={searchBarWidth}
          leftSection={
            <ActionIcon
              aria-label="Search"
              variant="subtle"
              color="rgb(140, 140, 140)"
              onClick={handleSearch}
            >
              <IconCalendar size={16} />
            </ActionIcon>
          }
          value={inputValue}
          onChange={setInputValue}
          allowSingleDateInRange
          //onKeyDown={handleKeyDown}
        />
      </Group>
      <Divider />
      <ScrollArea
        scrollbars="y"
        offsetScrollbars={true}
        scrollbarSize={5}
        scrollHideDelay={0}
        h={resultsHeight}
      >
        <Box m={20}>{children}</Box>
      </ScrollArea>
    </>
  );
};

export default HistoryLayout;
