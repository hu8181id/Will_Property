CREATE TABLE `property_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`propertyType` varchar(64) NOT NULL,
	`transactionType` varchar(32) NOT NULL DEFAULT 'dijual',
	`price` bigint NOT NULL,
	`location` varchar(255) NOT NULL,
	`address` varchar(500),
	`area` int,
	`bedrooms` int,
	`bathrooms` int,
	`floor` varchar(64),
	`tower` varchar(64),
	`view` varchar(128),
	`condition` varchar(64),
	`certificate` varchar(128),
	`facilities` json DEFAULT ('[]'),
	`images` json NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `property_listings_status_idx` ON `property_listings` (`status`);--> statement-breakpoint
CREATE INDEX `property_listings_created_at_idx` ON `property_listings` (`createdAt`);--> statement-breakpoint
CREATE INDEX `property_listings_location_idx` ON `property_listings` (`location`);