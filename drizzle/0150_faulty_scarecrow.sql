CREATE TABLE `commerceFundingAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`restaurantId` int,
	`accountType` enum('merchant_purchase','customer_purchase','platform_purchase') NOT NULL DEFAULT 'merchant_purchase',
	`currencyCode` varchar(8) NOT NULL DEFAULT 'SAR',
	`availableBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`status` enum('active','suspended','closed') NOT NULL DEFAULT 'active',
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commerceFundingAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` MODIFY COLUMN `paymentSource` enum('wallet','manual','purchase_account','external_channel') NOT NULL DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `purchaseAccountId` int;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `operatingFundsExcluded` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `invoiceNumber` varchar(80);--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD `fundingAccountId` int;--> statement-breakpoint
ALTER TABLE `commerceFundingAccounts` ADD CONSTRAINT `commerceFundingAccounts_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commerceFundingAccounts` ADD CONSTRAINT `commerceFundingAccounts_restaurantId_restaurants_id_fk` FOREIGN KEY (`restaurantId`) REFERENCES `restaurants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commerceFundingAccounts` ADD CONSTRAINT `commerceFundingAccounts_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `commerce_funding_owner_type_idx` ON `commerceFundingAccounts` (`ownerUserId`,`accountType`);--> statement-breakpoint
CREATE INDEX `commerce_funding_restaurant_idx` ON `commerceFundingAccounts` (`restaurantId`);--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD CONSTRAINT `content_orders_funding_account_fk` FOREIGN KEY (`purchaseAccountId`) REFERENCES `commerceFundingAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `financialLedgerEntries` ADD CONSTRAINT `ledger_funding_account_fk` FOREIGN KEY (`fundingAccountId`) REFERENCES `commerceFundingAccounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `financial_ledger_funding_account_idx` ON `financialLedgerEntries` (`fundingAccountId`,`createdAt`);