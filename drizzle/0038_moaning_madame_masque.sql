CREATE TABLE `customerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(160) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`displayName` varchar(160),
	`title` varchar(160),
	`bio` text,
	`avatarUrl` varchar(500),
	`coverUrl` varchar(500),
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`email` varchar(320),
	`websiteUrl` varchar(500),
	`address` varchar(500),
	`instagramUrl` varchar(500),
	`twitterUrl` varchar(500),
	`facebookUrl` varchar(500),
	`linkedinUrl` varchar(500),
	`servicesJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerProfiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `customerProfiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `integrationSettings` ADD `secretCiphertext` text;--> statement-breakpoint
ALTER TABLE `customerProfiles` ADD CONSTRAINT `customerProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;