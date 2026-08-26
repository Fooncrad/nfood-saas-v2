ALTER TABLE `mediaFiles` ADD `virusScanStatus` enum('pending','clean','infected','unavailable') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD `virusScanName` varchar(160);--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD `virusScanVersion` varchar(160);--> statement-breakpoint
ALTER TABLE `mediaFiles` ADD `virusScannedAt` timestamp;