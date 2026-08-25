CREATE TABLE `translationGlossaryEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`sourceLanguage` varchar(10) NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`sourceTerm` varchar(180) NOT NULL,
	`translatedTerm` varchar(180) NOT NULL,
	`termType` enum('brand','dish','ingredient','modifier','other') NOT NULL DEFAULT 'other',
	`isProtected` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translationGlossaryEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `translationGlossaryEntries_unique_term` UNIQUE(`restaurantId`,`sourceLanguage`,`targetLanguage`,`sourceTerm`)
);
--> statement-breakpoint
CREATE TABLE `translationJobErrors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`entityType` enum('category','item','addon') NOT NULL,
	`entityId` int NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`sourceName` varchar(180) NOT NULL,
	`errorMessage` text NOT NULL,
	`attempts` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translationJobErrors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translationJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`status` enum('queued','running','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`totalItems` int NOT NULL DEFAULT 0,
	`processedItems` int NOT NULL DEFAULT 0,
	`successItems` int NOT NULL DEFAULT 0,
	`errorItems` int NOT NULL DEFAULT 0,
	`currentLabel` varchar(220),
	`lastError` text,
	`createdByUserId` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translationJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `translationGlossaryEntries` ADD CONSTRAINT `translationGlossaryEntries_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationGlossaryEntries` ADD CONSTRAINT `translationGlossaryEntries_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationJobErrors` ADD CONSTRAINT `translationJobErrors_jobId_translationJobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `translationJobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationJobErrors` ADD CONSTRAINT `translationJobErrors_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationJobs` ADD CONSTRAINT `translationJobs_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translationJobs` ADD CONSTRAINT `translationJobs_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `translationJobErrors_job_restaurant` ON `translationJobErrors` (`jobId`,`restaurantId`);--> statement-breakpoint
CREATE INDEX `translationJobs_restaurant_status` ON `translationJobs` (`restaurantId`,`status`);