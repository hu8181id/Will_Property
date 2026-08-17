CREATE TABLE `property_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`propertyTitle` varchar(255) NOT NULL,
	`source` enum('listing_whatsapp','general_whatsapp') NOT NULL DEFAULT 'listing_whatsapp',
	`visitorId` varchar(64),
	`path` varchar(512),
	`status` enum('new','contacted','archived') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `property_leads_property_id_idx` ON `property_leads` (`propertyId`);--> statement-breakpoint
CREATE INDEX `property_leads_created_at_idx` ON `property_leads` (`createdAt`);--> statement-breakpoint
CREATE INDEX `property_leads_status_idx` ON `property_leads` (`status`);