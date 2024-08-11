"use client";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  ActionIcon,
  Image,
  Group,
  Stack,
  Title,
  Tooltip,
  Box,
  Text,
  Center,
  Space,
  CloseButton,
  ScrollArea,
  useMatches,
  Loader,
  Flex,
} from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";

import { IconClearAll, IconUpload } from "@tabler/icons-react";

import ImgDropzone from "@/components/misc/Dropzone";
import { fetchAPI } from "@/utils/api";

interface ImgFile {
  name: string;
  image_data: string;
}

interface ImgFileForSubmit {
  name: string;
  images_data: string[];
}

interface ImagePreviewProps {
  imgFile: ImgFile;
  idx: number;
}

type Action =
  | {
      type: "add";
      payload: ImgFile;
    }
  | {
      type: "remove";
      payload: number;
    }
  | {
      type: "reset";
    };

const initialImgFilesState: ImgFile[] = [];

const imgFilesReducer = (state: ImgFile[], action: Action): ImgFile[] => {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return state.filter((_, index) => index !== action.payload);
    case "reset":
      return initialImgFilesState;
    default:
      return initialImgFilesState;
  }
};

const Page = () => {
  const [imgFiles, dispatch] = useReducer(
    imgFilesReducer,
    initialImgFilesState
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const sideGroupRef = useRef<HTMLDivElement>(null);
  const [imagePreviewMaxWidth, setImagePreviewMaxWidth] = useState<number>(200);

  const [imgUploaded, setImgUploaded] = useState<boolean[]>([]);

  const isUploadPending: boolean =
    imgUploaded.length !== 0 && !imgUploaded.every(Boolean);

  const imageCountPadding = useMatches({ base: 5, md: 20 });

  const handleUpload = (value: FileWithPath[]) => {
    value.forEach((imgFile, _) => {
      const reader = new FileReader();
      const filepattern = /^(.+?)( \(\d+\))?( - Copy)?(\.[^.]+)?$/;
      const match = imgFile.name.match(filepattern);

      reader.onload = async (readerEvent: ProgressEvent<FileReader>) => {
        //console.log(match);
        if (typeof readerEvent.target?.result !== "string" || !match?.[1])
          return;
        dispatch({
          type: "add",
          payload: {
            name: match[1],
            image_data: readerEvent.target.result.split(",")[1],
          },
        });
      };

      reader.readAsDataURL(imgFile);
    });
  };

  const callFetchAPI = async (imgFile: ImgFileForSubmit, reqIdx: number) => {
    try {
      await fetchAPI({
        url: `/FR/person?name=${imgFile.name}`,
        method: "PATCH",
        body: {
          name: imgFile.name.toUpperCase().replaceAll("%2B", "+"),
          new_images: imgFile.images_data,
        },
      });
    } finally {
      setImgUploaded((prev) =>
        prev.map((status, idx) => (idx === reqIdx ? true : status))
      );
    }
  };

  const handleSubmit = () => {
    const groupedImgFiles: ImgFileForSubmit[] = [];
    imgFiles.forEach((imgFile) => {
      const i = groupedImgFiles.findIndex(
        (groupedImgFile) => groupedImgFile.name === imgFile.name
      );

      if (i === -1)
        groupedImgFiles.push({
          name: imgFile.name,
          images_data: [imgFile.image_data],
        });
      else {
        groupedImgFiles[i].images_data.push(imgFile.image_data);
      }
    });
    setImgUploaded(new Array(groupedImgFiles.length).fill(false));

    groupedImgFiles.map((groupedImgFile, idx) => {
      //Add some features to track upload
      callFetchAPI(groupedImgFile, idx);
    });
    dispatch({ type: "reset" });
    return;
  };

  const handleResize = () => {
    setImagePreviewMaxWidth(
      (containerRef.current?.offsetWidth || 200) -
        (sideGroupRef.current?.offsetWidth || 0) -
        50
    );
  };

  const ImagePreview = ({ imgFile, idx }: ImagePreviewProps) => {
    const imgUrl = `data:image/jpg;base64, ${imgFile.image_data}`;

    return (
      <Box>
        <Flex justify="center">
          <Space w={16} />
          <Center pos="relative">
            <Image src={imgUrl} h={100} w="auto" fit="contain" />
          </Center>
          <CloseButton
            size="sm"
            variant="transparent"
            onClick={() => dispatch({ type: "remove", payload: idx })}
          />
        </Flex>
        <Space h="sm" />
        <Text
          ta="center"
          size="sm"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {imgFile.name}
        </Text>
      </Box>
    );
  };

  useEffect(() => {
    handleResize();
  }, [imgFiles]);

  useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ImgDropzone
        multiple={true}
        setImgFile={handleUpload}
        titleText="Upload a photo to include in Personnel Records"
        subtitleText="Drag images here or click to select files"
      />
      <Group
        justify="space-between"
        gap="sm"
        m={20}
        wrap="nowrap"
        ref={containerRef}
      >
        <ScrollArea
          scrollbars="x"
          offsetScrollbars={true}
          scrollbarSize={5}
          scrollHideDelay={0}
        >
          <Group wrap="nowrap" maw={imagePreviewMaxWidth}>
            {imgFiles.slice(0, 50).map((imgFile, idx) => (
              <ImagePreview
                key={"ImagePreview" + idx}
                idx={idx}
                imgFile={imgFile}
              />
            ))}
          </Group>
        </ScrollArea>
        <Group ref={sideGroupRef}>
          <Tooltip label="Preview only shows first 50 images">
            <Title p={imageCountPadding}>{imgFiles.length}</Title>
          </Tooltip>

          <Stack gap={0}>
            <Tooltip label="Submit">
              <ActionIcon
                variant="subtle"
                color="green"
                size="lg"
                aria-label="Submit"
                pt={30}
                pb={30}
                onClick={handleSubmit}
              >
                {isUploadPending ? (
                  <Loader color="green" type="bars" size="sm" />
                ) : (
                  <IconUpload />
                )}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Clear All">
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                aria-label="Clear All"
                pt={30}
                pb={30}
                onClick={() => dispatch({ type: "reset" })}
              >
                <IconClearAll />
              </ActionIcon>
            </Tooltip>
          </Stack>
        </Group>
      </Group>
    </>
  );
};

export default Page;
