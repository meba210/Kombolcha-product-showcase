CREATE TABLE `paymentattempt` (
    `payment_attempt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `buyer_id` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `transaction_reference` VARCHAR(191) NOT NULL,
    `cart_snapshot` JSON NOT NULL,
    `payment_status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentAttempt_transaction_reference_key`(`transaction_reference`),
    INDEX `PaymentAttempt_buyer_id_fkey`(`buyer_id`),
    PRIMARY KEY (`payment_attempt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `paymentattempt` ADD CONSTRAINT `PaymentAttempt_buyer_id_fkey`
    FOREIGN KEY (`buyer_id`) REFERENCES `buyer`(`buyer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
