# NFOOD Environment Reference

هذا الملف مرجع للمطور فقط. لا تضع القيم الحقيقية داخل المستودع؛ استخدم مدير الأسرار في بيئة التطوير والإنتاج.

## التشغيل الأساسي

| المتغير | الاستخدام |
|---|---|
| `NODE_ENV` | تحديد بيئة التشغيل |
| `DATABASE_URL` | اتصال MySQL أو TiDB |
| `JWT_SECRET` | توقيع جلسات الدخول |
| `VITE_APP_ID` | معرّف تطبيق OAuth |
| `OAUTH_SERVER_URL` | خادم OAuth |
| `VITE_OAUTH_PORTAL_URL` | بوابة تسجيل الدخول في الواجهة |
| `OWNER_OPEN_ID` و`OWNER_NAME` | هوية مالك المشروع |

## Manus APIs

يحتاج الخادم إلى `BUILT_IN_FORGE_API_URL` و`BUILT_IN_FORGE_API_KEY`. وتستخدم الواجهة `VITE_FRONTEND_FORGE_API_URL` و`VITE_FRONTEND_FORGE_API_KEY` عند الحاجة إلى خدمات الواجهة المسموح بها.

## البريد والإشعارات

يستخدم SMTP المتغيرات `SMTP_HOST` و`SMTP_PORT` و`SMTP_USER` و`SMTP_PASSWORD` و`SMTP_FROM_EMAIL` لإرسال قبول الحجز وإلغاء عدم الحضور. لا تظهر كلمة المرور في الواجهة أو السجلات. إشعارات Web Push تستخدم `WEB_PUSH_PUBLIC_KEY` و`WEB_PUSH_PRIVATE_KEY` و`WEB_PUSH_SUBJECT`.

## الهوية والتحليلات

يتم ضبط اسم المنصة وشعارها عبر `VITE_APP_TITLE` و`VITE_APP_LOGO`. التحليلات الاختيارية تستخدم `VITE_ANALYTICS_ENDPOINT` و`VITE_ANALYTICS_WEBSITE_ID`.

## الإعداد المحلي

يجب إدخال هذه القيم من إعدادات Secrets في بيئة المشروع أو مدير أسرار مستقل. بعد ضبطها شغّل `pnpm dev`، ثم تحقّق من `pnpm test -- --run` و`pnpm exec tsc --noEmit` و`pnpm run build`.
