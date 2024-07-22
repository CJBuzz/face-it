"use client";
import { Carousel } from "@mantine/carousel";
import {
  ActionIcon,
  Box,
  Center,
  Group,
  Image,
  Overlay,
  Skeleton,
  Space,
  TextInput,
  Title,
  Tooltip,
  useMatches,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import "@mantine/carousel/styles.css";
import ImgDropzone from "@/components/misc/Dropzone";
import { FileWithPath } from "@mantine/dropzone";
import { fetchAPI, useAPI } from "@/utils/api";
import { useRouter } from "next/navigation";

// const tempData = {
//   name: "Really Really Long Name of Person",
//   image_data: [
//     // "/faces/CPT Yeo Wei Teck Victor/CPT VICTOR.jpg",
//     // "/faces/CPT Yeo Wei Teck Victor/CPT VICTOR.jpg",
//     // "/Height&Angle - Copy.jpg",
//     // "/faces/CPT Yeo Wei Teck Victor/CPT VICTOR.jpg",
//     // "/faces/CPT Yeo Wei Teck Victor/CPT VICTOR.jpg",
//     // "/Height&Angle - Copy.jpg",
//   ],
// };

interface ImageCarouselSlide {
  idx: number;
  image_b64: string;
  handleRemoveImage: (value: number) => void;
  isEditing: boolean;
  carouselSlideHeight: number
}


const ImageCarouselSlide = ({
  idx,
  image_b64,
  handleRemoveImage,
  isEditing,
  carouselSlideHeight
}: ImageCarouselSlide) => {
  const image_url = `data:image/jpg;base64, ${image_b64}`; //For actual use
  //const image_url = image_b64;

  return (
    <Carousel.Slide>
      <Center>
        <Box pos="relative" w={250}>
          {isEditing && (
            <Overlay backgroundOpacity={0.7}>
              <Center h={carouselSlideHeight}>
                <ActionIcon
                  size={60}
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemoveImage(idx)}
                >
                  <IconTrash size={40} />
                </ActionIcon>
              </Center>
            </Overlay>
          )}
          <Image
            maw={250}
            h={carouselSlideHeight}
            src={image_url}
            alt={"Image Not Available"}
            fit="contain"
          />
        </Box>
      </Center>
    </Carousel.Slide>
  );
};

const page = ({ params }: { params: { name: string } }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [apiName, setApiName] = useState<string>(params.name.replaceAll('%2B', '+'))
  const [imgList, setImgList] = useState<string[]>([]);

  const carouselWidth = useMatches({ xl: 1200, lg: 900, md: 700, sm: 400, base: 250 })
  const textInputWidth = useMatches({ sm: 300, base: 200 })
  const carouselSlideHeight = useMatches({ md: 300, base: 250 });
  const carouselRelativeSlideSize = useMatches({
    lg: "35%",
    base:"50%"
  })

  const {isPending, responseData} = useAPI({url: `/FR/person?name=${params.name.replaceAll('%2B', '+')}&exact_match=True`, method: "GET"})
  const router = useRouter()

  useEffect(() => {
    if (!isPending && responseData?.length === 0) throw Error('404 not found')
    setImgList(responseData?.[0]?.images || [])
    setName(responseData?.[0]?.name || "")
  }, [isPending])

  const callEditFetchAPI = async () => {
    //console.log(imgList)
    const response = await fetchAPI({url: `/FR/person?name=${apiName}`, 
      method: "PATCH", 
      body: {
        name: name,
        images: imgList
      }})
    setApiName(response?.name || apiName)
  }

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) callEditFetchAPI()
  };

  const handleRemoveImage = (idx_to_remove: number) => {
    setImgList(imgList.filter((img, img_idx) => img_idx !== idx_to_remove));
  };

  const handleUpload = (value: FileWithPath[]) => {
    value.forEach((imgFile, _) => {
      const reader = new FileReader();
      const filepattern = /^(.+?)( \(\d+\))?( - Copy)?(\.[^.]+)?$/;
      const match = imgFile.name.match(filepattern);

      reader.onload = async (readerEvent: ProgressEvent<FileReader>) => {
        console.log(match);
        if (typeof readerEvent.target?.result !== "string" || !match?.[1])
          return;
        setImgList([...imgList, readerEvent.target.result.split(",")[1]]);
      };

      reader.readAsDataURL(imgFile);
    });
  };

  const handleRemovePersonnel = () => {
    fetchAPI({url: `/FR/person?name=${apiName}`, 
      method: "DELETE"})
    router.push('/database')
  }

  useEffect(() => {
    console.log(imgList);
  }, [imgList]);

  return (
    <>
      <Group justify="space-between">
        {isEditing ? (
          <TextInput
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            w={textInputWidth}
          />
        ) : (
          isPending ? <Skeleton h={20} w={200} animate/>: <Title order={5}>{name}</Title>
        )}
        <Box>
          <Tooltip label="Edit">
            <ActionIcon
              variant={isEditing ? "light" : "subtle"}
              color="green"
              size={40}
              onClick={handleToggleEdit}
            >
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" size={40} onClick={handleRemovePersonnel}>
              <IconTrash />
            </ActionIcon>
          </Tooltip>
        </Box>
      </Group>
      <Space h={20} />
      <Center>
        {(isPending ? <Skeleton animate w={carouselWidth} h={300}/>: (isEditing || imgList.length !== 0 ) && <Carousel //CAROUSEL HAS A PROBLEM FOR SOME REASON
          dragFree
          slideSize={carouselRelativeSlideSize}
          slideGap="md"
          //loop
          w={carouselWidth}
        >
          {imgList.map((img_b64, idx) => (
            <ImageCarouselSlide
              key={`Image Carousel Slide ${idx}`}
              idx={idx}
              image_b64={img_b64}
              handleRemoveImage={handleRemoveImage}
              isEditing={isEditing}
              carouselSlideHeight={carouselSlideHeight}
            />
          ))}
          {isEditing && (
            <Carousel.Slide>
              <Center>
                <Box w={250} >
                <ImgDropzone
                  multiple={true}
                  setImgFile={handleUpload}
                  titleText="Upload Photos"
                  subtitleText={name}
                  center={true}
                  h={carouselSlideHeight}
                />
                </Box>
              </Center>
            </Carousel.Slide>
          )}
        </Carousel>)}
      </Center>
    </>
  );
};

export default page;
