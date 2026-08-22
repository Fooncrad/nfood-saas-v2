ALTER TABLE `orders` MODIFY COLUMN `channel` enum('dine_in','takeaway','delivery','reservation','hotel') NOT NULL DEFAULT 'dine_in';--> statement-breakpoint
ALTER TABLE `orders` ADD `partySize` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `pickupPoint` varchar(240);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryAddress` varchar(500);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryLatitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryLongitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryFee` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `reservationDate` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `hotelName` varchar(180);--> statement-breakpoint
ALTER TABLE `orders` ADD `hotelRoom` varchar(80);--> statement-breakpoint
ALTER TABLE `orders` ADD `hotelFloor` varchar(40);