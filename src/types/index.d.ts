import { User, Folder } from "../../generated/prisma/client";
import { Request } from 'express';

export type UserWithRoot = User & { root: Folder[] }

declare global {
  namespace Express {
    interface User extends UserWithRoot {};
  }
}

export {};