import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Box, Card, Center, Image, Skeleton, Text } from "@mantine/core";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import "@mantine/carousel/styles.css";
import { useAPI } from "@/utils/api";
import { IconPhotoOff } from "@tabler/icons-react";

interface Offset {
  currPX: number;
  direction: number;
}

interface PersonCardProps {
  bColor: string;
  score: number;
  name: string;
}

const PersonCard = ({ bColor, score, name }: PersonCardProps) => {
  const scrollingTextRef = useRef<HTMLParagraphElement | null>(null);
  const [offset, setOffset] = useState<Offset>({ currPX: -5, direction: -1 });
  const { isPending, responseData } = useAPI({
    url: `/FR/person?name=${name.replaceAll(" ", "+")}&exact_match=True`,
    method: "GET",
  });

  const imgSrcs: string[] = responseData?.[0]?.images || [];

  // useEffect(() => {
  //   console.log(responseData)
  // }, [imgSrcs])

  useLayoutEffect(() => {
    const orgWidth: number = scrollingTextRef.current?.scrollWidth || 0;
    const displayWidth: number = scrollingTextRef.current?.offsetWidth || 88;
    const excess: number = Math.max(orgWidth - displayWidth, 0);

    const slide = () => {
      setOffset((prev: Offset) => {
        const newDir =
          prev.currPX < -4 || prev.currPX > excess + 4
            ? -1 * prev.direction
            : prev.direction;

        return { currPX: prev.currPX + newDir * 2, direction: newDir };
      });
    };

    const slideInterval = excess > 0 && setInterval(slide, 100);

    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, []);

  return (
    <Card withBorder bd={`2px solid ${bColor}`} pt={4} w={100}>
      <Text ta="center">{score.toFixed(3)}</Text>
      <Card.Section>
        {isPending ? (
          <Skeleton h={120} w={110} animate />
        ) : responseData === 404 ? (
          <Center h={120}>
            <IconPhotoOff size={50} />
          </Center>
        ) : (
          <Carousel h={120} dragFree slideSize="100%" withControls={false}>
            {imgSrcs.map((imgSrc, index) => (
              <CarouselSlide key={`Carousel Slide ${index}`}>
                <Image
                  key={index}
                  src={`data:image/jpg;base64, ${imgSrc}`}
                  h={120}
                  w={110}
                  fit="cover"
                  alt="Image Failed to Load"
                />
              </CarouselSlide>
            ))}
          </Carousel>
        )}
      </Card.Section>

      <Card.Section p={6}>
        <Box style={{ overflowX: "hidden" }}>
          <Text
            ref={scrollingTextRef}
            ta="center"
            size="xs"
            ml={-1 * offset.currPX}
            style={{
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Text>
        </Box>
      </Card.Section>
    </Card>
  );
};

export default PersonCard;
