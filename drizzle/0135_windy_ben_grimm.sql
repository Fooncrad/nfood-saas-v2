CREATE TABLE `emailTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` enum('platform','restaurant') NOT NULL DEFAULT 'restaurant',
	`restaurantId` int,
	`eventKey` varchar(100) NOT NULL,
	`locale` varchar(10) NOT NULL DEFAULT 'ar',
	`subject` varchar(240) NOT NULL,
	`htmlBody` text NOT NULL,
	`textBody` text NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passwordResetTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passwordResetTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwordResetTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `customerProfiles` ADD `restaurantId` int;--> statement-breakpoint
ALTER TABLE `emailTemplates` ADD CONSTRAINT `emailTemplates_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emailTemplates` ADD CONSTRAINT `emailTemplates_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passwordResetTokens` ADD CONSTRAINT `passwordResetTokens_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `email_templates_scope_restaurant_event_locale_idx` ON `emailTemplates` (`scope`,`restaurantId`,`eventKey`,`locale`);--> statement-breakpoint
CREATE INDEX `password_reset_tokens_user_expiry_idx` ON `passwordResetTokens` (`userId`,`expiresAt`);--> statement-breakpoint
ALTER TABLE `customerProfiles` ADD CONSTRAINT `customerProfiles_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;