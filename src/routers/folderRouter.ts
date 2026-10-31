import { Router } from "express";
import folderController from "../controllers/folderController";

const folderRouter = Router();

folderRouter.route("/:id")
  .get(folderController.openFolderGet)
  .post(folderController.renameFolderPost);
folderRouter.get("/", folderController.queryFolderGet);
folderRouter.post("/:id/new", folderController.addFolderPost);
folderRouter.post("/:id/delete", folderController.deleteFolderPost);

export default folderRouter;
