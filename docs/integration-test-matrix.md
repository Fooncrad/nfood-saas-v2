# مصفوفة الاختبارات المرحلية — NFOOD Restaurant SaaS

تصف هذه المصفوفة مستوى الاختبار الموجود فعليًا في النسخة الحالية، ولا تعتبر اختبارات المصدر الثابت أو اختبارات الوحدات بديلًا عن اختبار المتصفح الكامل.

| مجموعة الميزات | اختبار/ملف مرتبط | المستوى الحالي | النطاق المثبت | الحدود الحالية |
|---|---|---|---|---|
| المصادقة وحسابات الاختبار | `server/auth.testlogin.test.ts`, `server/auth.logout.test.ts` | تكامل tRPC وقاعدة البيانات | تسجيل الدخول، التحقق من كلمة المرور، الخروج والجلسات | OAuth Google/Apple وOTP وPasskey غير موصولة |
| عزل المطاعم والصلاحيات | `server/platform.router.test.ts`, `server/role-permissions.test.ts` | تكامل tRPC مع guards وpersistence جزئي | منع cross-tenant، صلاحيات الأدوار، الإدارة المركزية، CRUD المنيو، الطلبات، System Health وGuest Checkout | لا يوجد اختبار متصفح E2E لكل زر وفرع |
| POS وKDS والطلبات | `server/platform.router.test.ts`, `server/platform.schema.test.ts` | تكامل persistence | إنشاء الطلب وبنوده وتحديث الحالة والتنظيف | realtime الإنتاجي ما زال polling كل 5 ثوانٍ |
| الحجوزات | `server/platform.router.test.ts`, `client/src/lib/placeholderAudit.test.ts` | تكامل tRPC + static UI audit | guards، حالات loading/empty/error وRequest ID | لا يوجد E2E متصفح لتفاعل المستخدم الكامل |
| المنيو والمخزون والمشتريات والموظفون | `server/platform.router.test.ts`, `server/platform.schema.test.ts` | تكامل tRPC وschema | CRUD وحواجز الملكية واختبارات persistence مختارة | لا يوجد تغطية تكامل مستقلة لكل نموذج UI |
| Remote Work والإشعارات | `server/remote-work.router.test.ts`, `server/remote-work.schema.test.ts`, `server/push-config.test.ts` | تكامل tRPC وschema | transitions، ownership، الرسائل، اشتراك Push | لا يوجد اختبار Push فعلي عبر متصفح وجهاز خارجي |
| Guest Checkout والصفحة العامة | `server/platform.router.test.ts`, `client/src/lib/placeholderAudit.test.ts` | تكامل tRPC وstatic UI audit | التحقق من المطعم والفرع والصنف والسعر، حفظ بيانات الضيف والدفع غير المدفوع، وربط السلة بالصفحة | تحويل الضيف إلى Customer، إعادة الطلب وAbandoned Cart غير منفذة |
| PWA وbranding | `client/src/lib/placeholderAudit.test.ts`, manifests الدور، `Home.tsx` | static UI audit | manifests RTL، تبديل الدور، branding الديناميكي، theme-color وmanifest blob | اختبار التثبيت والخدمة دون اتصال يحتاج متصفحًا فعليًا |
| System Health وAudit Trail | `server/platform.router.test.ts`, `client/src/lib/placeholderAudit.test.ts` | تكامل tRPC + static UI audit | حالة API/DB، Request ID، عرض أحداث التدقيق | المراقبة الخارجية والتشخيص الآلي المتقدم غير منفذين |
| Feature Access وSaaS Analytics | `server/platform.router.test.ts`, `server/admin.lifecycle.test.ts` | تكامل tRPC وpersistence جزئي | dependencies، limits، overrides، MRR/ARR/churn | لا يوجد اختبار تحميل أو مراقبة إنتاجية مستمرة |

## سياسة التفسير

تشير عبارة **تكامل tRPC** إلى أن الإجراء استُدعي عبر router مع قاعدة البيانات أو حارس الصلاحيات عند الحاجة. وتشير عبارة **static UI audit** إلى فحص مصدر الواجهة لمنع التراجع في الربط والحالات، ولا تثبت نجاح النقر في متصفح حقيقي. أما التدفقات التي تعتمد على OAuth خارجي أو Push خارجي أو قناة realtime إنتاجية فتظل غير مكتملة إلى أن تتوفر بيئة المزود والقناة المناسبة.

## نتيجة النسخة الحالية

آخر تشغيل موثق قبل هذه المصفوفة نجح في **94 اختبارًا** موزعة على 16 ملفًا. المصفوفة توثق التغطية المرحلية الفعلية وتمنع وصفها بأنها تغطية E2E شاملة.
