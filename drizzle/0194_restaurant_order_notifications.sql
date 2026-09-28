-- Per-restaurant order notification control.
-- Non-destructive: adds a feature definition and enables it for existing restaurants.
INSERT INTO featureDefinitions (`key`, label, description, dependencyKey, defaultLimit, isAddOn, addonPrice)
SELECT 'notifications.order_push', 'إشعارات الطلبات للمطعم', 'إشعار فوري وصوتي عند وصول طلب جديد، مع تحكم Super Admin لكل مطعم.', NULL, NULL, 0, NULL
WHERE NOT EXISTS (SELECT 1 FROM featureDefinitions WHERE `key` = 'notifications.order_push');

INSERT INTO restaurantFeatures (restaurantId, featureId, enabled, overrideLimit, overrideValue)
SELECT r.id, f.id, 1, NULL, NULL
FROM restaurants r
JOIN featureDefinitions f ON f.`key` = 'notifications.order_push'
LEFT JOIN restaurantFeatures rf ON rf.restaurantId = r.id AND rf.featureId = f.id
WHERE rf.id IS NULL;
