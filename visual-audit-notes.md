# Visual audit notes — offline POS and direction pass

- Desktop dashboard captured in French (LTR): the sidebar is anchored on the left and the main canvas reserves the left margin; the header remains visible.
- Mobile dashboard captured in French (LTR): the compact header and metric grid render without global horizontal overflow in the captured viewport.
- Public menu captured in English (LTR): the header and waiter-call action are visible; the menu drawer trigger is present and the product area begins below the hero.
- Public menu on mobile: the bottom navigation remains visible and the waiter-call panel is visible. The screenshot shows the page content continuing below the viewport, which is expected; no runtime crash was observed.
- Follow-up visual validation should include an Arabic RTL session and an offline POS browser session after the service worker has been installed in production-like mode.

## RTL follow-up

- Desktop dashboard with `?lang=ar`: the sidebar is visibly on the right, the main dashboard content reserves the right-side width, and the header controls mirror correctly.
- Desktop public menu with `?lang=ar`: the waiter-call action and social rail mirror to the right, while the reservation/menu actions remain readable.
- Mobile dashboard with `?lang=ar`: the menu trigger is on the right and the metric/content layout remains inside the viewport.
- Mobile public menu with `?lang=ar`: the header, waiter-call panel, menu title, and bottom navigation are visible without an RTL horizontal overflow in the captured viewport.

## Final admin RTL audit

بعد إضافة لوحة متوسط استجابة النادل، بقيت واجهة Overview العربية مستقرة على سطح المكتب والهاتف: الشريط الجانبي ظاهر يمينًا، زر فتح القائمة في موضعه، وبطاقات المؤشرات ومساحة العمل ضمن إطار العرض دون قص ظاهر. تظهر البيانات التشغيلية في اللقطة دون انزياح أفقي.

## Translation dictionary pagination audit

تمت مراجعة مساحة إدارة المنيو على سطح المكتب والهاتف بالعربية. الإطار العام وRTL والشريط الجانبي مستقرون دون قص ظاهر. أدوات pagination ستظهر داخل مركز الترجمة بعد فتحه، مع التفاف مناسب على الشاشات الصغيرة؛ لم تُستخدم بطاقة كبيرة أو تمدد أفقي إضافي في الحاوية العامة.

## Product detail modal audit

تم فتح المسار العام الصحيح لـ Nasser Cafe (`/restaurant/nssercafa`) وظهرت بيانات المنيو والأصناف الفعلية في محتوى الصفحة. المسار `nasser-cafe` غير موجود ويعرض صفحة خطأ، لذلك لا يُستخدم للتقييم. لقطة المتصفح الأولى للمسار الصحيح كانت أثناء حالة skeleton/loading، وتحتاج إعادة عرض بعد اكتمال التحميل قبل الحكم على النافذة المنبثقة بصريًا.

## Product detail modal live check

تم فتح صنف «حلا» من منيو Nasser Cafe فعليًا. ظهرت النافذة في المنتصف، والصورة محصورة داخل الحافة العلوية دون overflow، وزر الإغلاق ظاهر فوق الصورة بحجم لمس واضح، والمحتوى والتذييل داخل مساحة النافذة مع خلفية معتمة وتمويه للخلفية. لا يزال يلزم اختبار الإغلاق نفسه على سطح المكتب والهاتف قبل اعتماد النسخة.

## Product detail close regression

تم الضغط على زر «إغلاق» في المعاينة الحية. اختفت نافذة التفاصيل وعادت عناصر المنيو وأزراره للظهور، ولم يبقَ عنصر إغلاق أو overlay ظاهرًا في DOM المرئي. هذا يؤكد أن الإغلاق المخصص يستجيب ويعيد الحالة الطبيعية.

## Final computed modal measurements

أظهر فحص DOM للنافذة المفتوحة: قفل body = hidden، overlay = rgba(0,0,0,.6) مع blur(4px)، زر الإغلاق 41px تقريبًا، الصورة 200px داخل عرض النافذة، ومحتوى التفاصيل overflow-y = auto. ظهر max-width محسوبًا 450px بدل 480px، لذلك يجري فحص تعارض CSS/الـ rem قبل الاعتماد النهائي.

## Post-restart modal verification

بعد إعادة تشغيل خادم التطوير عاد منيو Nasser Cafe للتحميل ببيانات الأصناف الفعلية، مع ظهور إشعار PWA فقط كعنصر إضافي. النافذة المنبثقة أُغلقت مع إعادة التحميل كما هو متوقع، ثم أُعيد فتحها من زر تفاصيل الصنف للتحقق من النسخة المحدثة.

## Modal selector retry

بعد إعادة التشغيل والتحميل الكامل، بقيت قائمة Nasser Cafe ظاهرة ببياناتها. النقر الأخير استهدف حاوية بطاقة «برجر دبل تشيز» بدل زر «عرض تفاصيل»، لذلك لم يفتح modal؛ ستتم إعادة المحاولة على زر التفاصيل المفهرس الصحيح.

## Final modal computed verification after restart

بعد إعادة تشغيل الخادم وفتح زر التفاصيل الصحيح، أصبحت القياسات الفعلية: عرض النافذة 480px، حد العرض الأقصى 480px، الصورة بعرض النافذة وارتفاع 200px مع max-height 200px، محتوى التفاصيل overflow-y = auto، زر الإغلاق نحو 41px، وbody overflow = hidden. تم بذلك حل تعارض النسخة القديمة 30rem التي كانت تحسب 450px.

[2026-08-28] فحص صفحة Cafe Nasser العامة على /restaurant/nssercafa: ظهرت صفحة خطأ فعلية بعد Skeleton، والسبب المعروض `Cannot access 'H' before initialization` مع Request ID ui-afe20194. يجب تحديد مرجع H غير المهيأ في RestaurantPublic أو imports قبل استئناف إعداد الفريق.

[2026-08-28] أُعيد تحميل Menu ناصر كافيه بعد تثبيت مستمع أخطاء مؤقت في المتصفح؛ بدأت الصفحة بحالة Skeleton، ويجري الآن استخراج stack trace لتحديد سبب `Cannot access 'H' before initialization` بدقة.

[2026-08-28] تكرر تعطل Menu ناصر كافيه بعد إعادة التحميل الكاملة، والرسالة نفسها `Cannot access 'H' before initialization` مع Request ID ui-564f6b01؛ المشكلة runtime ثابتة وليست حالة تحميل مؤقتة.
