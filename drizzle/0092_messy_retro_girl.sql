ALTER TABLE `contentPurchaseOrders` ADD `receiptExtractedAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `receiptExtractedDate` varchar(40);--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `receiptExtractionConfidence` decimal(5,4);--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `receiptExtractedAt` timestamp;