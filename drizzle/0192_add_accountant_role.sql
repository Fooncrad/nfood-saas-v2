-- Add the accountant application role without deleting or rewriting user records.
ALTER TABLE `users`
  MODIFY COLUMN `accountRole` ENUM('admin','restaurant_admin','waiter','kitchen','bar','cashier','accountant','customer','driver')
  NOT NULL DEFAULT 'customer';
