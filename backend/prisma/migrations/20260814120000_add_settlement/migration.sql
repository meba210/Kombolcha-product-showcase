-- CreateTable: per-seller settlement rows created when a payment completes
CREATE TABLE `settlement` (
    `settlement_id`     INTEGER NOT NULL AUTO_INCREMENT,
    `order_id`          INTEGER NOT NULL,
    `factory_id`        INTEGER NULL,
    `gross_amount`      DOUBLE NOT NULL,
    `commission_rate`   DOUBLE NOT NULL DEFAULT 0.10,
    `commission_amount` DOUBLE NOT NULL,
    `net_amount`        DOUBLE NOT NULL,
    `settlement_status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `created_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `settlement_order_id_idx`(`order_id`),
    INDEX `settlement_factory_id_idx`(`factory_id`),
    PRIMARY KEY (`settlement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `settlement` ADD CONSTRAINT `settlement_order_id_fkey`
    FOREIGN KEY (`order_id`) REFERENCES `order`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlement` ADD CONSTRAINT `settlement_factory_id_fkey`
    FOREIGN KEY (`factory_id`) REFERENCES `factory`(`factory_id`) ON DELETE CASCADE ON UPDATE CASCADE;
