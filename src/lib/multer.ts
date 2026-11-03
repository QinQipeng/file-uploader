import multer, { Multer } from "multer";
import fs from "node:fs/promises";
import path, { resolve } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import fileModel, { NewFile } from "../models/fileModel";
import { File as SchemaFile } from "../../generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

process.loadEnvFile();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filesystemRoot = "./src/filesystem";

const diskStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dirname = path.join(
      filesystemRoot,
      `${req.user?.firstName} ${req.user?.lastName}`,
    );
    await fs.mkdir(dirname, { recursive: true });
    cb(null, dirname);
  },
});

const memoryStorage = multer.memoryStorage();

interface FileSystem {
  storage: multer.StorageEngine;
  createFile(file: Express.Multer.File, folderName: string): Promise<NewFile>;
  deleteFile(file: SchemaFile): Promise<void>;
  deleteBulk(files: SchemaFile[]): Promise<void>;
}

class LocalFileSystem implements FileSystem {
  storage: multer.StorageEngine;

  constructor(storage: multer.StorageEngine) {
    this.storage = storage;
  }

  async createFile(file: Express.Multer.File): Promise<NewFile> {
    const multerMapper = (file: Express.Multer.File): NewFile => {
      return {
        id: file.filename,
        name: path.parse(file.originalname).name,
        suffix: path.extname(file.originalname),
        mimetype: file.mimetype,
        src: path.join(file.destination, file.filename),
        size: new Decimal(file?.size ?? 0),
      };
    };

    return Promise.resolve(multerMapper(file));
  }

  async deleteFile(file: SchemaFile): Promise<void> {
    await fs.unlink(file.src);
  }

  async deleteBulk(files: SchemaFile[]): Promise<void> {
    await Promise.all(files.map((file: SchemaFile) => this.deleteFile(file)))
  }
}

class CloudFileSystem implements FileSystem {
  storage: multer.StorageEngine;

  constructor(storage: multer.StorageEngine) {
    this.storage = storage;
  }

  private getResourceType(mimetype: string) {
    if (!mimetype) return "raw";
    if (mimetype.startsWith("image/")) {
      return "image";
    }
    if (mimetype.startsWith("video/") || mimetype.startsWith("audio/")) {
      return "video";
    }
    return "raw";
  }

  async createFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<NewFile> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `TOP File Uploader Project/${folderName}`,
            resource_type: this.getResourceType(file.mimetype),
            display_name: path.parse(file.originalname).name,
            format: path.extname(file.originalname)
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
            }
            const result = uploadResult;
            return resolve({
              id: result?.asset_id,
              name: result?.display_name,
              mimetype: file.mimetype,
              suffix: result?.format ?? path.extname(file.originalname),
              src: result?.secure_url,
              size: Decimal(result?.bytes ?? 0),
            } as NewFile);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteFile(file: SchemaFile): Promise<void> {
    try {
      await cloudinary.api.delete_resources_by_asset_ids([file.id], { invalidate: true });
    } catch (err) {
      console.error(err)
    }
  }

  async deleteBulk(files: SchemaFile[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources_by_asset_ids(files.map(file => file.id), { invalidate: true });
    } catch (err) {
      console.error(err)
    }
  }
}

const filesystem =
  process.env.FILESYSTEM == "cloud"
    ? new CloudFileSystem(memoryStorage)
    : new LocalFileSystem(diskStorage);

export default filesystem;
