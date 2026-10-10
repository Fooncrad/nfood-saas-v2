# NFOOD — المرجع الاستراتيجي للمنظومة الرقمية المتقدمة

> الحالة: مرجع معماري تنفيذي — الإصدار الأول
> الهدف: تطوير الموجود دون تكرار الأنظمة أو كسر العزل المالي أو عزل المستأجرين.

## 1. الرؤية
NFOOD ليست مجرد منصة مطاعم أو متجر NFC. النواة المستهدفة هي منظومة هوية وأصول وتجارب رقمية تربط الشخص، النشاط، المحتوى، المكتبة، التجارة، QR وNFC ضمن هوية موحدة وسجل موثوق.

المبدأ: **هوية واحدة، سياقات متعددة، أصول موثقة، مفاتيح وصول ذكية، ودفاتر مالية معزولة.**

## 2. ما هو موجود ويعاد استخدامه
يجب إعادة استخدام الأنظمة الحالية وعدم إنشاء نسخ موازية:
- Customer Portal وملف العميل.
- Studio وصناعة/رفع المحتوى.
- Content Marketplace.
- Customer Content Library وطلبات المحتوى.
- Content Listings / Purchase Orders / Entitlements / Moderation.
- Wallets وFinancial Ledger.
- Commerce Funding Account والعزل المالي لمشتريات المحتوى.
- VCard/NFC Products, Orders, Codes, Bindings وطلبات البطاقات.
- QR Codes.
- Marketplace وصفحات الأنشطة المستقلة.
- نظام المطاعم والفروع والمنيو والطلبات والحجوزات والطاولات والطابور والتوصيل والمخزون والمشتريات.

## 3. نموذج الهوية الموحد
لا يُعامل role كهوية الشخص. المستخدم يملك Identity واحدة ويمكن أن تكون له عدة سياقات متزامنة:
- Customer
- Creator
- Business Owner
- Business Member
- Platform Admin بصلاحيات مستقلة

لا ينشأ حساب جديد لمجرد تفعيل Creator أو إنشاء نشاط. البريد الموثق يعاد استخدامه للهوية نفسها، بينما العضويات والصلاحيات والملفات المالية تبقى مستقلة.

## 4. Digital Passport
لكل شخص أو نشاط جواز رقمي داخلي دائم يربط:
- identity
- public profile
- owned businesses
- creator profile
- vault/library
- smart touchpoints
- cards/keys
- permissions
- financial accounts
- provenance/audit history

## 5. Digital Fingerprint & Provenance
كل أصل رقمي قابل للتوثيق يحصل على:
- immutable asset id
- owner identity
- SHA-256 fingerprint عند الإدخال/الإصدار
- createdAt
- version
- source/provenance
- visibility
- lifecycle status

البصمة تثبت النسخة التي سجلتها المنصة وتاريخها، ولا يتم تقديمها منفردة كإثبات قانوني نهائي للملكية.

## 6. NFOOD Vault
تطوير المكتبة الحالية إلى Vault موحد مع Views منطقية:
- My Originals
- Purchased
- Licensed to Others
- For Sale
- Drafts
- NFC & Digital Keys
- QR Assets
- Documents
- Receipts & Certificates
- Private Files

الملف الخاص لا يظهر في Marketplace إلا عبر عملية Publish صريحة.

## 7. Creator Commerce
الدورة القياسية:
Upload → fingerprint → moderation → pricing/license → publish → purchase → server-side payment verification → entitlement/license → buyer vault → ledger split.

الأصل يبقى لصانعه. المشتري يحصل على Entitlement/License محدد النطاق والحالة.

## 8. العزل المالي
قاعدة غير قابلة للكسر:
**Business Operating Funds ≠ Platform Purchase Account ≠ Creator Earnings ≠ Platform Revenue.**

- POS/طلبات/توصيل النشاط لا تمول شراء المحتوى تلقائيًا.
- المتجر يمول Commerce Funding Account مستقل لمشتريات المحتوى/خدمات المنصة.
- أرباح Creator تدخل محفظة/دفتر Creator.
- عمولة NFOOD تدخل دفتر المنصة.
- كل حركة لها reference/idempotency/audit.
- لا يغير شراء NFC أو محتوى مؤشرات المبيعات التشغيلية للنشاط.

## 9. Smart Touchpoint Engine
توحيد QR وNFC والروابط الذكية تحت كيان منطقي واحد.

Touchpoint:
- owner scope: user/business/branch
- carrier: NFC_CARD, NFC_KEY, QR, STICKER, TABLE_TAG, DIGITAL_LINK
- destination type
- destination reference
- policy
- status
- analytics policy

Resolver:
Touch → secure NFOOD resolver → validate binding/status/policy → resolve destination → record privacy-safe event → redirect/render.

## 10. وجهات NFC/QR
يدعم المحرك:
- Personal Profile
- Creator Store
- Business Page
- QR Menu
- Location
- Reviews
- Booking
- Queue
- Order
- Loyalty
- WhatsApp
- Contact Exchange
- Campaign
- Smart Landing
- Safe Custom URL

الوجهة قابلة للتغيير دون إعادة طباعة أو برمجة البطاقة.

## 11. NFC للأفراد
دورة البطاقة:
Product → Order → Payment → Issue Code → Manufacture/Ship → Claim/Activation → Binding → Active.

يمكن ربط البطاقة بالملف الشخصي أو Creator Store أو Smart Landing. لا تخزن بيانات شخصية حساسة على الشريحة؛ تخزن معرف/رابط resolver آمن.

## 12. NFC للأنشطة
تفعيل من المنصة/الباقة ثم شراء بطاقات حسب الاستخدام. يمكن للنشاط امتلاك عدة Touchpoints للمنيو والموقع والتقييم والحجز والطابور والولاء والحملات، مع نطاق business/branch واضح.

## 13. Dynamic & Contextual Routing
الـSmart Landing والسياسات تسمح بتغيير الوجهة حسب إعداد مصرح به مثل الوقت، الفرع، الحملة، حالة الخدمة أو اللغة. يجب أن تكون السياسات deterministic وقابلة للتدقيق، ولا تستخدم بيانات حساسة دون أساس وموافقة.

## 14. Trust Layer
حالات ثقة منفصلة:
- Verified Identity
- Verified Business
- Verified Creator
- Original Asset Record
- Licensed Entitlement
- Verified NFC/QR Binding

لا تخلط شارة التحقق مع الملكية القانونية أو ضمان المحتوى.

## 15. Marketplace
Marketplace طبقة اكتشاف وتجميع وليست بديلًا عن الصفحات المستقلة. المطعم والمتجر وصانع المحتوى والخدمة لكل منهم صفحة مستقلة وهوية وQR/Touchpoints خاصة.

## 16. Authentication & Routing
Google/email يصادق على الشخص لا على role حصري. بعد المصادقة:
- Admin → admin
- safe returnTo → المصدر الأصلي
- otherwise → Account Hub
ثم يختار/يستأنف السياق المسموح له.
يمنع open redirects، ولا ينشأ نشاط أو Creator Profile تلقائيًا.

## 17. Account Hub — My NFOOD
المركز الموحد:
Profile · Vault · Studio · Marketplace · Purchases · Sales · Wallet · NFC & Keys · QR · Orders · Reservations · Rewards · Owned Businesses · Security.

Business Workspace يبقى مستقلًا تشغيليًا.

## 18. الأمن
- random opaque public tokens، لا IDs متسلسلة في NFC.
- revoke/replace/transfer workflows.
- rate limiting للresolver.
- server-side payment verification.
- idempotency للمشتريات/webhooks.
- tenant guard لكل business/branch read/write.
- signed/private asset delivery حيث يلزم.
- audit trail للتفعيل، النقل، النشر، الشراء، الاسترداد، الترخيص والتغيير.
- لا أسرار داخل المستودع.

## 19. التحليلات
Events موحدة لـ QR/NFC مع الحد الأدنى من البيانات:
touchpointId, entity scope, destination, timestamp, campaign, coarse device/referrer data عند السماح.
تظهر conversion funnels دون خلطها مع الحساب المالي التشغيلي.

## 20. Digital Legacy
الإرث الرقمي في المرحلة الحالية يعني سجلًا موثقًا للأصول والأعمال والتراخيص والإنجازات وتاريخ الهوية. أي نقل ملكية بعد الوفاة أو succession يُعامل كمشروع قانوني/أمني مستقل لاحقًا ولا يُفترض تلقائيًا.

## 21. مراحل التنفيذ
### Phase A — Foundation
توحيد المصطلحات والعقود، Account Context، safe returnTo، تعريف Digital Passport/Asset/Touchpoint دون تكرار الموجود.

### Phase B — Vault & Provenance
ترقية المكتبة إلى Vault، fingerprint/version/provenance، وربط Entitlements.

### Phase C — Smart NFC/QR
Resolver موحد، bindings متعددة الوجهات، إدارة البطاقات والمفاتيح، revoke/replace، analytics.

### Phase D — Creator Economy
توحيد Studio + Marketplace + licenses + moderation + pricing + commission + payout ledger.

### Phase E — Premium Experience
My NFOOD Account Hub، Creator Store، Business Touchpoint Center، Admin governance.

### Phase F — Trust & Scale
risk controls، observability، event analytics، export/certificates، performance، accessibility، localization.

## 22. قواعد التنفيذ
1. لا إعادة بناء نظام موجود باسم جديد.
2. لا migration مدمرة.
3. كل schema change backward-compatible ومراجع.
4. لا دمج قبل الاختبارات وNFOOD Verify.
5. لا كسر tenant isolation.
6. لا خلط مالي بين التشغيل والتجارة الرقمية.
7. لا أسرار في Git.
8. كل ميزة حساسة لها audit trail.
9. الواجهة Premium لكن المنطق والأمن أولًا.
10. main مرجع لاكتشاف الأنظمة الموجودة، وفرع الإنتاج هو أساس التكامل الآمن.

## 23. معيار النجاح
المستخدم يستطيع بهوية واحدة أن يشتري من مطعم، ينشر محتوى كCreator، يستلم عائده، يشتري محتوى لنشاط يملكه، يجد الترخيص في Vault النشاط، يطلب NFC/Key، يربطه بملفه أو نشاطه، ويغير وجهته من NFOOD — مع بقاء الأموال والصلاحيات والأصول والمستأجرين معزولة وقابلة للتدقيق.
