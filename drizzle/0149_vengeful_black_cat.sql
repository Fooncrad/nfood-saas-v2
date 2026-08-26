ALTER TABLE `orders` MODIFY COLUMN `paymentStatus` enum('unpaid','pending','paid','failed','partially_refunded','refunded','cancelled') NOT NULL DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE `remoteTasks` MODIFY COLUMN `paymentStatus` enum('unpaid','pending','paid','failed','partially_refunded','refunded','cancelled') NOT NULL DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `paymentMethod` enum('manual','bank_transfer','card','online','wallet','other') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `paymentStatus` enum('unpaid','pending','paid','failed','partially_refunded','refunded','cancelled') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `refundAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `refundedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `invoicePrintStatus` enum('not_printed','queued','printed','failed') DEFAULT 'not_printed' NOT NULL;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `invoicePrintedAt` timestamp;--> statement-breakpoint
ALTER TABLE `contentPurchaseOrders` ADD `invoicePrintError` varchar(500);--> statement-breakpoint
ALTER TABLE `orders` ADD `receiptPrintStatus` enum('not_printed','queued','printed','failed') DEFAULT 'not_printed' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `receiptPrintedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `receiptPrintError` varchar(500);--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD `invoicePrintStatus` enum('not_printed','queued','printed','failed') DEFAULT 'not_printed' NOT NULL;--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD `invoicePrintedAt` timestamp;--> statement-breakpoint
ALTER TABLE `remoteTasks` ADD `invoicePrintError` varchar(500);--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `paymentMethod` enum('manual','bank_transfer','card','online','wallet','other') DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `paymentStatus` enum('unpaid','pending','paid','failed','partially_refunded','refunded','cancelled') DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `refundAmount` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `paidAt` timestamp;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `refundedAt` timestamp;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `printStatus` enum('not_printed','queued','printed','failed') DEFAULT 'not_printed' NOT NULL;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `printedAt` timestamp;--> statement-breakpoint
ALTER TABLE `vcardCardOrders` ADD `printError` varchar(500);