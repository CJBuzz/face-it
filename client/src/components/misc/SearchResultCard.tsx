"use client";
import { Box, Card, Image, Space, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import React from "react";

interface SearchResultCardProps {
  label: string;
  image_b64: string;
  h: number;
  w: number;
  redirect_url: string | null;
}

const SearchResultCard = ({
  label,
  image_b64,
  h,
  w,
  redirect_url,
}: SearchResultCardProps) => {
  const image_url = `data:image/jpg;base64, ${image_b64}`; //For actual use
  //const image_url = image_b64; //test
  const { hovered, ref } = useHover();
  const sidePadding = hovered ? 0 : 5;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!redirect_url) {
      e.preventDefault();
      console.log("here!!");
      return false;
    }
  };

  return (
    <Box ref={ref} pr={sidePadding} pl={sidePadding}>
      <Card
        w={hovered ? w + 10 : w}
        p="xs"
        component="a"
        href={`${redirect_url || "#"}`}
        onClick={handleClick}
      >
        <Card.Section>
          <Image src={image_url} alt="Image Not Avaibable" fit="cover" h={h} />
        </Card.Section>
        <Space h={5} />
        <Text ta="center" size="sm">
          {label}
        </Text>
      </Card>
    </Box>
  );
};

export default SearchResultCard;
