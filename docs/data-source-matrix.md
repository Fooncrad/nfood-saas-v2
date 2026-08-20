# مصفوفة مصادر البيانات التشغيلية

هذه المصفوفة توثق التدقيق المرحلي لمصادر البيانات في الواجهة، وتركز على منع القوائم التشغيلية الثابتة أو النسخ المحلية المكررة للمستخدم المسجل.

| الوحدة | المصدر التشغيلي | الحالة المحلية المسموحة | حماية التراجع |
|---|---|---|---|
| الطلبات وKDS | `remoteOrders` عبر tRPC مع polling | فلاتر العرض وحالة الاتصال وطابور Offline POS فقط | `placeholderAudit.test.ts` و`dataSourceAudit.test.ts` |
| MenuView | `remoteMenu` و`remoteCategories` عبر tRPC | نموذج التصنيف والصنف وتبديل الفلتر فقط | audit يمنع `menuProducts` الثابتة |
| ReservationsView | query الحجوزات عبر tRPC | حقول نموذج الإنشاء والفلاتر فقط | audit لحالات loading/empty/error وRequest ID |
| Inventory وPurchases | queries وmutations عبر tRPC | حقول النماذج وحالة الإرسال فقط | اختبارات router وschema وواجهة الأخطاء |
| Team وBranches وMarketing | queries وmutations عبر tRPC | نماذج التحرير وحالة dialog فقط | حالات loading/error/empty وإعادة المحاولة |
| RestaurantPublic وGuest Checkout | `publicRestaurantPage` و`guestCheckout` و`trackGuestOrder` و`reorderGuestOrder` | السلة وحقول الضيف وحقول التتبع فقط | server-side validation واختبارات persistence وstatic audit |
| Super Admin | admin tRPC queries/mutations | حالة النوافذ والفلاتر فقط | tenant/admin guards واختبارات الصلاحيات |

## قواعد التدقيق

لا تُعد السلة أو نموذج الإدخال أو الفلتر مصدرًا بديلًا للبيانات؛ هي حالة تفاعل مؤقتة. أما الأصناف والطلبات والحجوزات والمخزون والموظفون والفروع والحملات فتُقرأ من backend. ويُستثنى طابور Offline POS لأنه قناة تشغيل مقصودة عند انقطاع الشبكة، ولا يُحذف العنصر منه قبل نجاح mutation.

لا تغطي هذه المصفوفة كل تفاعل بصري في متصفح حقيقي؛ تغطي الوحدات الأساسية التي عُدّلت في الجولات الأخيرة، وتربط كل ادعاء باختبار أو guard أو audit معروف. أي وحدة غير مذكورة تحتاج اختبارًا مستقلًا قبل وصفها بأنها backend-only.
