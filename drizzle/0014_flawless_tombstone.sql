ALTER TABLE `property_leads` ADD `deliveryStatus` varchar(32) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `property_leads` ADD `deliveryError` text;--> statement-breakpoint
ALTER TABLE `property_leads` ADD `whatsappMessageId` varchar(128);