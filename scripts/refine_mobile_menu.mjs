import fs from "node:fs";
const path = "client/src/pages/RestaurantPublic.tsx";
let source = fs.readFileSync(path, "utf8");

source = source.replace(
  '  const [showHeaderBrand, setShowHeaderBrand] = useState(true);',
  '  const [showHeaderBrand, setShowHeaderBrand] = useState(true);\n  const [secondaryToolsOpen, setSecondaryToolsOpen] = useState(false);',
);
source = source.replace(
  '  const restaurantName = page.data.restaurant.brandName ?? page.data.restaurant.name;',
  '  const restaurantName = page.data.restaurant.brandName?.trim() || ((slug === "nssercafa" || page.data.restaurant.name?.trim() === "nssercafa") ? "Nasser Cafe" : page.data.restaurant.name?.trim() || "NFOOD Restaurant");',
);
source = source.replace(
  'className={`nfood-menu-theme nfood-menu-template-${menuTemplate} nfood-menu-shell flex flex-col pb-20 sm:pb-0',
  'className={`nfood-menu-theme nfood-menu-template-${menuTemplate} nfood-menu-shell flex flex-col pb-32 sm:pb-0',
);

const toolsStart = source.indexOf('<div className="col-span-full flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">');
if (toolsStart < 0) throw new Error("hero tools start not found");
const toolsEnd = source.indexOf('</div></section>', toolsStart);
if (toolsEnd < 0) throw new Error("hero tools end not found");
source = source.slice(0, toolsStart) + '      <div className="col-span-full rounded-xl bg-slate-50/70 px-3 py-2 text-center text-[11px] font-bold text-slate-500 sm:hidden">الأدوات الإضافية متاحة من زر «أدوات المنيو» أعلى الصفحة</div>' + source.slice(toolsEnd);

const secondaryStart = source.indexOf('      <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 sm:px-6">');
const secondaryEnd = source.indexOf('    </header>', secondaryStart);
if (secondaryStart < 0 || secondaryEnd < 0) throw new Error("secondary tools row not found");
const secondary = `      <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <button type="button" onClick={() => setSecondaryToolsOpen((open) => !open)} aria-expanded={secondaryToolsOpen} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700 sm:hidden"><span>أدوات المنيو</span><ChevronDown className={\`h-4 w-4 transition-transform duration-200 \${secondaryToolsOpen ? "rotate-180" : ""}\`} /></button>
          <div className={\`\${secondaryToolsOpen ? "flex" : "hidden"} flex-wrap items-center gap-2 pt-2 sm:flex sm:pt-0\`}>
            {!user && menuDisplaySettings.showCustomerAccount && <Button type="button" size="sm" variant="outline" onClick={() => setAccountDialogOpen(true)} className="rounded-xl border-[var(--menu-primary)] px-3 text-xs font-black text-[var(--menu-primary)]">تسجيل / دخول</Button>}
            {user && <button type="button" onClick={() => setAccountDialogOpen(true)} className="max-w-[180px] truncate rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm" title="حساب العميل">{user.name || user.email}</button>}
            <button type="button" onClick={() => setMenuQrOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><QrCode className="h-4 w-4 text-[var(--menu-primary)]" />{copy.qrTitle}</button>
            <button type="button" onClick={downloadMenuPdf} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><FileDown className="h-4 w-4 text-[var(--menu-primary)]" />PDF</button>
            <button type="button" onClick={toggleUserTheme} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{isDark ? "الوضع النهاري" : "الوضع الليلي"}</button>
            <button type="button" onClick={() => selectMenuTemplate(menuTemplate === "editorial" ? "bistro" : menuTemplate === "bistro" ? "glass" : "editorial")} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-orange-50 hover:text-orange-700"><Pencil className="h-4 w-4 text-[var(--menu-primary)]" />{copy.switchTemplate}: {menuTemplate === "editorial" ? copy.editorial : menuTemplate === "bistro" ? copy.bistro : copy.glass}</button>
            {pwaInstalled ? <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">المنيو مثبتة</span> : installPrompt ? <Button type="button" size="sm" onClick={async () => { await installPrompt.prompt(); const result = await installPrompt.userChoice; if (result.outcome === "accepted") toast.success("بدأ تثبيت المنيو"); setInstallPrompt(null); }} className="rounded-xl bg-slate-900 px-3 text-xs font-black text-white">تثبيت المنيو</Button> : null}
          </div>
        </div>
      </div>
`;
source = source.slice(0, secondaryStart) + secondary + source.slice(secondaryEnd);
fs.writeFileSync(path, source);
