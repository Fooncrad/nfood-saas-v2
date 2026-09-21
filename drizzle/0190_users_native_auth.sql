ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255);
ALTER TABLE `users` ADD COLUMN `accountRole` enum('admin','restaurant_admin','waiter','kitchen','bar','cashier','customer','driver') NOT NULL DEFAULT 'customer';
