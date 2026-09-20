CREATE TABLE `business_departments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `restaurant_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `name` varchar(160) NOT NULL,
  `code` varchar(80),
  `is_active` boolean NOT NULL DEFAULT true,
  `modules_json` text,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `business_departments_id` PRIMARY KEY(`id`),
  CONSTRAINT `business_departments_restaurant_id_restaurants_id_fk` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE cascade,
  CONSTRAINT `business_departments_branch_id_branches_id_fk` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `business_departments_branch_idx` ON `business_departments` (`branch_id`,`is_active`);
--> statement-breakpoint
CREATE INDEX `business_departments_restaurant_idx` ON `business_departments` (`restaurant_id`);
