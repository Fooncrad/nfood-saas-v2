ALTER TABLE `restaurants`
  ADD COLUMN `waiterCallInAppEnabled` TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN `waiterCallEmailEnabled` TINYINT(1) NOT NULL DEFAULT 0;
