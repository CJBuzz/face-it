import { Text, Group, rem, Box, Flex } from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { useRef } from "react";

interface DropZoneProps {
  multiple: boolean;
  setImgFile: (value: FileWithPath[]) => void;
  titleText?: string;
  subtitleText?: string;
  center?: boolean;
  h?: number
}

const ImgDropzone = ({
  multiple,
  setImgFile,
  titleText = "",
  subtitleText = "",
  center = false,
  h = 220
}: DropZoneProps) => {
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const orientation: boolean = dropzoneRef.current && dropzoneRef.current.clientWidth > 400 ? true: false

  return (
    <Dropzone ref={dropzoneRef} bd='2px dashed gray' style={{ borderRadius: 10 }} h={h} accept={IMAGE_MIME_TYPE} onDrop={setImgFile} multiple={multiple}>
      <Flex
        justify="center"
        align='center'
        gap="xl"
        mih={220}
        direction = {orientation ? 'row' : 'column'}
        style={{ pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-blue-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-red-6)",
            }}
            stroke={1.5}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto
            style={{
              width: rem(52),
              height: rem(52),
              color: "var(--mantine-color-dimmed)",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>
        <Box>
          <Text size="xl" inline ta={center ? "center" : "start"}>
            {titleText}
          </Text>
          <Text
            size="sm"
            c="dimmed"
            inline
            mt={7}
            ta={center ? "center" : "start"}
          >
            {subtitleText}
          </Text>
        </Box>
      </Flex>
    </Dropzone>
  );
};

export default ImgDropzone;
