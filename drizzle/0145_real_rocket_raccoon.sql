CREATE TABLE `customerCardRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterUserId` int NOT NULL,
	`customerProfileId` int,
	`bindingId` int,
	`requestType` enum('print','replace_key','bind_key','update_key') NOT NULL DEFAULT 'print',
	`status` enum('pending','approved','rejected','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`reason` text,
	`adminNote` text,
	`price` decimal(10,2),
	`currency` varchar(8) NOT NULL DEFAULT 'SAR',
	`resolvedByUserId` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerCardRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trustedDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fingerprintHash` varchar(128) NOT NULL,
	`deviceLabel` varchar(160) NOT NULL,
	`status` enum('pending','active','revoked','blocked') NOT NULL DEFAULT 'pending',
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trustedDevices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `customerCardRequests` ADD CONSTRAINT `customerCardRequests_requesterUserId_users_id_fk` FOREIGN KEY (`requesterUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerCardRequests` ADD CONSTRAINT `customerCardRequests_customerProfileId_customerProfiles_id_fk` FOREIGN KEY (`customerProfileId`) REFERENCES `customerProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerCardRequests` ADD CONSTRAINT `customerCardRequests_bindingId_vcardCardBindings_id_fk` FOREIGN KEY (`bindingId`) REFERENCES `vcardCardBindings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customerCardRequests` ADD CONSTRAINT `customerCardRequests_resolvedByUserId_users_id_fk` FOREIGN KEY (`resolvedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trustedDevices` ADD CONSTRAINT `trustedDevices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trustedDevices` ADD CONSTRAINT `trustedDevices_approvedByUserId_users_id_fk` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;