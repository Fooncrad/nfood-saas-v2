CREATE INDEX `orderItems_order_id_idx` ON `orderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `orders_restaurant_branch_status_created_idx` ON `orders` (`restaurantId`,`branchId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_restaurant_created_at_idx` ON `orders` (`restaurantId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_driver_delivery_status_idx` ON `orders` (`driverId`,`deliveryStatus`,`updatedAt`);