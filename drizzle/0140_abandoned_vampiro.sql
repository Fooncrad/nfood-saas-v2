ALTER TABLE `contentModerationReviews` ADD `captureMethod` enum('camera','file') DEFAULT 'file' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD `capturedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD `deviceModel` varchar(160);--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD `exifJson` text;