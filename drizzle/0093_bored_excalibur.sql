ALTER TABLE `contentPurchaseOrders` ADD `receiptAmountMatch` enum('not_checked','matched','mismatch','unknown') DEFAULT 'not_checked' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `receiptAmountDifference` decimal(10,2);--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `rejectionReason` varchar(500);