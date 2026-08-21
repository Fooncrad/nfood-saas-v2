ALTER TABLE `orders` ADD `deliveryStatus` enum('unassigned','assigned','picked_up','out_for_delivery','delivered','failed','returned') DEFAULT 'unassigned' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryEtaMinutes` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryFailureReason` varchar(500);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryNote` varchar(1000);