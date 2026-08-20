CREATE TABLE `authSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionTokenHash` varchar(128) NOT NULL,
	`deviceLabel` varchar(160),
	`userAgent` text,
	`ipAddress` varchar(64),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `authSessions_sessionTokenHash_unique` UNIQUE(`sessionTokenHash`)
);
--> statement-breakpoint
CREATE TABLE `featureDefinitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(120) NOT NULL,
	`label` varchar(160) NOT NULL,
	`dependencyKey` varchar(120),
	`defaultLimit` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `featureDefinitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `featureDefinitions_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `restaurantFeatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`featureId` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`overrideLimit` int,
	`overrideValue` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `restaurantFeatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSecurity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`twoFactorEnabled` boolean NOT NULL DEFAULT false,
	`passkeyEnabled` boolean NOT NULL DEFAULT false,
	`phone` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSecurity_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSecurity_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `authSessions` ADD CONSTRAINT `authSessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantFeatures` ADD CONSTRAINT `restaurantFeatures_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `restaurantFeatures` ADD CONSTRAINT `restaurantFeatures_featureId_featureDefinitions_id_fk` FOREIGN KEY (`featureId`) REFERENCES `featureDefinitions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSecurity` ADD CONSTRAINT `userSecurity_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;