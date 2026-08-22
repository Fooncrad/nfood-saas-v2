CREATE TABLE `campaignContents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`menuItemId` int,
	`mediaFileId` int,
	`locale` varchar(8) NOT NULL DEFAULT 'ar',
	`headline` varchar(180) NOT NULL,
	`body` text,
	`callToAction` varchar(120),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaignContents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurantDisplayScreens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`deviceKey` varchar(120) NOT NULL,
	`status` enum('draft','active','paused') NOT NULL DEFAULT 'draft',
	`refreshSeconds` int NOT NULL DEFAULT 30,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurantDisplayScreens_id` PRIMARY KEY(`id`),
	CONSTRAINT `restaurantDisplayScreens_deviceKey_unique` UNIQUE(`deviceKey`)
);
--> statement-breakpoint
CREATE TABLE `restaurantDisplaySlides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`screenId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`menuItemId` int,
	`mediaFileId` int,
	`title` varchar(180),
	`subtitle` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`durationSeconds` int NOT NULL DEFAULT 8,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurantDisplaySlides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campaignContents` ADD CONSTRAINT `campaignContents_campaignId_campaigns_id_fk` FOREIGN KEY (`campaignId`) REFERENCES `campaigns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignContents` ADD CONSTRAINT `campaignContents_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignContents` ADD CONSTRAINT `campaignContents_menuItemId_menuItems_id_fk` FOREIGN KEY (`menuItemId`) REFERENCES `menuItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaignContents` ADD CONSTRAINT `campaignContents_mediaFileId_mediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD CONSTRAINT `restaurantDisplayScreens_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD CONSTRAINT `restaurantDisplayScreens_branchId_branches_id_fk` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplayScreens` ADD CONSTRAINT `restaurantDisplayScreens_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD CONSTRAINT `restaurantDisplaySlides_screenId_restaurantDisplayScreens_id_fk` FOREIGN KEY (`screenId`) REFERENCES `restaurantDisplayScreens`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD CONSTRAINT `restaurantDisplaySlides_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD CONSTRAINT `restaurantDisplaySlides_menuItemId_menuItems_id_fk` FOREIGN KEY (`menuItemId`) REFERENCES `menuItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantDisplaySlides` ADD CONSTRAINT `restaurantDisplaySlides_mediaFileId_mediaFiles_id_fk` FOREIGN KEY (`mediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;