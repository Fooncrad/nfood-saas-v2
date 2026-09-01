import { useMemo, useRef, useState } from "react";
import { Copy, Download, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Props = { restaurantId: number };
type AddonDraft = {
  menuItemId: string;
  name: string;
  groupName: string;
  price: string;
  stockQuantity: string;
  isRequired: boolean;
  minSelections: string;
  maxSelections: string;
  sortOrder: string;
};

const emptyDraft: AddonDraft = {
  menuItemId: "",
  name: "",
  groupName: "الإضافات الاختيارية",
  price: "0",
  stockQuantity: "0",
  isRequired: false,
  minSelections: "0",
  maxSelections: "1",
  sortOrder: "0",
};

export function MenuAddonsPanel({ restaurantId }: Props) {
  const utils = trpc.useUtils();
  const menuItems = trpc.platform.menuItems.useQuery({ restaurantId }, { retry: 1 });
  const addons = trpc.platform.menuItemAddons.useQuery({ restaurantId }, { retry: 1 });
  const [query, setQuery] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<AddonDraft>(emptyDraft);

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };
  const refresh = () => void utils.platform.menuItemAddons.invalidate({ restaurantId });
  const createAddon = trpc.platform.createMenuItemAddon.useMutation({
    onSuccess: () => { refresh(); toast.success("تمت إضافة الخيار"); closeDialog(); },
    onError: (error) => toast.error(error.message),
  });
  const updateAddon = trpc.platform.updateMenuItemAddon.useMutation({
    onSuccess: () => { refresh(); toast.success("تم تحديث الخيار"); closeDialog(); },
    onError: (error) => toast.error(error.message),
  });
  const deleteAddon = trpc.platform.deleteMenuItemAddon.useMutation({
    onSuccess: () => { refresh(); toast.success("تم حذف الخيار"); },
    onError: (error) => toast.error(error.message),
  });

  const items = menuItems.data ?? [];
  const rows = useMemo(() => (addons.data ?? [])
    .filter((addon) => `${addon.name} ${addon.groupName} ${items.find((item) => item.id === addon.menuItemId)?.name ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.groupName.localeCompare(b.groupName, "ar")), [addons.data, items, query]);

  const openCreate = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft, menuItemId: items[0]?.id ? String(items[0].id) : "" });
    setDialogOpen(true);
  };
  const openEdit = (addon: typeof rows[number]) => {
    setEditingId(addon.id);
    setDraft({
      menuItemId: String(addon.menuItemId),
      name: addon.name,
      groupName: addon.groupName,
      price: String(addon.price),
      stockQuantity: String(addon.stockQuantity),
      isRequired: addon.isRequired,
      minSelections: String(addon.minSelections),
      maxSelections: String(addon.maxSelections),
      sortOrder: String(addon.sortOrder),
    });
    setDialogOpen(true);
  };

  const save = () => {
    const minSelections = Number(draft.minSelections);
    const maxSelections = Number(draft.maxSelections);
    if (!draft.menuItemId || draft.name.trim().length < 2 || draft.groupName.trim().length < 2 || Number(draft.price) < 0 || Number(draft.stockQuantity) < 0) {
      toast.error("أكمل الصنف واسم المجموعة واسم الإضافة والسعر والمخزون");
      return;
    }
    if (minSelections < 0 || maxSelections < 1 || minSelections > maxSelections) {
      toast.error("تحقق من الحد الأدنى والأقصى للاختيارات");
      return;
    }
    const payload = {
      restaurantId,
      menuItemId: Number(draft.menuItemId),
      name: draft.name.trim(),
      groupName: draft.groupName.trim(),
      price: Number(draft.price).toFixed(2),
      stockQuantity: Number(draft.stockQuantity),
      isRequired: draft.isRequired,
      minSelections: draft.isRequired ? Math.max(1, minSelections) : minSelections,
      maxSelections,
      sortOrder: Math.max(0, Number(draft.sortOrder) || 0),
    };
    if (editingId) updateAddon.mutate({ ...payload, id: editingId });
    else createAddon.mutate(payload);
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(1);
    let imported = 0;
    for (const line of lines) {
      const [name, menuItemName, groupName, price, stockQuantity, isRequired, minSelections, maxSelections, sortOrder] = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
      const item = items.find((candidate) => candidate.name.trim() === menuItemName);
      if (!item || !name || Number(price) < 0 || Number(stockQuantity) < 0) continue;
      await createAddon.mutateAsync({
        restaurantId,
        menuItemId: item.id,
        name,
        groupName: groupName || "الإضافات الاختيارية",
        price: Number(price).toFixed(2),
        stockQuantity: Number(stockQuantity),
        isRequired: isRequired === "true",
        minSelections: Math.max(0, Number(minSelections) || 0),
        maxSelections: Math.max(1, Number(maxSelections) || 1),
        sortOrder: Math.max(0, Number(sortOrder) || 0),
      });
      imported += 1;
    }
    await addons.refetch();
    toast.success(imported ? `تم استيراد ${imported} إضافة` : "لم يتم العثور على صفوف صالحة");
  };
  const exportCsv = () => {
    const csv = [
      "name,menuItem,groupName,price,stockQuantity,isRequired,minSelections,maxSelections,sortOrder,isAvailable",
      ...rows.map((row) => [row.name, items.find((item) => item.id === row.menuItemId)?.name ?? "", row.groupName, row.price, row.stockQuantity, row.isRequired, row.minSelections, row.maxSelections, row.sortOrder, row.isAvailable]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "nfood-menu-addons.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="nfood-enter space-y-5" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold text-[#e76f3c]">المنيو والمنتجات</p><h2 className="mt-1 text-2xl font-black tracking-tight">إضافات الأصناف</h2><p className="mt-1 text-sm text-slate-500">نظّم الإضافات في مجموعات، وحدد إن كانت إلزامية وعدد الاختيارات المسموح.</p></div>
      <Button onClick={openCreate} className="gap-2 rounded-2xl bg-[#e76f3c] px-5 py-5 shadow-lg shadow-orange-200 hover:bg-[#d85f2e]"><Plus className="h-4 w-4" /> إضافة جديدة</Button>
    </div>
    <Card className="nfood-glass rounded-3xl"><CardContent className="flex flex-wrap items-center gap-3 p-4">
      <div className="relative min-w-[240px] flex-1"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالمجموعة أو الإضافة أو الصنف..." className="h-11 rounded-2xl border-white/70 bg-white/75 pr-10" /></div>
      <Button variant="outline" onClick={exportCsv} className="gap-2 rounded-2xl bg-white/70"><Download className="h-4 w-4" /> تصدير</Button>
      <input ref={importRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCsv(file); event.currentTarget.value = ""; }} />
      <Button variant="outline" onClick={() => importRef.current?.click()} className="gap-2 rounded-2xl bg-white/70"><Upload className="h-4 w-4" /> استيراد CSV</Button>
      <Button variant="outline" onClick={() => void addons.refetch()} className="rounded-2xl bg-white/70" aria-label="تحديث"><RotateCcw className="h-4 w-4" /></Button>
    </CardContent></Card>
    <Card className="overflow-hidden rounded-3xl border-white/70 bg-white/85"><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-right text-sm">
      <thead className="bg-slate-950 text-white"><tr><th className="px-4 py-4 text-xs">#</th><th className="px-4 py-4 text-xs">المجموعة</th><th className="px-4 py-4 text-xs">الإضافة</th><th className="px-4 py-4 text-xs">الصنف</th><th className="px-4 py-4 text-xs">السعر</th><th className="px-4 py-4 text-xs">الاختيار</th><th className="px-4 py-4 text-xs">الحالة</th><th className="px-4 py-4 text-xs">إجراء</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{addons.isLoading ? <tr><td colSpan={8} className="p-12 text-center text-slate-400">جارٍ تحميل الإضافات...</td></tr> : addons.isError ? <tr><td colSpan={8} className="p-12 text-center text-red-600">تعذر تحميل الإضافات. <button className="font-bold underline" onClick={() => void addons.refetch()}>إعادة المحاولة</button></td></tr> : rows.length === 0 ? <tr><td colSpan={8} className="p-12 text-center text-slate-400">لا توجد إضافات محفوظة لهذا المطعم بعد.</td></tr> : rows.map((addon, index) => <tr key={addon.id} className="transition hover:bg-orange-50/50">
        <td className="px-4 py-4 font-bold text-[#c65325]">{index + 1}</td><td className="px-4 py-4"><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">{addon.groupName}</span></td><td className="px-4 py-4 font-bold">{addon.name}</td><td className="px-4 py-4 text-slate-500">{items.find((item) => item.id === addon.menuItemId)?.name ?? "صنف غير معروف"}</td><td className="px-4 py-4 font-black">{Number(addon.price).toLocaleString("ar-SA-u-ca-gregory-nu-latn")} SAR</td><td className="px-4 py-4 text-xs"><span className={addon.isRequired ? "font-bold text-rose-600" : "text-slate-500"}>{addon.isRequired ? "إلزامي" : "اختياري"}</span><span className="mr-2 text-slate-400">{addon.minSelections}–{addon.maxSelections}</span></td><td className="px-4 py-4"><button onClick={() => updateAddon.mutate({ restaurantId, id: addon.id, isAvailable: !addon.isAvailable })} className={`rounded-full px-3 py-1 text-xs font-bold ${addon.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>{addon.isAvailable ? "متاح" : "متوقف"}</button></td><td className="px-4 py-4"><div className="flex gap-1"><button onClick={() => openEdit(addon)} className="rounded-xl p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-600" aria-label="تعديل"><Pencil className="h-4 w-4" /></button><button onClick={() => { if (window.confirm("هل تريد حذف هذه الإضافة؟")) deleteAddon.mutate({ restaurantId, id: addon.id }); }} className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="حذف"><Trash2 className="h-4 w-4" /></button><button onClick={() => { setDraft({ menuItemId: String(addon.menuItemId), name: `${addon.name} - نسخة`, groupName: addon.groupName, price: String(addon.price), stockQuantity: String(addon.stockQuantity), isRequired: addon.isRequired, minSelections: String(addon.minSelections), maxSelections: String(addon.maxSelections), sortOrder: String(addon.sortOrder) }); setEditingId(null); setDialogOpen(true); }} className="rounded-xl p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600" aria-label="نسخ"><Copy className="h-4 w-4" /></button></div></td>
      </tr>)}</tbody>
    </table></div></CardContent></Card>
    <Dialog open={dialogOpen} onOpenChange={(next) => { if (!next) closeDialog(); }}><DialogContent dir="rtl" className="max-h-[88dvh] overflow-y-auto rounded-3xl sm:max-w-xl"><DialogHeader className="text-right"><DialogTitle>{editingId ? "تعديل إضافة" : "إضافة خيار جديد"}</DialogTitle><DialogDescription>اربط الخيار بصنف وحدد المجموعة وقواعد الاختيار والسعر.</DialogDescription></DialogHeader><div className="grid gap-4 py-3">
      <label className="text-xs font-bold">الصنف<select value={draft.menuItemId} onChange={(event) => setDraft((current) => ({ ...current, menuItemId: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3">{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">اسم المجموعة<Input value={draft.groupName} onChange={(event) => setDraft((current) => ({ ...current, groupName: event.target.value }))} placeholder="مثال: الصوصات" className="mt-2 h-11 rounded-xl bg-slate-50" /></label><label className="text-xs font-bold">اسم الإضافة<Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="مثال: جبنة إضافية" className="mt-2 h-11 rounded-xl bg-slate-50" /></label></div>
      <div className="grid gap-4 sm:grid-cols-3"><label className="text-xs font-bold">السعر<Input value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} inputMode="decimal" className="mt-2 h-11 rounded-xl bg-slate-50" /></label><label className="text-xs font-bold">المخزون<Input value={draft.stockQuantity} onChange={(event) => setDraft((current) => ({ ...current, stockQuantity: event.target.value }))} inputMode="numeric" className="mt-2 h-11 rounded-xl bg-slate-50" /></label><label className="text-xs font-bold">الترتيب<Input value={draft.sortOrder} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))} inputMode="numeric" className="mt-2 h-11 rounded-xl bg-slate-50" /></label></div>
      <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-bold">الحد الأدنى<Input value={draft.minSelections} onChange={(event) => setDraft((current) => ({ ...current, minSelections: event.target.value }))} inputMode="numeric" className="mt-2 h-11 bg-white" /></label><label className="text-xs font-bold">الحد الأقصى<Input value={draft.maxSelections} onChange={(event) => setDraft((current) => ({ ...current, maxSelections: event.target.value }))} inputMode="numeric" className="mt-2 h-11 bg-white" /></label><label className="flex items-center gap-2 self-end pb-3 text-xs font-bold"><input type="checkbox" checked={draft.isRequired} onChange={(event) => setDraft((current) => ({ ...current, isRequired: event.target.checked, minSelections: event.target.checked && Number(current.minSelections) < 1 ? "1" : current.minSelections }))} className="h-4 w-4 accent-orange-500" /> مجموعة إلزامية</label></div>
    </div><DialogFooter><Button variant="outline" onClick={closeDialog} className="rounded-xl">إلغاء</Button><Button onClick={save} disabled={createAddon.isPending || updateAddon.isPending || !items.length} className="rounded-xl bg-[#e76f3c] hover:bg-[#d85f2e]">{createAddon.isPending || updateAddon.isPending ? "جارٍ الحفظ..." : "حفظ الإضافة"}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
