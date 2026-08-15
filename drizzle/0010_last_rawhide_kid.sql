ALTER TABLE `site_daily_visits` DROP INDEX `site_daily_visits_date_visitor_unique`;--> statement-breakpoint
ALTER TABLE `site_daily_visits` ADD `dailyFingerprint` varchar(64);--> statement-breakpoint
ALTER TABLE `site_daily_visits` ADD CONSTRAINT `site_daily_visits_date_fingerprint_unique` UNIQUE(`visitDate`,`dailyFingerprint`);