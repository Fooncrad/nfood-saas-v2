import { provisionNasserTestCatalog, provisionNasserDeliveryTestData, getDb } from "../server/db.ts";

const restaurantId = 60001;
const catalog = await provisionNasserTestCatalog(restaurantId);
const delivery = await provisionNasserDeliveryTestData(restaurantId);
const db = await getDb();
if (!db) throw new Error("Database is not available");
console.log(JSON.stringify({ catalog, delivery: { driver: delivery.driver, location: delivery.location } }, null, 2));
