CREATE TABLE `scoped_role_assignments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `restaurant_id` int,
  `branch_id` int,
  `department_id` int,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `scoped_role_assignments_id` PRIMARY KEY(`id`),
  CONSTRAINT `scoped_role_assignments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
  CONSTRAINT `scoped_role_assignments_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade,
  CONSTRAINT `scoped_role_assignments_restaurant_id_restaurants_id_fk` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE cascade,
  CONSTRAINT `scoped_role_assignments_branch_id_branches_id_fk` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE cascade,
  CONSTRAINT `scoped_role_assignments_department_id_business_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `business_departments`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scoped_role_assignments_user_idx` ON `scoped_role_assignments` (`user_id`,`is_active`);
--> statement-breakpoint
CREATE INDEX `scoped_role_assignments_scope_idx` ON `scoped_role_assignments` (`restaurant_id`,`branch_id`,`department_id`);
