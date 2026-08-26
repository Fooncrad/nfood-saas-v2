import mysql from "mysql2/promise";
import { createHash } from "node:crypto";

const profiles = {
  5: {
    title: "صانع محتوى أكل ومشروبات",
    bio: "ملف اختبار لصانع محتوى متخصص في تصوير الأطباق والوصفات والخدمات الغذائية.",
    city: "الرياض",
    products: [
      { name: "برجر نوفا", type: "صورة غذائية", description: "صورة عرض احترافية لبرجر مع صوص خاص.", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=82", price: "5.00", currency: "SAR" },
      { name: "وصفة صوص البيت", type: "وصفة", description: "وصفة جزئية لصوص مناسب للبرجر والبطاطس.", imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=82", price: "8.00", currency: "SAR" },
      { name: "جلسة تصوير منيو", type: "خدمة", description: "تصوير مجموعة أطباق للمطاعم والمقاهي.", imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=82", price: "150.00", currency: "SAR" },
    ],
  },
  9990637: {
    title: "مصور وصفات منزلية",
    bio: "ملف اختبار يعرض صور الطعام والوصفات والخدمات المتعلقة بالمطبخ المنزلي.",
    city: "جدة",
    products: [
      { name: "حلويات موسمية", type: "صورة غذائية", description: "صورة حلويات مناسبة للعروض الموسمية.", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=82", price: "5.00", currency: "SAR" },
      { name: "وصفة كيك التمر", type: "وصفة", description: "خطوات مختصرة لوصفة كيك تمر عربية.", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=82", price: "8.00", currency: "SAR" },
      { name: "تنسيق طاولة ضيافة", type: "خدمة", description: "تنسيق وتصوير طاولة ضيافة للمناسبات.", imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&q=82", price: "120.00", currency: "SAR" },
    ],
  },
  10290044: {
    title: "ناصر · صانع محتوى غذائي",
    bio: "ملف اختبار ناصر لعرض الأطباق والوصفات والخدمات الغذائية عبر بطاقة NFOOD الرقمية.",
    city: "الرياض",
    products: [
      { name: "قهوة مختصة", type: "صورة غذائية", description: "صورة قهوة مختصة جاهزة للمعاينة المائية.", imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=82", price: "5.00", currency: "SAR" },
      { name: "وصفة باستا إيطالية", type: "وصفة", description: "معاينة وصفة باستا مع المكونات الأساسية.", imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=82", price: "8.00", currency: "SAR" },
      { name: "استشارة محتوى مطعم", type: "خدمة", description: "مراجعة أفكار التصوير والعرض لمنيو المطعم.", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=82", price: "200.00", currency: "SAR" },
    ],
  },
};

const paymentMethods = [
  { name: "wallet", label: "محفظة NFOOD", imageUrl: "https://dummyimage.com/96x96/101d31/f97316.png&text=NFOOD", instructions: "الدفع من رصيد المحفظة داخل المنصة." },
  { name: "bank_transfer", label: "تحويل بنكي", imageUrl: "https://dummyimage.com/96x96/0f766e/ffffff.png&text=BANK", instructions: "يتم رفع الإيصال للمراجعة قبل الاعتماد." },
  { name: "stc_pay", label: "STC Pay", imageUrl: "https://dummyimage.com/96x96/5b21b6/ffffff.png&text=STC", instructions: "طريقة اختبار للعرض فقط، وليست بوابة دفع مفعلة." },
];

const services = [
  { name: "تصوير الأطباق", description: "تصوير صور غذائية مناسبة للمنيو والتسويق." },
  { name: "بيع الوصفات", description: "وصفات جزئية مع عرض آمن قبل الشراء." },
];

const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [accounts] = await db.query("SELECT id, email, displayName FROM testAccounts WHERE role = 'customer' AND isActive = 1 ORDER BY id");
  for (const account of accounts) {
    const entry = profiles[account.id];
    if (!entry) continue;
    const openId = `test_${account.id}`;
    const [[user]] = await db.query("SELECT id, email, name FROM users WHERE openId = ? LIMIT 1", [openId]);
    if (!user?.id) throw new Error(`تعذر العثور على المستخدم المرجعي للحساب ${account.email}`);
    const slug = `nfood-customer-${account.id}`;
    await db.execute(
      "INSERT INTO customerProfiles (userId, slug, isPublic, defaultContentVisibility, displayName, title, bio, email, city, servicesJson, productsJson, paymentMethodsJson) VALUES (?, ?, 1, 'public', ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE displayName = VALUES(displayName), title = VALUES(title), bio = VALUES(bio), email = VALUES(email), city = VALUES(city), servicesJson = VALUES(servicesJson), productsJson = VALUES(productsJson), paymentMethodsJson = VALUES(paymentMethodsJson), isPublic = 1",
      [user.id, slug, account.displayName, entry.title, entry.bio, account.email, entry.city, JSON.stringify(services), JSON.stringify(entry.products), JSON.stringify(paymentMethods)],
    );
    const [[profile]] = await db.query("SELECT id, slug FROM customerProfiles WHERE userId = ? LIMIT 1", [user.id]);
    const productName = "بطاقة NFOOD NFC/V Card للعميل";
    const [[product]] = await db.query("SELECT id FROM vcardCardProducts WHERE name = ? AND targetRole = 'customer' LIMIT 1", [productName]);
    let productId = product?.id;
    if (!productId) {
      const [created] = await db.execute("INSERT INTO vcardCardProducts (name, description, price, currency, targetRole, isActive) VALUES (?, ?, '0.00', 'SAR', 'customer', 1)", [productName, "بطاقة اختبار مرتبطة بملف العميل العام عبر رابط ثابت."]);
      productId = created.insertId;
    }
    const codeValue = `NFOOD-NFC-${account.id}`;
    const codeHash = createHash("sha256").update(codeValue).digest("hex");
    const [[existingCode]] = await db.query("SELECT id, status FROM vcardCardCodes WHERE codeHash = ? LIMIT 1", [codeHash]);
    let codeId = existingCode?.id;
    if (!codeId) {
      const [createdCode] = await db.execute("INSERT INTO vcardCardCodes (productId, codeHash, codeLast4, status) VALUES (?, ?, ?, 'available')", [productId, codeHash, codeValue.slice(-4)]);
      codeId = createdCode.insertId;
    }
    const [[binding]] = await db.query("SELECT id FROM vcardCardBindings WHERE userId = ? LIMIT 1", [user.id]);
    if (!binding) {
      await db.execute("INSERT INTO vcardCardBindings (codeId, userId, customerProfileId, targetRole) VALUES (?, ?, ?, 'customer')", [codeId, user.id, profile.id]);
      await db.execute("UPDATE vcardCardCodes SET status = 'bound', boundAt = COALESCE(boundAt, NOW()) WHERE id = ?", [codeId]);
    } else {
      await db.execute("UPDATE vcardCardBindings SET customerProfileId = ?, targetRole = 'customer' WHERE id = ?", [profile.id, binding.id]);
      await db.execute("UPDATE vcardCardCodes SET status = 'bound', boundAt = COALESCE(boundAt, NOW()) WHERE id = ?", [codeId]);
    }
    console.log(`${account.displayName}: profile=${profile.id}, slug=${profile.slug}, 3 products, 3 payment methods, NFC=${codeValue}, link=/vcard/${profile.slug}`);
  }
} finally {
  await db.end();
}
