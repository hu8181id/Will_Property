ALTER TABLE `property_listings` ADD `slug` varchar(320);--> statement-breakpoint
ALTER TABLE `property_listings` ADD `slug` varchar(320);--> statement-breakpoint
ALTER TABLE `property_listings` ADD CONSTRAINT `property_listings_slug_unique` UNIQUE(`slug`);
