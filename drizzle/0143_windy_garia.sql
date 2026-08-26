CREATE TABLE `contentFoodTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`category` varchar(80) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentFoodTags_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentFoodTags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contentListingInvites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`invitedUserId` int NOT NULL,
	`status` enum('pending','accepted','revoked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentListingInvites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` MODIFY COLUMN `buyerType` enum('customer') NOT NULL DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE `contentListings` ADD `visibility` enum('public','friends') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentListings` ADD `foodTagsJson` text;--> statement-breakpoint
ALTER TABLE `customerProfiles` ADD `defaultContentVisibility` enum('public','friends') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentFoodTags` ADD CONSTRAINT `contentFoodTags_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentListingInvites` ADD CONSTRAINT `contentListingInvites_listingId_contentListings_id_fk` FOREIGN KEY (`listingId`) REFERENCES `contentListings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentListingInvites` ADD CONSTRAINT `contentListingInvites_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentListingInvites` ADD CONSTRAINT `contentListingInvites_invitedUserId_users_id_fk` FOREIGN KEY (`invitedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;