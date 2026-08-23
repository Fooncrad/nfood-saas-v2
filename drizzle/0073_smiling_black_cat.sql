ALTER TABLE `orders` ADD `clientRequestId` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_restaurant_client_request_uidx` UNIQUE(`restaurantId`,`clientRequestId`);