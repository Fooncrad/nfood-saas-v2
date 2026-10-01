CREATE TABLE IF NOT EXISTS `subscriptionInvoices` (
  `id` int AUTO_INCREMENT NOT NULL,
  `restaurantId` int NOT NULL,
  `subscriptionId` int,
  `transferReceiptId` int NOT NULL,
  `invoiceNumber` varchar(80) NOT NULL,
  `plan` varchar(80) NOT NULL,
  `billingCycle` enum('monthly','yearly') NOT NULL DEFAULT 'monthly',
  `amount` decimal(10,2) NOT NULL,
  `currencyCode` varchar(3) NOT NULL DEFAULT 'SAR',
  `paymentMethod` enum('bank_transfer','manual') NOT NULL DEFAULT 'bank_transfer',
  `paymentReference` varchar(180),
  `status` enum('issued','cancelled','refunded') NOT NULL DEFAULT 'issued',
  `issuedAt` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `subscriptionInvoices_id` PRIMARY KEY(`id`),
  CONSTRAINT `subscriptionInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`),
  CONSTRAINT `subscriptionInvoices_transferReceiptId_unique` UNIQUE(`transferReceiptId`)
);
