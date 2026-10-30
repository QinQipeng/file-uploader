/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,is_root]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parent_id_fkey";

-- DropIndex
DROP INDEX "Folder_owner_id_key";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "is_root" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Folder_owner_id_is_root_idx" ON "Folder"("owner_id", "is_root") WHERE (is_root = true);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_owner_id_is_root_key" ON "Folder"("owner_id", "is_root") WHERE (is_root = true);

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
