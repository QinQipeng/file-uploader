import { User, Folder } from "../../generated/prisma/client";
import { Request } from 'express';

export type UserWithFolder = User & { folders: Folder[] }

declare global {
  namespace Express {
    interface User extends UserWithFolder {};
  }
}

export {};