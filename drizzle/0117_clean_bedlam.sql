CREATE TABLE `guestOrderClaimOtps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`guestPhone` varchar(40) NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guestOrderClaimOtps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `guestOrderClaimOtps` ADD CONSTRAINT `guestOrderClaimOtps_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `guest_order_claim_otps_user_idx` ON `guestOrderClaimOtps` (`userId`,`guestPhone`);--> statement-breakpoint
CREATE INDEX `guest_order_claim_otps_expiry_idx` ON `guestOrderClaimOtps` (`expiresAt`);