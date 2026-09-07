# اختبار شاشة 210001

الرابط: https://3000-ih9d1id636xjnnvw979q6-a037131e.us4.manus.computer/tv/210001?kiosk=1

النتيجة بعد ربط `/manus-storage/nfood_drive_probe_ea7e85d8` بالشريحة 150153:

- عنصر الفيديو موجود في DOM: `videoCount = 1`.
- `paused = false`، `muted = true`، `loop = true`، `readyState = 4`.
- المدة المقروءة: نحو 37.15 ثانية، والزمن الحالي يتحرك.
- مصدر الفيديو يعمل عبر مسار NFOOD التخزيني.
- الفيديو مرئي بحجم viewport كامل (`1280×1100`) لكن parent class هو `grid-cols-1`، لذلك لا يظهر التخطيط «فيديو يسار · شرائح يمين»؛ الصورة/طبقة العرض الحالية فوقه أو تستخدم التخطيط الأحادي.
- استجابة publicPlayback لا تُظهر `displayLayout`، لذا يجب إضافة الحقل إلى payload العام ثم إعادة الاختبار.
