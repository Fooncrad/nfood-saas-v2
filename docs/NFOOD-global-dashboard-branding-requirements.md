نعم، وهذه من أفضل التطويرات لـ NFOOD. الأفضل أن تجعل **لوحة التحكم نفسها قابلة للتخصيص حسب الباقة**، وليس فقط شعار المطعم وألوانه.

الفكرة: **كلما ارتفعت الباقة، زادت قدرة المطعم على تخصيص هويته وتجربته، مع بقاء Design System الأساسي ثابتًا.**

يمكنك إرسال هذا للمطور مباشرة:

# NFOOD — Global Dashboard & Subscription-Based Branding

## الهدف

تطوير لوحة تحكم NFOOD الحالية إلى لوحة تحكم SaaS عالمية بمستوى احترافي، مع إضافة **نظام تخصيص هوية المطعم حسب باقة الاشتراك**.

لا يتم إعادة بناء المشروع من الصفر.

يجب تطوير الواجهات الحالية وتحسين UX/UI مع الحفاظ على الوظائف الموجودة وقاعدة البيانات والمنطق الحالي قدر الإمكان.

---

# 1. Global Restaurant Dashboard

أريد أن تكون لوحة تحكم المطعم بمستوى منتجات SaaS العالمية.

التصميم يجب أن يكون:

* Modern
* Premium
* Minimal
* Fast
* Responsive
* Mobile First
* RTL/LTR
* Light/Dark
* Accessible

مع استخدام الهوية الأساسية لـ NFOOD:

### Plum

`#4A1D4A`

### Amber

`#D97706`

لكن بدون إجبار جميع المطاعم على استخدام ألوان NFOOD في واجهة العميل.

---

# 2. Dashboard Layout

## Desktop

Sidebar + Topbar + Main Content

### Sidebar

Logo

Dashboard

Orders

Menu

Reservations

Tables

Customers

Inventory

Employees

Reports

Marketing

Settings

مع إظهار/إخفاء العناصر حسب:

* Role
* Subscription Plan
* Feature Access

---

# 3. Topbar

يحتوي على:

### Branch Selector

`All Branches`

أو:

`Riyadh Branch`

### Global Search

`Ctrl + K`

### Notifications

### Language

AR / EN / FR

### Theme

Light / Dark / System

### Restaurant Profile

Logo + Restaurant Name

---

# 4. Dashboard الرئيسية

لا نريد Dashboard مليئة بالبطاقات.

استخدم Hierarchy واضحة.

## القسم الأول

### Today's Overview

Sales

Orders

Reservations

Average Order

Customers

---

## القسم الثاني

### Live Operations

طلبات جديدة

طلبات قيد التحضير

طلبات جاهزة

طاولات مشغولة

حجوزات قادمة

---

## القسم الثالث

### Business Insights

Sales Chart

Orders Chart

Top Products

Branch Performance

---

## القسم الرابع

### Action Center

يعرض المشاكل التي تحتاج تدخلًا:

🔴 طلب متأخر

🟠 مخزون منخفض

🟡 حجز قريب

🔵 منتج غير متوفر

---

# 5. Dashboard قابلة للتخصيص

كل مدير يستطيع تخصيص Dashboard الخاصة به.

### Widgets

يمكن:

* إظهار Widget
* إخفاء Widget
* تغيير الترتيب
* Drag & Drop
* تغيير حجم Widget

مثلاً:

Sales

Orders

Revenue

Top Products

Reservations

Inventory

Customers

---

# 6. Dashboard Templates

توفير قوالب جاهزة:

### Restaurant Manager

### Branch Manager

### Cashier

### Operations

### Owner

بحيث لا يرى كل مستخدم نفس المعلومات.

---

# 7. Subscription-Based Branding

هذه أهم إضافة.

يجب إنشاء نظام:

**Plan → Branding Features**

كل باقة تحدد مستوى التخصيص المسموح به.

---

# 8. Free Plan

التخصيص الأساسي فقط.

### مسموح:

* اسم المطعم
* شعار المطعم
* صورة المطعم
* لون أساسي محدود
* Light Mode
* NFOOD Branding ظاهر

### غير مسموح:

* إزالة NFOOD Branding
* Custom Domain
* تخصيص كامل للمنيو
* CSS مخصص
* Fonts مخصصة

ويظهر بجانب الميزات المقفلة:

🔒 متوفر في Premium

---

# 9. Starter Plan

إضافة:

* Logo
* Cover
* Primary Color
* Secondary Color
* Light/Dark
* Menu Theme
* Button Style
* Card Style
* QR Branding

مع بقاء:

**Powered by NFOOD**

---

# 10. Professional Plan

إضافة تخصيص أكبر:

* Custom Primary Color
* Secondary Color
* Accent Color
* Custom Menu Theme
* Custom Fonts من قائمة معتمدة
* Custom Button Style
* Custom Card Style
* إزالة بعض عناصر NFOOD Branding من Public Menu
* تخصيص صفحة المطعم
* تخصيص QR
* تخصيص صفحة الطلب
* Custom Favicon

---

# 11. Enterprise Plan

تخصيص كامل تقريبًا.

### Branding

* Full Brand Colors
* Logo
* Favicon
* Custom Fonts
* Custom Menu Design
* Custom Login Branding
* Custom Customer Pages
* Custom Email Branding
* Custom QR Branding

### White Label

إزالة:

Powered by NFOOD

واستخدام هوية المطعم بالكامل.

### Custom Domain

مثال:

`menu.restaurant.com`

بدلاً من:

`nfood.com/r/restaurant`

---

# 12. Branding Editor

إنشاء صفحة:

**Settings → Branding**

بتصميم Visual Editor.

بدل إدخال أكواد.

---

# 13. Live Preview

الصفحة مقسمة إلى:

### اليسار

Customization Controls

### اليمين

Live Preview

مثلاً:

Logo

Primary Color

Secondary Color

Font

Button

Cards

Menu Style

---

# 14. Theme Presets

إضافة Themes جاهزة.

مثلاً:

### Classic

### Modern

### Luxury

### Minimal

### Dark

### Elegant

### Fast Food

### Coffee

### Fine Dining

المطعم يختار Theme ثم يعدله.

---

# 15. Color Editor

المطعم يختار:

Primary

Secondary

Accent

Background

Text

ويجب إنشاء Semantic Tokens تلقائيًا.

مثال:

```text
primary
primaryForeground
secondary
accent
background
surface
text
muted
border
success
warning
danger
```

لا يتم تخزين ألوان Components بشكل منفصل.

---

# 16. Automatic Contrast

إذا اختار المطعم لونًا غير مناسب:

يظهر:

### اللون يحتاج إلى تحسين التباين

مع اقتراح تلقائي:

**استخدام درجة أكثر وضوحًا**

حتى لا ينتج تصميم غير قابل للقراءة.

---

# 17. Logo Management

رفع:

* Logo
* Dark Logo
* Light Logo
* Favicon
* Cover Image

مع:

* Image Compression
* WebP
* Automatic Resize
* Preview

---

# 18. Menu Branding

تخصيص Public Menu:

* Header
* Logo
* Background
* Categories
* Product Cards
* Buttons
* Price
* Badges
* Cart
* Checkout

---

# 19. Customer Experience Branding

الهوية المخصصة يجب أن تظهر في:

### Public Menu

### Cart

### Checkout

### Order Tracking

### Reservation

### QR

### Customer Screens

حسب الباقة.

---

# 20. QR Branding

المطعم يستطيع في الباقات المدفوعة:

* Logo داخل QR
* Brand Color
* QR Frame
* CTA
* Table Number
* Branch Name

مثال:

**SCAN TO ORDER**

Table 12

---

# 21. Feature Gating

يجب عدم بناء نظام مختلف لكل باقة.

استخدم Feature Flags.

مثال:

```text id="d1g3zt"
branding.logo
branding.colors
branding.dark_mode
branding.custom_font
branding.menu_theme
branding.remove_nfood
branding.custom_domain
branding.white_label
```

كل Feature لها:

`ON`

`OFF`

`LIMITED`

`ADD-ON`

---

# 22. Subscription Limits

الباقة لا تحدد Features فقط.

بل تحدد Limits.

مثلاً:

### Free

1 Branch

50 Products

2 Employees

### Starter

3 Branches

500 Products

10 Employees

### Professional

10 Branches

Unlimited Products

50 Employees

### Enterprise

Unlimited

---

# 23. Upgrade UX

إذا ضغط المستخدم على Feature غير متاحة:

لا يظهر Error.

تظهر نافذة:

### هذه الميزة متوفرة في Professional

مع:

* ما الذي سيحصل عليه؟
* السعر
* المزايا
* Upgrade

مثال:

> احصل على Custom Branding + White Label + Custom Domain

**Upgrade Plan**

---

# 24. Plan Comparison

داخل:

**Settings → Subscription**

اعرض:

Current Plan

Usage

Features

Limits

Billing

Upgrade

---

# 25. Usage Meter

مثلاً:

### Products

420 / 500

████████░░ 84%

### Employees

7 / 10

███████░░░ 70%

### Branches

2 / 3

██████░░░░ 67%

عند الاقتراب من الحد:

🟠 You're approaching your limit.

---

# 26. Brand Lock

عند تغيير الباقة:

يجب ألا تضيع الهوية.

مثلاً:

المطعم كان Professional ثم انتقل إلى Starter.

يتم:

* الاحتفاظ بالبيانات.
* تعطيل الميزات غير المتاحة.
* عدم حذف إعدادات Branding.

إذا عاد إلى Professional:

تعود الإعدادات السابقة تلقائيًا.

---

# 27. Preview Before Upgrade

إذا كانت ميزة غير متاحة:

يمكن للمستخدم رؤية:

**Preview**

لكن لا يتم تطبيقها فعليًا.

مثلاً:

Enterprise White Label Preview.

---

# 28. Admin Control

Super Admin يستطيع التحكم في:

### Plans

### Features

### Limits

### Overrides

مثال:

مطعم معين يحصل على:

Custom Domain

رغم أن الباقة لا تحتوي عليه.

Feature Override:

`ON`

---

# 29. Subscription Feature Matrix

إنشاء Matrix داخل Super Admin:

| Feature       | Free    | Starter | Pro     | Enterprise |
| ------------- | ------- | ------- | ------- | ---------- |
| Logo          | ✓       | ✓       | ✓       | ✓          |
| Colors        | Limited | ✓       | ✓       | ✓          |
| Dark Mode     | —       | ✓       | ✓       | ✓          |
| Custom Font   | —       | —       | ✓       | ✓          |
| Custom Menu   | —       | ✓       | ✓       | ✓          |
| Remove NFOOD  | —       | —       | Limited | ✓          |
| Custom Domain | —       | —       | —       | ✓          |
| White Label   | —       | —       | —       | ✓          |

يجب أن تكون هذه القيم Dynamic من قاعدة البيانات، وليست Hard-coded.

---

# 30. Super Admin Branding Control

من لوحة Super Admin:

**Restaurant → Branding**

يستطيع المشرف رؤية:

* Current Theme
* Current Logo
* Current Colors
* Plan
* Enabled Features

مع إمكانية:

Reset Branding

أو:

Override Feature

---

# 31. Global Design Tokens

يجب الفصل بين:

### NFOOD Platform Theme

و:

### Restaurant Brand Theme

بحيث:

Super Admin يستطيع تحديث هوية NFOOD بدون تدمير هويات المطاعم.

وكل مطعم يستطيع تخصيص Public Experience حسب صلاحيات الباقة.

---

# 32. Theme Architecture

استخدم Theme Provider.

المبدأ:

```text
NFOOD Base Theme
        ↓
Restaurant Theme
        ↓
Plan Restrictions
        ↓
User Interface
```

أي أن المطعم لا يستطيع تجاوز صلاحيات الباقة بمجرد تعديل Frontend.

التحقق النهائي يجب أن يكون Backend-side.

---

# 33. Security

لا تعتمد على:

`if plan === "pro"`

في Frontend فقط.

يجب أن يتحقق Backend من:

* Restaurant
* Subscription
* Feature
* Limit
* User Permission

قبل حفظ أي تخصيص أو استخدام Feature مدفوعة.

---

# 34. Dashboard Personalization

إضافة:

**Customize Dashboard**

يمكن للمدير اختيار:

* Widgets
* Layout
* Density
* Default Branch
* Default Date Range

---

# 35. Display Density

إضافة:

Comfortable

Compact

Spacious

ليختار المستخدم كثافة البيانات.

---

# 36. Command Center

إضافة قسم:

### What needs your attention?

مثال:

🔴 2 طلبات متأخرة

🟠 3 منتجات منخفضة المخزون

🟡 حجز بعد 15 دقيقة

🟢 المبيعات +18%

وهذا القسم يكون أهم من عشرات Charts.

---

# 37. Smart Insights

بدلاً من عرض:

Revenue: 14,500

اعرض:

> المبيعات أعلى بنسبة 18% من أمس.

بدلاً من:

Orders: 124

اعرض:

> أكثر وقت ازدحامًا اليوم بين 8:00 و10:00 مساءً.

---

# 38. Responsive Dashboard

Desktop:

3–4 Columns

Tablet:

2 Columns

Mobile:

1 Column

مع إمكانية ترتيب Widgets حسب الأولوية.

---

# 39. Mobile Dashboard

على الهاتف:

أول شيء يظهر:

### Today's Summary

ثم:

### Live Orders

ثم:

### Attention

ثم:

### Insights

ولا يتم تحميل Charts الثقيلة إلا عند الحاجة.

---

# 40. النتيجة المطلوبة

أريد أن يشعر صاحب المطعم أن NFOOD لديه:

**لوحة تحكم عالمية**

وفي نفس الوقت:

**منصة يمكنه تحويلها إلى هويته الخاصة.**

الفرق بين الباقات يجب أن يكون واضحًا بصريًا ووظيفيًا.

---

# قاعدة مهمة

لا تجعل الباقات مجرد:

"عدد منتجات أكثر"

بل اجعلها تتدرج في:

**Power → Control → Branding → Automation → Scale**

بحيث يشعر العميل أن الترقية لها قيمة حقيقية.

---

# الهدف النهائي

NFOOD Free:

**ابدأ بسهولة**

NFOOD Starter:

**شغّل مطعمك**

NFOOD Professional:

**طوّر علامتك**

NFOOD Enterprise:

**امتلك تجربتك بالكامل**

ويجب أن تكون عملية الترقية سهلة، واضحة، وبدون فقدان أي بيانات أو إعدادات سابقة.
