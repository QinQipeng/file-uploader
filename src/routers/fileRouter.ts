import { Router } from "express";
import fileController from "../controllers/fileController";

const fileRouter = Router();

fileRouter.post("/:userId", fileController.saveFileToDest)

export default fileRouter