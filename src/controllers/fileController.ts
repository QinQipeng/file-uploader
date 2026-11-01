import crypto from "crypto";
import { type Request, Response, NextFunction } from "express";
import fileModel, { NewFile } from "../models/fileModel";
import { Decimal } from "@prisma/client/runtime/client";
import userModel from "../models/userModel";
import path from "node:path";
import multer from "multer";
import filesystem from "../lib/multer"
import { createInflate } from "zlib";


const upload = multer({ storage: filesystem.storage });

async function getFileInfoGet(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  if (req.user && req.params.id) {
    const owner = await userModel.getUserById(req.user?.id as string);
    res.render("fileDetails", {
      fileInfo: await fileModel.getFileById(req.params.id),
      ownerName: owner ? `${owner?.firstName} ${owner?.lastName}` : "unknown",
    });
    return;
  }
  res.redirect("/");
}

async function queryFileGet(
  req: Request<any, any, any, { name: string }>,
  res: Response,
  next: NextFunction,
) {
  const name = req.query.name;
  const folderList = await fileModel.getFileByName(name, req.user?.id);
  res.json(folderList);
}

async function renameFilePost(req: Request, res: Response, next: NextFunction) {
  const newName = req.body.newName;
  const id = req.params.id as string;

  await fileModel.renameFile(id, newName);
  res.redirect(`/file/${id}`);
}

const addFilePost = [
  upload.single("file"),
  async function (
    req: Request<{ folderId: string }, any, { newName: string }>,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folderId = req.params.folderId;
    const ownerId = req.user?.id ?? "";

    try {
      const newFile = await filesystem.createFile(req.file, `${req.user?.firstName} ${req.user?.lastName}`);
      await fileModel.createNewFile(folderId, ownerId, newFile);
    } catch {

    } finally {
      res.redirect(`/folder/${folderId}`);
    }
  },
];

async function downloadFileGet(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.id;
  const owns = await fileModel.checkOwnerShip(id, req.user?.id);
  if (owns) {
    const file = await fileModel.getFileById(id);
    res.download(file?.src as string, file?.name ?? "untitled", (err) => {
      if (err) {
        console.error("Download failed:", err);
        if (!res.headersSent) {
          res.status(500).send("Could not download file");
        }
      }
    });
    return;
  }
  res.redirect("/");
}

async function deleteFilePost(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  if (!(await fileModel.checkOwnerShip(id, req.user?.id)))
    throw new Error("Error: Deleting file not owned by you is prohibitted");

  const deletedFile = await fileModel.deleteFolder(id);
  await filesystem.deleteFile(deletedFile);

  res.redirect(`/folder/${deletedFile.folderId}`);
}

export default {
  getFileInfoGet,
  renameFilePost,
  queryFileGet,
  addFilePost,
  downloadFileGet,
  deleteFilePost,
};
