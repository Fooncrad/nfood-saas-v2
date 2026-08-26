CREATE TABLE `contentModerationReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaFileId` int NOT NULL,
	`status` enum('pending','approved','blocked') NOT NULL DEFAULT 'pending',
	`reason` varchar(500),
	`scanVersion` varchar(40) NOT NULL DEFAULT 'rules-v1',
	`watermarkApplied` boolean NOT NULL DEFAULT false,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentModerationReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentModerationReviews_mediaFileId_unique` UNIQUE(`mediaFileId`)
);
--> statement-breakpoint
ALTER TABLE `contentModerationReviews` ADD CONSTRAINT `contentModerationReviews_mediaFileId_mediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `content_moderation_status_idx` ON `contentModerationReviews` (`status`,`updatedAt`);