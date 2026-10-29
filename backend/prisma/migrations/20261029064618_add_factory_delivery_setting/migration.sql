-- AlterTable
ALTER TABLE `message` ADD COLUMN `attachment_url` VARCHAR(191) NULL,
    ADD COLUMN `product_id` INTEGER NULL,
    ADD COLUMN `product_image` VARCHAR(191) NULL,
    ADD COLUMN `product_name` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE SET NULL ON UPDATE CASCADE;
