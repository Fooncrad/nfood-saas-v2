# Menu layout verification — 2026-09-05

## الصفحة المختبرة
- URL: https://3000-ih9d1id636xjnnvw979q6-a037131e.us4.manus.computer/menu/nssercafa
- المطعم: Nasser Cafe
- slug: nssercafa

## نتائج قياس البطاقة
- بطاقة `#menu-item-2940015` أصبحت `display:flex` بارتفاع فعلي 141px في معاينة سطح المكتب.
- صف زر الإضافة `.nfood-menu-cart-row` عاد داخل البطاقة: `x=105`, `w=32`, بدل الموضع السابق خارجها `x=-135`.
- عنوان الصنف أصبح مرنًا بعرض 193px، والسعر منفصل، والوصف مقصوص داخل الحاوية.
- الشارة «متاح» والقلب في موضعيهما داخل زاويتي الصورة.

## نتائج نافذة التفاصيل
- السبب الجذري لانحياز النافذة: خاصية CSS `translate: -50% -50%` كانت تعمل مع `transform: translate(-50%, -50%)` في وقت واحد، فتدفع النافذة إلى اليسار والأعلى مرتين.
- بعد إزالة translate utility من primitive وإزالة class التحريك الجانبي من RestaurantPublic، أصبح القياس المستقر: `innerWidth=1280`, `innerHeight=1100`, `centerX=640=innerWidth/2`, `centerY=550=innerHeight/2`, `translate=none`.
- نافذة التفاصيل ظهرت بصريًا في مركز الشاشة بعد إعادة تشغيل خادم التطوير.
- تعتيم الخلفية كان ما يزال 60% بسبب selector أعلى specificity: `body:has([data-slot="dialog-content"].nfood-product-detail-dialog) [data-slot="dialog-overlay"]`. تمت إضافة override لاحق لخفضه إلى 35% مع blur 2px، ويجب إعادة تحميل الصفحة للتحقق من القيمة النهائية.

## ملاحظة
- لم يتم بعد تشغيل Vitest/build أو اختبار السلة/نافذة نداء الويتر بعد هذا التعديل.
