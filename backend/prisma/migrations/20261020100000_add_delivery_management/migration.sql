ALTER TABLE `factory`
  ADD COLUMN `uses_own_delivery` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `paymentattempt`
  MODIFY COLUMN `cart_snapshot` LONGTEXT NOT NULL,
  ADD COLUMN `delivery_snapshot` LONGTEXT NULL;

CREATE TABLE `deliveryzone` (
  `delivery_zone_id` INTEGER NOT NULL AUTO_INCREMENT,
  `provider_type` VARCHAR(191) NOT NULL,
  `provider_key` VARCHAR(191) NOT NULL,
  `factory_id` INTEGER NULL,
  `town` VARCHAR(191) NOT NULL,
  `fee` DOUBLE NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `deliveryzone_provider_key_town_key` (`provider_key`, `town`),
  INDEX `deliveryzone_provider_type_town_is_active_idx` (`provider_type`, `town`, `is_active`),
  INDEX `deliveryzone_factory_id_idx` (`factory_id`),
  PRIMARY KEY (`delivery_zone_id`),
  CONSTRAINT `deliveryzone_factory_id_fkey`
    FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `deliverydriver` (
  `delivery_driver_id` INTEGER NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(191) NOT NULL,
  `phone_number` VARCHAR(191) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`delivery_driver_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `orderdelivery` (
  `order_delivery_id` INTEGER NOT NULL AUTO_INCREMENT,
  `order_id` INTEGER NOT NULL,
  `factory_id` INTEGER NULL,
  `provider_type` VARCHAR(191) NOT NULL,
  `seller_name` VARCHAR(191) NOT NULL,
  `town` VARCHAR(191) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `delivery_fee` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `tracking_code` VARCHAR(191) NOT NULL,
  `driver_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `orderdelivery_tracking_code_key` (`tracking_code`),
  INDEX `orderdelivery_order_id_idx` (`order_id`),
  INDEX `orderdelivery_factory_id_status_idx` (`factory_id`, `status`),
  INDEX `orderdelivery_driver_id_idx` (`driver_id`),
  PRIMARY KEY (`order_delivery_id`),
  CONSTRAINT `orderdelivery_order_id_fkey`
    FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orderdelivery_factory_id_fkey`
    FOREIGN KEY (`factory_id`) REFERENCES `factory` (`factory_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderdelivery_driver_id_fkey`
    FOREIGN KEY (`driver_id`) REFERENCES `deliverydriver` (`delivery_driver_id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;