CREATE TABLE `customerAuthOtps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(40) NOT NULL,
	`name` varchar(160),
	`codeHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`consumedAt` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerAuthOtps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customer_auth_otps_phone_idx` ON `customerAuthOtps` (`phone`);--> statement-breakpoint
CREATE INDEX `customer_auth_otps_expiry_idx` ON `customerAuthOtps` (`expiresAt`);