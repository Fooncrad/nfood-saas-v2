ALTER TABLE platform_entities
  ADD COLUMN country_code VARCHAR(2) NOT NULL DEFAULT 'SA' AFTER email;

ALTER TABLE platform_entities
  ADD COLUMN city VARCHAR(120) NULL AFTER country_code;

ALTER TABLE platform_entities
  ADD COLUMN timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Riyadh' AFTER city;

ALTER TABLE platform_entities
  ADD COLUMN currency_code VARCHAR(3) NOT NULL DEFAULT 'SAR' AFTER timezone;

ALTER TABLE platform_entities
  ADD COLUMN primary_language VARCHAR(10) NOT NULL DEFAULT 'ar' AFTER currency_code;

CREATE INDEX platform_entities_country_idx
  ON platform_entities (country_code, status);

CREATE INDEX platform_entities_country_sector_idx
  ON platform_entities (country_code, sector, status);
