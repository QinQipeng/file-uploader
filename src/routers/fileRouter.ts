import { Router } from "express";
import fileController from "../controllers/fileController";

const fileRouter = Router();

fileRouter.route("/:id")
  .get(fileController.getFileInfoGet)
  .post(fileController.renameFilePost);

fileRouter.get("/", fileController.queryFileGet);
fileRouter.get("/:id/download", fileController.downloadFileGet);
fileRouter.post("/:folderId/new", fileController.addFilePost);
fileRouter.post("/:id/delete", fileController.deleteFilePost);


export default fileRouter