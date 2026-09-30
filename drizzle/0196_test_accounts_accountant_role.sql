-- Extend restaurant team accounts with the accountant role without deleting or rewriting rows.
ALTER TABLE `testAccounts`
  MODIFY COLUMN `role` ENUM('admin','restaurant_admin','waiter','kitchen','bar','cashier','accountant','customer','driver')
  NOT NULL;
