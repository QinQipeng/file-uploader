import { PrismaClient } from "../../generated/prisma/client"
import { DatabaseError } from "pg";
import { prisma } from "../lib/prisma"
import { User } from "../../generated/prisma/client"

type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

class UserModel {
  db: PrismaClient

  constructor() {
    this.db = prisma
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { email: email }
    })
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { id: id }
    })
  }

  async createUser(user: NewUser): Promise<void> {
    try {
      await prisma.user.create({
        data: {
          ...user,
          root: {
            create: {
              name: `${user.firstName}'s Folder`,
              isRoot: true
            }
          }
        }
      })
    } catch (err: DatabaseError | Error | unknown) {
      throw new Error(String(err))
    }
  }
}

export default new UserModel()