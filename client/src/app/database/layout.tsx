"use client";
import {
  ActionIcon,
  Anchor,
  Box,
  Divider,
  Group,
  ScrollArea,
  TextInput,
  useMatches,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResponsiveTitle from "@/components/misc/ResponsiveTitle";

const DatabaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [inputValue, setInputValue] = useState<string>("");
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
      console.log(inputValue); //Call submit API here
    }
  };

  const handleSearch = () => {
    router.push(`/database/search/${inputValue.replaceAll(' ', '+').toUpperCase().trim()}`);
  };

  return (
    <>
      <Group justify="Space-between" mb={10}>
        <Anchor href="/database" underline="never" c="gray">
          <ResponsiveTitle order={3} mobilesize="h4">
            Personnel
          </ResponsiveTitle>
        </Anchor>
        <TextInput
          placeholder="Search Name"
          w={searchBarWidth}
          leftSection={
            <ActionIcon
              aria-label="Search"
              variant="subtle"
              color="rgb(140, 140, 140)"
              onClick={handleSearch}
            >
              <IconSearch size={16} />
            </ActionIcon>
          }
          onChange={(event) => setInputValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
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

export default DatabaseLayout;
