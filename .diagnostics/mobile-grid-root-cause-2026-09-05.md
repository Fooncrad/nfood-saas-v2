# سبب استمرار ثلاثة أعمدة — 2026-09-05

القياس الفعلي من DOM في معاينة منيو Nasser Cafe أظهر:

- viewport المعاينة الحالية: 1280x1100.
- شبكة الأصناف الفعلية: `.nfood-menu-grid.category-results.grid.items-stretch.gap-3.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4`.
- الشبكة المحسوبة في سطح المكتب: `350px 350px 350px`.
- البطاقة المحسوبة: عرض 350px وdisplay:flex وبداخلها عمودا محتوى وصورة.
- الأب الفعلي: `nfood-menu-theme nfood-customer-redesign nfood-menu-template-editorial nfood-menu-shell nfood-menu-cardless`.

الخطأ في override السابق أنه قُيّد بـ `.nfood-customer-redesign.nfood-menu-cards`، بينما الصفحة الفعلية تستخدم `nfood-menu-cardless` ولا تستخدم `nfood-menu-cards`. لذلك لم تصل قاعدة عمود واحد إلى الشبكة الفعلية. الإصلاح التالي يجب أن يستهدف `.nfood-menu-shell .nfood-menu-grid` مباشرة في الجوال، مع `grid-template-columns: minmax(0,1fr)` و`grid-column: 1/-1` للبطاقة.
