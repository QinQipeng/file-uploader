import { DatabaseError } from "pg";
import { prisma } from "../lib/prisma"
import { File } from "../../generated/prisma/client";
import path from "node:path";

export type NewFile = Omit<File, 'ownerId' | 'folderId'>

class FileModel {
  private readonly repo: typeof prisma.file

  constructor() {
    this.repo = prisma.file
  }

  async checkOwnerShip (fileId: string, userId: string | undefined, ): Promise<boolean> {
    if (userId === undefined) return false
    const exists = this.repo.findUnique({
      where: {id: fileId, ownerId: userId}
    })
    return exists != null
  }

  async getFileById(id: string): Promise<File | null> {
    return await this.repo.findUnique({
      where: { id: id }
    })
  }

  async getFileByName(name: string, userId: string | undefined): Promise<File[] | null> {
    if (userId === undefined) return []
    return await this.repo.findMany({
      where: { name: { contains: name, mode: "insensitive" }, ownerId: userId}
    })
  }

  async createNewFile(folderId: string, ownerId: string, newFile: NewFile): Promise<void> {
    try {
      await this.repo.create({
        data: {
          folderId: folderId,
          ownerId: ownerId,
          ...newFile
        }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    }
  }

  async renameFile(fileId: string, newName: string): Promise<void> {
    try {
      await this.repo.update({
        where: { id: fileId },
        data: { name: newName, src: path.join() }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    } 
  }

  async deleteFolder(fileId: string) {
    try {
      return await this.repo.delete({
        where: { id: fileId }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    } 
  }
}

export default new FileModel()