CREATE TABLE `walletAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`balance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `walletAccounts_customer_unique` UNIQUE(`customerId`)
);
--> statement-breakpoint
CREATE TABLE `walletTopupRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`walletAccountId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`paymentMethod` enum('bank_transfer','cash','apple_pay') NOT NULL DEFAULT 'bank_transfer',
	`receiptUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewNote` varchar(500),
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletTopupRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walletTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletAccountId` int NOT NULL,
	`customerId` int NOT NULL,
	`type` enum('credit','debit','refund','adjustment') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`balanceAfter` decimal(12,2) NOT NULL,
	`referenceType` varchar(60),
	`referenceId` int,
	`note` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `walletAccounts` ADD CONSTRAINT `walletAccounts_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTopupRequests` ADD CONSTRAINT `walletTopupRequests_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTopupRequests` ADD CONSTRAINT `walletTopupRequests_walletAccountId_walletAccounts_id_fk` FOREIGN KEY (`walletAccountId`) REFERENCES `walletAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTopupRequests` ADD CONSTRAINT `walletTopupRequests_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTransactions` ADD CONSTRAINT `walletTransactions_walletAccountId_walletAccounts_id_fk` FOREIGN KEY (`walletAccountId`) REFERENCES `walletAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walletTransactions` ADD CONSTRAINT `walletTransactions_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;