CREATE TABLE `driverSecurityDepositTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`depositAccountId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`driverUserId` int NOT NULL,
	`type` enum('deposit','withdrawal','hold','release','adjustment') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`balanceAfter` decimal(12,2) NOT NULL,
	`referenceType` varchar(60),
	`referenceId` int,
	`note` varchar(500),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverSecurityDepositTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `driverSecurityDeposits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`driverUserId` int NOT NULL,
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`openingBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`currentBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`status` enum('active','closed') NOT NULL DEFAULT 'active',
	`note` varchar(500),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverSecurityDeposits_id` PRIMARY KEY(`id`),
	CONSTRAINT `driver_security_deposits_driver_restaurant_unique` UNIQUE(`restaurantId`,`driverUserId`)
);
--> statement-breakpoint
CREATE TABLE `financialLedgerEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int,
	`branchId` int,
	`userId` int,
	`createdByUserId` int,
	`section` varchar(80) NOT NULL,
	`entryType` enum('payment','refund','cancellation','deposit','withdrawal','adjustment') NOT NULL,
	`direction` enum('credit','debit') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
	`status` enum('posted','voided') NOT NULL DEFAULT 'posted',
	`referenceType` varchar(60),
	`referenceId` int,
	`idempotencyKey` varchar(120),
	`note` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `financialLedgerEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_ledger_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
ALTER TABLE `driverSecurityDepositTransactions` ADD CONSTRAINT `fk_dst_account` FOREIGN KEY (`depositAccountId`) REFERENCES `driverSecurityDeposits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDepositTransactions` ADD CONSTRAINT `fk_dst_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDepositTransactions` ADD CONSTRAINT `fk_dst_driver` FOREIGN KEY (`driverUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDepositTransactions` ADD CONSTRAINT `fk_dst_creator` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDeposits` ADD CONSTRAINT `fk_dsd_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDeposits` ADD CONSTRAINT `fk_dsd_driver` FOREIGN KEY (`driverUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `driverSecurityDeposits` ADD CONSTRAINT `fk_dsd_creator` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD CONSTRAINT `fk_fle_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD CONSTRAINT `fk_fle_branch` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD CONSTRAINT `fk_fle_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD CONSTRAINT `fk_fle_creator` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `driver_deposit_transactions_date_idx` ON `driverSecurityDepositTransactions` (`depositAccountId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `financial_ledger_scope_date_idx` ON `financialLedgerEntries` (`restaurantId`,`branchId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `financial_ledger_reference_idx` ON `financialLedgerEntries` (`referenceType`,`referenceId`);