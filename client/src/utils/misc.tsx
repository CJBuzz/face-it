import { FileWithPath } from "@mantine/dropzone"

export const getColor = (score: number) => `rgb(${255 * (1 - score)}, 20, ${255 * score})`

export const getDateStr = (date: Date) => (
  date.getFullYear().toString() + //year
  (date.getMonth() + 1).toString().padStart(2, '0') + //month
  date.getDate().toString().padStart(2, '0') //day
)

export const getFileInfoFromUpload = async (imgFile: FileWithPath, return_name: boolean = false, filepattern: RegExp | null = null): Promise<string | [string, string] | void> => {
    const reader = new FileReader();
    

    reader.onload = async (readerEvent: ProgressEvent<FileReader>) => {
        if (typeof readerEvent.target?.result !== "string") return;
        
        const image_data = readerEvent.target.result.split(",")[1]

        console.log(image_data)
        if (!return_name) return image_data
       
        let match: string = imgFile.name
        if (filepattern) match = imgFile.name.match(filepattern)?.toString() || "";
        return [image_data, match]
      };

    reader.readAsDataURL(imgFile);
}