ALTER TABLE `reservations` MODIFY COLUMN `status` enum('pending','confirmed','rejected','seated','completed','cancelled','no_show') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `reservations` ADD `rejectionReason` varchar(500);--> statement-breakpoint
ALTER TABLE `reservations` ADD `depositAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservations` ADD `depositStatus` enum('not_required','pending','paid','refunded') DEFAULT 'not_required' NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationMaxPerDay` int;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationDepositEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `restaurants` ADD `reservationDepositAmount` decimal(10,2) DEFAULT '0' NOT NULL;