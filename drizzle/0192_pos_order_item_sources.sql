-- Additive POS line-source support. Existing restaurant order rows remain menu_item.
ALTER TABLE `orderItems`
  MODIFY COLUMN `menuItemId` INT NULL,
  ADD COLUMN `sourceType` ENUM('menu_item','marketplace_variant') NOT NULL DEFAULT 'menu_item' AFTER `menuItemId`,
  ADD COLUMN `marketplaceVariantId` INT NULL AFTER `sourceType`;

CREATE INDEX `orderItems_marketplace_variant_idx`
  ON `orderItems` (`marketplaceVariantId`);
