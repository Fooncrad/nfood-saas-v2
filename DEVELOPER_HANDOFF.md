# NFOOD Restaurant SaaS — Developer Handoff

## نطاق التسليم

هذه الحزمة تمثل الكود الحالي لمشروع **NFOOD Restaurant SaaS** في الإصدار `065bccbf`. الواجهة مبنية باتجاه RTL أولًا وتدعم العربية والإنجليزية والفرنسية والأردية. تتضمن النسخة لوحة المنصة، بوابة المطعم، المنيو العامة، الطلبات، الحجوزات والطاولات، POS، KDS، التسويق، الشاشات، PWA، التحليلات، ومكونات المصادقة والصلاحيات.

> رابط النشر الحالي: https://nfoodsaas-3tqzpsrg.manus.space/

> رابط منيو Nasser Cafe: https://nfoodsaas-3tqzpsrg.manus.space/restaurant/nssercafa

## المكدس التقني

| المجال | التقنية |
|---|---|
| الواجهة | React 19 + Vite + TypeScript |
| التنسيق | Tailwind CSS 4 + shadcn/ui + CSS semantic tokens |
| الخادم | Express 4 + tRPC 11 |
| قاعدة البيانات | MySQL/TiDB + Drizzle ORM |
| المصادقة | Manus OAuth ومصادقة اختبارية محلية للأدوار |
| الملفات | S3 عبر helpers المشروع |
| البريد | SMTP عبر Nodemailer، ويستخدم لحالات الحجز |
| الوقت الحقيقي | WebSocket لمزامنة الشاشات |
| التطبيق | PWA وService Worker وتحديث خلفي |
| الاختبارات | Vitest |

## التشغيل المحلي

يتطلب المشروع Node.js 22 أو أحدث وpnpm. بعد فك الضغط نفّذ:

```bash
pnpm install
pnpm dev
```

لبناء نسخة الإنتاج والتحقق من الخادم:

```bash
pnpm exec tsc --noEmit
pnpm test -- --run
pnpm run build
```

لا تُنشئ ملف `.env` داخل المستودع ولا ترفع أي قيم سرية إلى Git. يجب توفير متغيرات البيئة عبر مدير الأسرار أو بيئة النشر.

## متغيرات البيئة

| المتغير | الاستخدام |
|---|---|
| `DATABASE_URL` | اتصال MySQL/TiDB |
| `JWT_SECRET` | توقيع الجلسات |
| `VITE_APP_ID` | معرّف تطبيق OAuth |
| `OAUTH_SERVER_URL` | خادم OAuth |
| `VITE_OAUTH_PORTAL_URL` | بوابة تسجيل الدخول في الواجهة |
| `OWNER_OPEN_ID` و`OWNER_NAME` | بيانات مالك المشروع |
| `BUILT_IN_FORGE_API_URL` و`BUILT_IN_FORGE_API_KEY` | خدمات Manus المدمجة، ومنها التخزين وLLM |
| `VITE_FRONTEND_FORGE_API_URL` و`VITE_FRONTEND_FORGE_API_KEY` | خدمات Manus المسموح بها من الواجهة |
| `SMTP_HOST` | مضيف البريد، مثل `smtp.hostinger.com` |
| `SMTP_PORT` | منفذ SMTP، مثل `587` |
| `SMTP_USER` | بريد الإرسال |
| `SMTP_PASSWORD` | كلمة مرور بريد الإرسال |
| `SMTP_FROM_EMAIL` | عنوان From الظاهر للمستلم |

## خريطة المشروع

```text
client/
  index.html                 إعداد HTML والخط والـmanifest
  src/App.tsx                التوجيه ومسارات التطبيق
  src/index.css              توكنات Plum & Amber وقواعد RTL العامة
  src/pages/Home.tsx         لوحة المنصة وبوابة المطعم
  src/pages/RestaurantPublic.tsx  المنيو العامة والطلب والحجز
  src/pages/PublicDisplay.tsx     تشغيل الشاشات العامة
  src/components/             مكونات الواجهة المشتركة
  src/contexts/                اللغة والثيم
  public/                     ملفات PWA الصغيرة وService Worker

drizzle/
  schema.ts                  مخطط الجداول والعلاقات
  migrations/                migrations المطبقة

server/
  db.ts                      استعلامات Drizzle وعزل المستأجرين
  routers.ts                 عقود tRPC والإجراءات
  reservations.ts            فحص إلغاء عدم الحضور الدوري
  reservationEmail.ts        قوالب رسائل الحجز عبر SMTP
  storage.ts                 تكامل S3
  _core/                     طبقة تشغيل Manus والخادم

shared/                      أنواع وثوابت مشتركة
storage/                     helpers التخزين
```

## أهم المسارات العامة

| المسار | الوظيفة |
|---|---|
| `/` | الصفحة العامة أو لوحة المستخدم بعد المصادقة |
| `/admin` و`/admin/account` | aliases آمنة لفتح التطبيق من اختصار الإدارة أو PWA |
| `/dashboard` | alias للوحة التطبيق |
| `/restaurant/:slug` | المنيو العامة للمطعم |
| `/menu/:slug` | alias للمنيو العامة |
| `/display/:token` | شاشة العرض العامة |
| `/restaurant/:slug/display` | شاشة العميل للمطعم |
| `/customer/:slug` و`/vcard/:slug` | صفحات العميل العامة |

## قواعد التطوير المهمة

يجب استدعاء إجراءات الخادم عبر tRPC وعدم إضافة طبقة Axios أو REST موازية. كل إجراء خاص بالمطعم يجب أن يتحقق من `restaurantId` والفرع والدور قبل قراءة البيانات أو تعديلها. ملفات الصور والفيديو والملفات الكبيرة تُرفع إلى S3 ولا تُحفظ داخل `client/public` أو داخل مستودع التطبيق.

عند تعديل قاعدة البيانات، حدّث `drizzle/schema.ts` أولًا، ولّد migration عبر Drizzle، راجع SQL، ثم طبّقه من خلال آلية إدارة قاعدة البيانات المعتمدة. لا تستخدم أوامر SQL تدميرية دون مراجعة واضحة. يجب إضافة اختبار Vitest لكل تدفق جديد، مع تغطية النجاح والفشل والعزل بين المطاعم.

## الترجمة والاتجاه

اللغات المدعومة هي `ar` و`en` و`fr` و`ur`. يجب استخدام LanguageContext والنصوص المترجمة بدل النصوص الثابتة داخل المكونات. اللغة العربية والأردية تستخدمان `dir="rtl"`، والإنجليزية والفرنسية تستخدمان `dir="ltr"`. لا تعتمد صفحة المنيو على لغة المتصفح وحدها؛ يجب إبقاء زر التبديل اليدوي فعالًا.

## الحجز والطاولات

الحجز يُرسل مع عدد الأشخاص والتاريخ والوقت والبريد. الخادم يبحث عن طاولة مناسبة في نفس المطعم والفرع، ويمنع تعارض الحجوزات المتداخلة. عند نجاح التخصيص يُقبل الحجز وتُرسل رسالة SMTP. مهمة Heartbeat تفحص الحجوزات المؤكدة التي تجاوزت وقتها مضافًا إليه مهلة المطعم، ثم تلغيها مرة واحدة وترسل رسالة عدم الحضور.

## التسليم والنشر

ملف ZIP المرفق يحتوي المصدر الحالي دون `node_modules` أو `dist` أو `.env` أو السجلات. بعد أي تعديل مهم شغّل TypeScript والاختبارات والبناء، ثم أنشئ checkpoint جديدًا حتى يمكن مراجعة الإصدار أو استرجاعه. لا تعتمد على رابط `3000-...manus.computer` كرابط إنتاج؛ ذلك رابط معاينة مؤقت.
