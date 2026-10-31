import { User } from "../../generated/prisma/browser";
import folderModel from "../models/folderModel";
import { type Request, type Response, type NextFunction } from "express";

async function openFolderGet(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id as string;
  const owns = await folderModel.checkOwnerShip(id, req.user?.id);
  if (owns) {
    res.render("index", {
      user: req.user,
      currFolder: await folderModel.getFolderById(id),
    });
    return;
  }
  res.redirect("/");
}

async function queryFolderGet(
  req: Request<any, any, any, { name: string }>,
  res: Response,
  next: NextFunction,
) {
  const name = req.query.name;
  const folderList = await folderModel.getFoldersByName(name, req.user?.id);
  res.json(folderList);
}

async function renameFolderPost(
  req: Request<any, any, { newName: string }>,
  res: Response,
  next: NextFunction,
) {
  const newName = req.body.newName;
  const id = req.params.id as string;
  await folderModel.renameFolder(id, newName);
  res.redirect(`/folder/${id}`);
}

async function addFolderPost(
  req: Request<any, any, { newName: string }>,
  res: Response,
  next: NextFunction,
) {
  const newFolder = { name: req.body.newName, ownerId: req.user?.id as string };
  const id = req.params.id as string;
  await folderModel.createNewFolder(id, newFolder);
  res.redirect(`/folder/${id}`);
}

async function deleteFolderPost(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  if ((await folderModel.getFolderById(id))?.isRoot)
    throw new Error("Error: Deletion on Root Folder is Prohibited")
  
  const { parentId } = await folderModel.deleteFolder(id);
  res.redirect(`/folder/${parentId}`);
}

export default {
  openFolderGet,
  queryFolderGet,
  renameFolderPost,
  addFolderPost,
  deleteFolderPost,
};
