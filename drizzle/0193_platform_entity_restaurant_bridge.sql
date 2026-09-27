-- Explicit bridge between the legacy restaurant tenant and the universal platform entity.
-- Nullable keeps non-restaurant entities and existing rows compatible.
ALTER TABLE `platform_entities`
  ADD COLUMN `restaurant_id` INT NULL AFTER `id`;

CREATE UNIQUE INDEX `platform_entities_restaurant_uidx`
  ON `platform_entities` (`restaurant_id`);
