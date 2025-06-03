-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phoneNumber` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `linkedId` INTEGER NULL,
    `linkPrecedence` ENUM('PRIMARY', 'SECONDARY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `Contact_email_idx`(`email`),
    INDEX `Contact_phoneNumber_idx`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_linkedId_fkey` FOREIGN KEY (`linkedId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
