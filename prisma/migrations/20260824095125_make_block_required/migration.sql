/*
  Warnings:

  - A unique constraint covering the columns `[blockId,roomNumber]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Made the column `blockId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_blockId_fkey`;

-- DropForeignKey
ALTER TABLE `Room` DROP FOREIGN KEY `Room_hostelId_fkey`;

-- DropIndex
DROP INDEX `Room_blockId_fkey` ON `Room`;

-- DropIndex
DROP INDEX `Room_hostelId_roomNumber_key` ON `Room`;

-- AlterTable
ALTER TABLE `Room` MODIFY `blockId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Room_blockId_roomNumber_key` ON `Room`(`blockId`, `roomNumber`);

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `Block`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomAllocation` ADD CONSTRAINT `RoomAllocation_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
