CREATE TABLE `property_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`authorName` varchar(128) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `property_reviews_property_id_idx` ON `property_reviews` (`propertyId`);