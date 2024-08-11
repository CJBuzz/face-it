# FACE-IT

Face-It is a web-app for image-based facial recognition built using Next.js, Mantine UI, FASTAPI, SQLite. Facial recognition models used are [Insightface](https://github.com/deepinsight/insightface) by deepinsight for feature extraction and Spotify's [Voyager](https://github.com/spotify/voyager) for K-Nearest Neighbour search.

## Installation

### Docker

Face-It can be installed through Docker. This is particularly useful for GPU installation due to potential CUDA compatibility issues otherwise.

GPU installation

```
docker-compose up
```

CPU installation

```
docker-compose -f docker-compose-cpu.yml up
```

Access the webpage on [localhost:3000](http://localhost:3000).

## Usage

### Filling the Database

Fill the database with different faces first. To do this, click on the **Database** page on the sidebar and do the following steps.

1. Prepare your images. Each image should only have 1 face.
2. On your file management system, rename the images to the name (or other identifiers) of the person bearing the face.[\*](#naming-conventions)
3. Drag and drop those images into the image dropbox
4. Click the submit button.

### Inference

Once the database has been filled with faces of people to be recognised, you can click on the **Main** page and upload a photo on the dropbox to conduct facial recognition.

### Additional Functionalities

The **Database** page contains a search bar where people previously added to the database can be searched for and their info edited (which includes uploaded more images and changing their names).

The **History** page shows a list of past inferences conducted. You can search for a inferences conducted in a specific date range.

### Naming Conventions

If multiple photos of the same person are uploaded, Face-It will take the average of the vector embeddings of all the person's faces. To tag an image to a person, the name of the image file must bear the person's name. For example, if the person's name is `XXyy`, the image should be `XXyy.png` or `XXyy.jpg`.

As most file management systems disallow multiple files from having the same name, this can make it complicated to upload multiple photos of a person at once.

To solve this issue, Face-It will tag photos in the format `XXyy (1).png` or `XXyy (2).jpg` as also belonging to the person `XXyy`.

As such, one just needs to select all photos bearing the face of `XXyy` and rename it to `XXyy`. The file management system will automatically add the numeric suffix to the photos. The renamed photos can then all be dragged and dropped into the upload dropbox in the **Database** page.

## Potential Improvements

- [x] Settle dockerization
- [x] Debug addition of personnel when adding multiple guys at once
- [ ] Add a function to delete personnel en masse (probably through tags)
- [ ] Refactor some front-end code (change some stuff to hooks/components, for reusability)
- [ ] Add schema for FASTAPI's auto-generated docs
- [x] Write a proper ReadME.md guide
