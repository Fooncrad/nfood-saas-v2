import fs from "node:fs";
const path = "client/src/pages/RestaurantPublic.tsx";
let source = fs.readFileSync(path, "utf8");

source = source.replace(
  '  const [menuQrOpen, setMenuQrOpen] = useState(false);',
  '  const [menuQrOpen, setMenuQrOpen] = useState(false);\n  const [showHeaderBrand, setShowHeaderBrand] = useState(true);',
);

const headerStart = source.indexOf('    <header className="nfood-menu-header');
const headerEnd = source.indexOf('    </header>', headerStart);
if (headerStart < 0 || headerEnd < 0) throw new Error("menu header not found");
const header = `    <header className="nfood-menu-header sticky top-0 z-30 shrink-0 border-b border-slate-100 bg-white/95 text-slate-900 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <RestaurantLogo src={page.data.restaurant.brandLogoUrl} alt={copy.restaurantMenu + " " + restaurantName} imageClassName="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-100" fallbackClassName="h-6 w-6 rounded-xl text-[var(--menu-primary)]" />
          {showHeaderBrand && <div className="min-w-0 max-w-[42vw] sm:max-w-none"><p className="truncate text-sm font-black text-slate-900 sm:text-lg">{restaurantName}</p><p className="hidden truncate text-[10px] font-bold text-slate-500 sm:block">{copy.menuUpdated}</p></div>}
        </div>
        <nav className="hidden items-center gap-5 text-sm font-black text-slate-700 md:flex"><a href="#home" className="transition hover:text-[var(--menu-primary)]">{copy.home}</a><a href="#menu" className="text-[var(--menu-primary)]">{copy.menu}</a><a href="#reservation" className="transition hover:text-[var(--menu-primary)]">{copy.reservation}</a></nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher compact allowedLanguages={publishedLanguages} />
          <button type="button" onClick={() => setShowHeaderBrand((visible) => !visible)} aria-label={showHeaderBrand ? "إخفاء هوية المطعم" : "إظهار هوية المطعم"} title={showHeaderBrand ? "إخفاء اسم المطعم" : "إظهار اسم المطعم"} className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-orange-50 hover:text-orange-700 sm:flex">{showHeaderBrand ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          {itemCount > 0 && <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-black text-white shadow-md shadow-orange-200" style={{ backgroundColor: brandColor }}><ShoppingBag className="h-4 w-4" /><span>{copy.cart}</span><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] text-slate-800">{itemCount}</span></button>}
          <button type="button" aria-label={copy.restaurantMenu} onClick={() => { setDrawerPanel("menu"); setDrawerOpen(true); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"><MenuIcon className="h-5 w-5" /></button>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          {!user && menuDisplaySettings.showCustomerAccount && <Button type="button" size="sm" variant="outline" onClick={() => setAccountDialogOpen(true)} className="rounded-xl border-[var(--menu-primary)] px-3 text-xs font-black text-[var(--menu-primary)]">تسجيل / دخول</Button>}
          {user && <button type="button" onClick={() => setAccountDialogOpen(true)} className="max-w-[180px] truncate rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm" title="حساب العميل">{user.name || user.email}</button>}
          <button type="button" onClick={() => setMenuQrOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><QrCode className="h-4 w-4 text-[var(--menu-primary)]" />{copy.qrTitle}</button>
          <button type="button" onClick={downloadMenuPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><FileDown className="h-4 w-4 text-[var(--menu-primary)]" />PDF</button>
          <button type="button" onClick={toggleUserTheme} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{isDark ? "الوضع النهاري" : "الوضع الليلي"}</button>
          <button type="button" onClick={() => selectMenuTemplate(menuTemplate === "editorial" ? "bistro" : menuTemplate === "bistro" ? "glass" : "editorial")} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><Pencil className="h-4 w-4 text-[var(--menu-primary)]" />{copy.switchTemplate}: {menuTemplate === "editorial" ? copy.editorial : menuTemplate === "bistro" ? copy.bistro : copy.glass}</button>
          {pwaInstalled ? <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">المنيو مثبتة</span> : installPrompt ? <Button type="button" size="sm" onClick={async () => { await installPrompt.prompt(); const result = await installPrompt.userChoice; if (result.outcome === "accepted") toast.success("بدأ تثبيت المنيو"); setInstallPrompt(null); }} className="rounded-xl bg-slate-900 px-3 text-xs font-black text-white">تثبيت المنيو</Button> : null}
        </div>
      </div>
    </header>`;
source = source.slice(0, headerStart) + header + source.slice(headerEnd + '    </header>'.length);

source = source.replace(
  'className="nfood-menu-item-image relative h-32 shrink-0 overflow-hidden bg-gradient-to-br from-pink-50 to-slate-100 sm:h-36 lg:h-40"',
  'className="nfood-menu-item-image relative aspect-[4/3] shrink-0 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-slate-100 sm:aspect-[4/3] lg:aspect-[3/2]"',
);
source = source.replace(
  'loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"',
  'loading="lazy" decoding="async" className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.02]"',
);
source = source.replace(
  '<p dir="ltr" className="break-all rounded-xl bg-slate-50 px-3 py-2 text-[10px] leading-5 text-slate-500">{qrMenuUrl}</p><DialogFooter',
  '<div className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">{copy.qrHelp}<span className="mt-1 block text-[10px] font-bold text-slate-400">NFOOD · {restaurantName}</span></div><DialogFooter',
);
source = source.replace(
  'className="rounded-xl px-5 text-white" style={{ backgroundColor: brandColor }}>نسخ رابط المنيو</Button>',
  'className="rounded-xl px-5 text-white" style={{ backgroundColor: brandColor }}>{language === "ar" ? "نسخ رابط المنيو" : language === "fr" ? "Copier le lien du menu" : language === "ur" ? "مینو لنک کاپی کریں" : "Copy menu link"}</Button>',
);
fs.writeFileSync(path, source);
