CREATE TABLE `contentPurchaseEntitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`listingId` int NOT NULL,
	`sourceMediaFileId` int NOT NULL,
	`buyerUserId` int NOT NULL,
	`deliveredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cpe_id_pk` PRIMARY KEY(`id`),
	CONSTRAINT `cpe_purchase_listing_uq` UNIQUE(`purchaseOrderId`,`listingId`)
);
--> statement-breakpoint
ALTER TABLE `contentPurchaseEntitlements` ADD CONSTRAINT `cpe_order_fk` FOREIGN KEY (`purchaseOrderId`) REFERENCES `contentPurchaseOrders`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `contentPurchaseEntitlements` ADD CONSTRAINT `cpe_listing_fk` FOREIGN KEY (`listingId`) REFERENCES `contentListings`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `contentPurchaseEntitlements` ADD CONSTRAINT `cpe_media_fk` FOREIGN KEY (`sourceMediaFileId`) REFERENCES `mediaFiles`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `contentPurchaseEntitlements` ADD CONSTRAINT `cpe_buyer_fk` FOREIGN KEY (`buyerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `cpe_buyer_delivered_idx` ON `contentPurchaseEntitlements` (`buyerUserId`,`deliveredAt`);
