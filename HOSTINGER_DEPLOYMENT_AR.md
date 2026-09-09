# دليل نشر NFOOD على Hostinger

## سبب الخطأ الظاهر

رسالة `Cannot find module .../pnpm.cjs` تعني أن Hostinger يحاول تشغيل pnpm من Corepack cache قديم أو ناقص. الخطأ يحدث قبل بناء NFOOD، لذلك لا يدل على خطأ في React أو Express أو قاعدة البيانات.

## البيئة المطلوبة

استخدم **Node.js 22.13 أو أحدث ضمن الإصدار 22**. المشروع يحتاج تشغيل خادم Node، لذلك يجب استخدام Hostinger Node.js App أو VPS، وليس الاستضافة المشتركة التي تخدم ملفات HTML فقط.

| الإعداد | القيمة |
|---|---|
| Node.js | 22.13.x أو أحدث ضمن 22.x |
| Install command | `npm install --include=dev --no-audit --no-fund` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Working directory | مجلد المشروع الذي يحتوي `package.json` |
| Port | استخدم متغير `PORT` الذي توفره Hostinger؛ لا تثبت رقمًا في الإعدادات |
| Node environment | `production` |

## الخطوات العملية

ارفع المشروع إلى Hostinger مع الملفات الأساسية التالية: `package.json` و`package-lock.json` إن توفر ومجلدات `client` و`server` و`shared` و`drizzle` و`patches` وجميع ملفات الإعداد. لا ترفع `node_modules` من جهازك؛ دع Hostinger يثبت الاعتمادات عبر npm.

في إعداد Node.js App، اختر Node 22، واختر **npm** بدل **pnpm**. هذا يتجاوز Corepack الذي يحاول تحميل `pnpm.cjs` المفقود. استخدم أمر التثبيت التالي:

```bash
npm install --include=dev --no-audit --no-fund
```

بعد نجاح التثبيت شغّل البناء:

```bash
npm run build
```

ثم اجعل أمر بدء التطبيق:

```bash
npm run start
```

إذا كانت لوحة Hostinger لا تسمح بأمر تثبيت مخصص، افتح Terminal/SSH الخاص بالتطبيق ونفّذ:

```bash
corepack disable || true
npm install --include=dev --no-audit --no-fund
npm run build
npm run start
```

لا تستخدم زر pnpm في Hostinger؛ الخطأ الحالي يأتي من Corepack الذي يحاول تشغيل pnpm 12.3.4 من مسار cache ناقص.

## متغيرات البيئة المطلوبة

أضف متغيرات الإنتاج من إعدادات Hostinger Secrets/Environment، ولا تضعها داخل Git أو داخل `package.json`.

| المتغير | الاستخدام |
|---|---|
| `DATABASE_URL` | اتصال MySQL/TiDB الإنتاجي |
| `JWT_SECRET` | توقيع الجلسات |
| `VITE_APP_ID` | تطبيق OAuth |
| `OAUTH_SERVER_URL` | خادم OAuth |
| `VITE_OAUTH_PORTAL_URL` | بوابة الدخول |
| `BUILT_IN_FORGE_API_URL` | خدمات Manus المدمجة |
| `BUILT_IN_FORGE_API_KEY` | مفتاح الخدمات الخلفية |
| `VITE_FRONTEND_FORGE_API_URL` | خدمات الواجهة |
| `VITE_FRONTEND_FORGE_API_KEY` | مفتاح خدمات الواجهة |
| `OWNER_OPEN_ID` و`OWNER_NAME` | مالك التطبيق |
| `SMTP_HOST` و`SMTP_PORT` و`SMTP_USER` و`SMTP_PASSWORD` و`SMTP_FROM_EMAIL` | البريد والإشعارات |
| متغيرات التخزين | بيانات S3/Manus storage حسب البيئة المتصلة |

بعد إضافة المتغيرات أعد تشغيل التطبيق، لأن Vite يقرأ متغيرات `VITE_*` أثناء البناء.

## قاعدة البيانات

أنشئ قاعدة MySQL منفصلة في Hostinger، ثم ضع `DATABASE_URL` بصيغة اتصال Hostinger. نفّذ ترحيلات Drizzle من بيئة آمنة قبل تشغيل الإنتاج، ولا تنفذ أوامر حذف أو reset على قاعدة الإنتاج.

تأكد من فتح اتصال قاعدة البيانات من خادم التطبيق، ومن تفعيل SSL إذا كانت Hostinger تتطلبه. إذا فشل التطبيق بعد البناء، ابدأ بفحص `DATABASE_URL` و`JWT_SECRET` وسجل الخادم قبل إعادة البناء.

## فحص النجاح

بعد النشر، تحقق من الآتي:

```bash
node --version
npm --version
npm run check
npm test
```

ثم افتح النطاق وتحقق من تسجيل الدخول، المنيو العام، API، شاشة العرض، ومركز الطلبات. إذا كان التطبيق يعمل على Autoscale أو Reverse Proxy، تأكد أن Hostinger يمرر WebSocket لأن بعض وظائف التزامن الفوري تعتمد عليه.

## ملاحظة مهمة

منصة Manus هي بيئة الاستضافة المتوافقة أصلًا مع المشروع، بينما Hostinger يحتاج ضبط Node وMySQL وWebSocket والتخزين يدويًا. إذا استمر Hostinger في فرض Corepack أو لم يسمح بأمر تثبيت pnpm صريح، فاستخدام Manus أو Hostinger VPS مع SSH سيكون أكثر ملاءمة من الاستضافة المشتركة.
