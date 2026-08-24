/*
  Make Room.blockId required and add the Block relationship.
*/

-- AlterTable
ALTER TABLE `Room` MODIFY `blockId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Room_blockId_roomNumber_key`
ON `Room`(`blockId`, `roomNumber`);

-- AddForeignKey
ALTER TABLE `Room`
ADD CONSTRAINT `Room_blockId_fkey`
FOREIGN KEY (`blockId`) REFERENCES `Block`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;