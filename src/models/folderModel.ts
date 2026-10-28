import { PrismaClient } from "../../generated/prisma/client"
import { DatabaseError } from "pg";
import { prisma } from "../lib/prisma"
import { Folder } from "../../generated/prisma/client";

type NewFolder = Pick<Folder, 'name' | 'ownerId'>

class FolderModel {
  private readonly repo: typeof prisma.folder

  constructor() {
    this.repo = prisma.folder
  }

  async checkOwnerShip (folderId: string, userId: string | undefined, ): Promise<boolean> {
    if (userId === undefined) return false
    const exists = this.repo.findUnique({
      where: {id: folderId, ownerId: userId}
    })
    return exists != null
  }

  async getFolderById(id: string): Promise<Folder | null> {
    return await this.repo.findUnique({
      where: {id: id},
      include: {
        children: true
      }
    })
  }

  async getFoldersByName(name: string, userId: string | undefined): Promise<Folder[] | null> {
    if (userId === undefined) return []
    return await this.repo.findMany({
      where: { name: { contains: name, mode: "insensitive" }, ownerId: userId},
      include: {
        children: true
      }
    })
  }

  async createNewFolder(parentId: string, newFolder: NewFolder): Promise<void> {
    try {
      await this.repo.create({
        data: {
          parentId: parentId,
          ...newFolder
        }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    } 
  }

  async renameFolder(folderId: string, newName: string): Promise<void> {
    try {
      await this.repo.update({
        where: { id: folderId},
        data: { name: newName }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    } 
  }

  async deleteFolder(folderId: string) {
    try {
      await this.repo.delete({
        where: { id: folderId}
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    } 
  }
}

export default new FolderModel()