import mysql from "mysql2/promise";

const imageSets = [
  { category: "burger", title: "برجر اختبار", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=82" },
  { category: "desserts", title: "حلويات اختبار", url: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=82" },
  { category: "coffee", title: "قهوة اختبار", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=82" },
  { category: "meals", title: "وجبة اختبار", url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=82" },
];
const tags = { burger: ["برجر", "مشويات"], desserts: ["حلويات", "حلوى"], coffee: ["قهوة", "مشروبات ساخنة"], meals: ["وجبات", "طعام"] };

const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [customers] = await db.query("SELECT id, email, displayName FROM testAccounts WHERE role = 'customer' AND isActive = 1 ORDER BY id");
  if (!customers.length) throw new Error("لا توجد حسابات عميل اختبار نشطة");
  const now = new Date();
  for (const account of customers) {
    const openId = `test_${account.id}`;
    await db.execute(
      "INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, 'test_login', 'user', ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)",
      [openId, account.displayName, account.email, now],
    );
    const [[user]] = await db.query("SELECT id FROM users WHERE openId = ? LIMIT 1", [openId]);
    if (!user?.id) throw new Error(`تعذر ربط المستخدم لحساب ${account.email}`);
    const [[wallet]] = await db.query("SELECT id, balance FROM walletAccounts WHERE customerId = ? LIMIT 1", [user.id]);
    if (!wallet) {
      await db.execute("INSERT INTO walletAccounts (customerId, currencyCode, balance) VALUES (?, 'SAR', '100.00')", [user.id]);
      const [[createdWallet]] = await db.query("SELECT id FROM walletAccounts WHERE customerId = ? LIMIT 1", [user.id]);
      await db.execute("INSERT INTO walletTransactions (walletAccountId, customerId, type, amount, balanceAfter, referenceType, referenceId, note) VALUES (?, ?, 'adjustment', '100.00', '100.00', 'test_seed_wallet', ?, 'رصيد اختبار أولي')", [createdWallet.id, user.id, account.id]);
    } else if (Number(wallet.balance) !== 100) {
      await db.execute("UPDATE walletAccounts SET balance = '100.00', updatedAt = ? WHERE id = ?", [now, wallet.id]);
      const [[seedMovement]] = await db.query("SELECT id FROM walletTransactions WHERE walletAccountId = ? AND referenceType = 'test_seed_wallet' LIMIT 1", [wallet.id]);
      if (!seedMovement) await db.execute("INSERT INTO walletTransactions (walletAccountId, customerId, type, amount, balanceAfter, referenceType, referenceId, note) VALUES (?, ?, 'adjustment', '100.00', '100.00', 'test_seed_wallet', ?, 'تصحيح رصيد اختبار إلى 100 ريال')", [wallet.id, user.id, account.id]);
    }
    for (const item of imageSets) {
      const originalName = `test-customer-${account.id}-${item.category}.jpg`;
      const [[existingMedia]] = await db.query("SELECT id FROM mediaFiles WHERE ownerUserId = ? AND originalName = ? AND isDeleted = 0 LIMIT 1", [user.id, originalName]);
      const mediaId = existingMedia?.id ?? (await db.execute("INSERT INTO mediaFiles (ownerUserId, scope, originalName, storageKey, publicUrl, contentType, sizeBytes, category, isDeleted, uploadedByUserId, virusScanStatus, virusScanVersion, virusScannedAt) VALUES (?, 'user', ?, ?, ?, 'image/jpeg', 250000, 'image', 0, ?, 'clean', 'test-seed', ?)", [user.id, originalName, `test-seed/${account.id}/${item.category}.jpg`, item.url, user.id, now]))[0].insertId;
      const [[existingReview]] = await db.query("SELECT id FROM contentModerationReviews WHERE mediaFileId = ? LIMIT 1", [mediaId]);
      if (!existingReview) await db.execute("INSERT INTO contentModerationReviews (mediaFileId, status, reason, scanVersion, captureMethod, capturedAt, deviceModel, watermarkApplied, reviewedAt) VALUES (?, 'approved', NULL, 'test-seed-v1', 'camera', ?, 'Test Camera', 1, ?)", [mediaId, now, now]);
      const [[existingListing]] = await db.query("SELECT id FROM contentListings WHERE mediaFileId = ? LIMIT 1", [mediaId]);
      if (!existingListing) await db.execute("INSERT INTO contentListings (restaurantId, mediaFileId, ownerUserId, title, description, contentCategory, visibility, foodTagsJson, watermarkEnabled, price, currencyCode, status) VALUES (NULL, ?, ?, ?, ?, ?, 'public', ?, 1, '5.00', 'SAR', 'published')", [mediaId, user.id, item.title, `محتوى اختبار آمن لفئة ${item.category}`, item.category, JSON.stringify(tags[item.category])]);
    }
    console.log(`تم تجهيز ${account.email}: أربع صور + رصيد 100 SAR`);
  }
} finally {
  await db.end();
}
