ALTER TABLE `qrCodes` MODIFY COLUMN `type` enum('table','order','waiter_call','custom') NOT NULL;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD `purpose` varchar(40) DEFAULT 'menu' NOT NULL;--> statement-breakpoint
ALTER TABLE `qrCodes` ADD `targetUrl` varchar(500);