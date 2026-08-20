CREATE TABLE `testAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`role` enum('restaurant_admin','waiter','kitchen','cashier','customer','driver') NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `testAccounts_email_unique` UNIQUE(`email`)
);
