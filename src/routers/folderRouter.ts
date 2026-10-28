import { Router } from "express";
import folderController from "../controllers/folderController";

const folderRouter = Router();

folderRouter.get("/:id", folderController.openFolderGet);
folderRouter.get("/", folderController.queryFolderGet);
folderRouter.post("/:id", folderController.renameFolderPost);
folderRouter.post("/:id/new", folderController.addFolderPost);
folderRouter.post("/:parentId/delete/:childId", folderController.deleteFolderPost);

export default folderRouter;
