import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  ConciergeBell,
  Facebook,
  Globe2,
  Heart,
  Hotel,
  Instagram,
  MapPin,
  Menu,
  Minus,
  Moon,
  Navigation,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Store,
  Sun,
  Truck,
  UserRound,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrderMode = "dineIn" | "takeaway" | "delivery" | "reservation" | "hotel";
type CartLine = {
  key: string;
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  addonIds: number[];
  addonTotal: number;
};
type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
function minuteValue(value?: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function branchOpenNow(branch: any, timezone = "Asia/Riyadh") {
  if (!branch) return false;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(new Date());
  const now = Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const start = minuteValue(branch.openingTime);
  const end = minuteValue(branch.closingTime);
  if (start === null || end === null) return true;
  return start <= end ? now >= start && now < end : now >= start || now < end;
}
function localize(raw: string | null | undefined, fallback: string, lang: string, field: "name" | "description" = "name") {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Record<string, any>;
    const direct = parsed?.[lang];
    if (typeof direct === "string" && direct.trim()) return direct;
    if (direct && typeof direct[field] === "string" && direct[field].trim()) return direct[field];
    if (typeof parsed?.[field]?.[lang] === "string" && parsed[field][lang].trim()) return parsed[field][lang];
  } catch {}
  return fallback;
}
function formatMoney(value: number | string, currency: string) {
  const number = Number(value || 0);
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(number)} ${currency}`;
}

export default function RestaurantMenu() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [location, navigate] = useLocation();
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const lang = language === "ar" ? "ar" : language === "fr" ? "fr" : "en";
  const page = trpc.platform.publicRestaurantPage.useQuery({ slug, lang: language }, { enabled: Boolean(slug), retry: false });

  const data = page.data;
  const restaurant = data?.restaurant;
  const branches = data?.branches ?? [];
  const categories = data?.categories ?? [];
  const items = data?.items ?? [];
  const addons = data?.addons ?? [];
  const seatingSections = data?.seatingSections ?? [];

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationStep, setReservationStep] = useState<1 | 2>(1);
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode>("takeaway");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [tableName, setTableName] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLatitude, setDeliveryLatitude] = useState<number | undefined>();
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | undefined>();
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelRoomId, setHotelRoomId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationSlotId, setReservationSlotId] = useState<number | undefined>();
  const [seatingSectionId, setSeatingSectionId] = useState<number | undefined>();
  const [reservationName, setReservationName] = useState("");
  const [reservationEmail, setReservationEmail] = useState("");
  const [reservationPhone, setReservationPhone] = useState("");
  const [reservationPartySize, setReservationPartySize] = useState(2);
  const [reservationChildrenCount, setReservationChildrenCount] = useState(0);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [waiterTable, setWaiterTable] = useState("");
  const [waiterReason, setWaiterReason] = useState<"الحساب" | "الطلب" | "المساعدة" | "الفاتورة" | "أخرى">("المساعدة");
  const [waiterName, setWaiterName] = useState("");
  const [installPrompt, setInstallPrompt] = useState<DeferredInstallPrompt | null>(null);

  useEffect(() => {
    if (!restaurant) return;
    const configured = restaurant.themeMode;
    if (configured === "light" || configured === "dark") setTheme(configured);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, [restaurant?.themeMode]);

  useEffect(() => {
    if (!selectedBranchId && branches[0]?.id) setSelectedBranchId(branches[0].id);
  }, [branches, selectedBranchId]);

  useEffect(() => {
    setVisibleCount(40);
  }, [activeCategory, query]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const copy = lang === "ar" ? {
    menu:"القائمة", search:"ابحث في القائمة", all:"الكل", cart:"السلة", reservation:"حجز طاولة",
    waiter:"نداء النادل", account:"حسابي", login:"تسجيل الدخول", guest:"تصفح كزائر", contact:"التواصل",
    hours:"الأوقات", install:"تثبيت التطبيق", open:"مفتوح الآن", closed:"مغلق الآن", more:"عرض المزيد",
    empty:"لا توجد أصناف مطابقة.", local:"طلب محلي", takeaway:"سفري", delivery:"توصيل", withReservation:"طلب مع حجز",
    room:"خدمة غرف", add:"إضافة للسلة", extras:"الإضافات", calories:"سعرة", prep:"دقيقة", total:"الإجمالي",
    checkout:"إتمام الطلب", name:"الاسم", phone:"الجوال", notes:"ملاحظات الطلب", table:"رقم الطاولة",
    address:"عنوان التوصيل", location:"تحديد موقعي", payment:"طريقة الدفع", cash:"نقدي", transfer:"تحويل بنكي",
    hotel:"الفندق", roomNumber:"الغرفة", branch:"الفرع", next:"التالي", back:"رجوع", confirm:"تأكيد الحجز",
    date:"التاريخ والوقت", section:"قسم الجلسة", party:"عدد الضيوف", children:"الأطفال", email:"البريد الإلكتروني",
    policy:"أوافق على سياسة المطعم", send:"إرسال", status:"حالة المطعم", social:"حسابات التواصل",
    startOrder:"ابدأ الطلب", storeInfo:"معلومات المطعم", items:"صنف", active:"نشط", unavailable:"غير متاح حاليًا",
    installNow:"تثبيت الآن", call:"اتصال", whatsapp:"واتساب", noBranch:"لا يوجد فرع متاح حاليًا",
  } : lang === "fr" ? {
    menu:"Menu", search:"Rechercher dans le menu", all:"Tout", cart:"Panier", reservation:"Réserver",
    waiter:"Appeler le serveur", account:"Mon compte", login:"Connexion", guest:"Continuer en invité", contact:"Contact",
    hours:"Horaires", install:"Installer l’app", open:"Ouvert", closed:"Fermé", more:"Voir plus",
    empty:"Aucun article correspondant.", local:"Sur place", takeaway:"À emporter", delivery:"Livraison", withReservation:"Commande + réservation",
    room:"Service en chambre", add:"Ajouter", extras:"Suppléments", calories:"kcal", prep:"min", total:"Total",
    checkout:"Commander", name:"Nom", phone:"Téléphone", notes:"Notes", table:"Table",
    address:"Adresse", location:"Ma position", payment:"Paiement", cash:"Espèces", transfer:"Virement",
    hotel:"Hôtel", roomNumber:"Chambre", branch:"Site", next:"Suivant", back:"Retour", confirm:"Confirmer",
    date:"Date et heure", section:"Zone", party:"Personnes", children:"Enfants", email:"E-mail",
    policy:"J’accepte la politique du restaurant", send:"Envoyer", status:"Statut", social:"Réseaux",
    startOrder:"Commander", storeInfo:"Restaurant", items:"articles", active:"Actif", unavailable:"Indisponible",
    installNow:"Installer", call:"Appeler", whatsapp:"WhatsApp", noBranch:"Aucun site disponible",
  } : {
    menu:"Menu", search:"Search the menu", all:"All", cart:"Cart", reservation:"Reserve a table",
    waiter:"Call waiter", account:"My account", login:"Sign in", guest:"Browse as guest", contact:"Contact",
    hours:"Hours", install:"Install app", open:"Open now", closed:"Closed now", more:"Show more",
    empty:"No matching items.", local:"Dine in", takeaway:"Takeaway", delivery:"Delivery", withReservation:"Order + reservation",
    room:"Room service", add:"Add to cart", extras:"Extras", calories:"kcal", prep:"min", total:"Total",
    checkout:"Checkout", name:"Name", phone:"Phone", notes:"Order notes", table:"Table",
    address:"Delivery address", location:"Use my location", payment:"Payment", cash:"Cash", transfer:"Bank transfer",
    hotel:"Hotel", roomNumber:"Room", branch:"Branch", next:"Next", back:"Back", confirm:"Confirm reservation",
    date:"Date and time", section:"Seating section", party:"Guests", children:"Children", email:"Email",
    policy:"I accept the restaurant policy", send:"Send", status:"Status", social:"Social",
    startOrder:"Start order", storeInfo:"Restaurant info", items:"items", active:"Active", unavailable:"Unavailable",
    installNow:"Install now", call:"Call", whatsapp:"WhatsApp", noBranch:"No branch is currently available",
  };

  const primary = restaurant?.brandColor || "#f97316";
  const accent = restaurant?.brandAccentColor || "#2563eb";
  const dark = theme === "dark";
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? branches[0];
  const isOpen = Boolean(selectedBranch && branchOpenNow(selectedBranch, restaurant?.timezone || "Asia/Riyadh"));
  const currency = restaurant?.currencyCode || "SAR";

  const enabledModes = useMemo<OrderMode[]>(() => {
    const allowed: OrderMode[] = ["dineIn","takeaway","delivery","reservation","hotel"];
    const parsed = parseJson<any[]>(restaurant?.orderModesJson, []);
    const configured = Array.isArray(parsed) ? parsed.filter((value): value is OrderMode => allowed.includes(value as OrderMode)) : [];
    const modes = configured.length ? configured : allowed;
    return modes.filter((mode) => mode !== "reservation" || restaurant?.reservationEnabled !== false);
  }, [restaurant?.orderModesJson, restaurant?.reservationEnabled]);

  useEffect(() => {
    if (!enabledModes.includes(orderMode)) setOrderMode(enabledModes[0] ?? "takeaway");
  }, [enabledModes, orderMode]);

  const manualPayments = useMemo(() => {
    const parsed = parseJson<string[]>(restaurant?.manualPaymentMethodsJson, ["cash","bank_transfer"]);
    return parsed.filter((value): value is "cash" | "bank_transfer" => value === "cash" || value === "bank_transfer");
  }, [restaurant?.manualPaymentMethodsJson]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
      if (!term) return true;
      const name = localize(item.translationsJson, item.name, lang, "name").toLowerCase();
      const desc = localize(item.translationsJson, item.description || "", lang, "description").toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [items, activeCategory, query, lang]);

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const itemAddons = selectedItem ? addons.filter((addon) => addon.menuItemId === selectedItem.id) : [];
  const selectedAddonTotal = itemAddons.filter((addon) => selectedAddonIds.includes(addon.id)).reduce((sum, addon) => sum + Number(addon.price || 0), 0);

  const subtotal = cart.reduce((sum, line) => sum + (line.price + line.addonTotal) * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const hotelOptions = trpc.platform.hotelOptions.useQuery(
    { slug, branchId: selectedBranchId ?? 0 },
    { enabled: orderMode === "hotel" && Boolean(selectedBranchId), retry:false }
  );
  const selectedHotel = (hotelOptions.data ?? []).find((hotel:any) => hotel.id === hotelId);
  const pickupOptions = trpc.platform.pickupPoints.useQuery(
    { slug, branchId: selectedBranchId ?? 0 },
    { enabled: orderMode === "takeaway" && Boolean(selectedBranchId), retry:false }
  );
  const reservationSlots = trpc.platform.reservationSlots.useQuery(
    { slug, branchId: selectedBranchId ?? 0 },
    { enabled: reservationOpen && Boolean(selectedBranchId), retry:false }
  );
  const deliveryQuote = trpc.platform.deliveryQuote.useQuery(
    { slug, branchId: selectedBranchId ?? 0, latitude: deliveryLatitude ?? 0, longitude: deliveryLongitude ?? 0, subtotal },
    { enabled: orderMode === "delivery" && Boolean(selectedBranchId && deliveryLatitude !== undefined && deliveryLongitude !== undefined), retry:false }
  );
  const deliveryFee = orderMode === "delivery" && deliveryQuote.data?.available ? Number(deliveryQuote.data.fee || 0) : 0;

  const checkout = trpc.platform.guestCheckout.useMutation({
    onSuccess: (result) => {
      setCart([]);
      setCartOpen(false);
      toast.success(lang === "ar" ? "تم تأكيد الطلب" : lang === "fr" ? "Commande confirmée" : "Order confirmed");
      window.setTimeout(() => navigate(`/customer-orders?order=${result.orderId}`), 180);
    },
    onError: (error) => toast.error(error.message),
  });
  const reservation = trpc.platform.createPublicReservation.useMutation({
    onSuccess: () => {
      setReservationOpen(false);
      setReservationStep(1);
      toast.success(lang === "ar" ? "تم إرسال طلب الحجز" : lang === "fr" ? "Réservation envoyée" : "Reservation sent");
    },
    onError: (error) => toast.error(error.message),
  });
  const notifyWaiter = trpc.platform.notifyWaiterCall.useMutation({
    onSuccess: () => {
      setWaiterOpen(false);
      toast.success(lang === "ar" ? "تم إرسال نداء النادل" : lang === "fr" ? "Serveur appelé" : "Waiter request sent");
    },
    onError: (error) => toast.error(error.message),
  });

  const openProduct = (id:number) => {
    setSelectedItemId(id);
    setSelectedAddonIds([]);
  };
  const addSelectedProduct = () => {
    if (!selectedItem) return;
    const addonKey = [...selectedAddonIds].sort((a,b)=>a-b).join("-");
    const key = `${selectedItem.id}:${addonKey}`;
    const name = localize(selectedItem.translationsJson, selectedItem.name, lang, "name");
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) return current.map((line) => line.key === key ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { key, itemId:selectedItem.id, name, price:Number(selectedItem.price || 0), quantity:1, addonIds:[...selectedAddonIds], addonTotal:selectedAddonTotal }];
    });
    setSelectedItemId(null);
    setSelectedAddonIds([]);
    toast.success(lang === "ar" ? "تمت الإضافة للسلة" : lang === "fr" ? "Ajouté au panier" : "Added to cart");
  };
  const updateQty = (key:string, delta:number) => {
    setCart((current) => current.map((line) => line.key === key ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  };

  const askLocation = () => {
    if (!navigator.geolocation) return toast.error(lang === "ar" ? "تحديد الموقع غير مدعوم" : "Location is unavailable");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLatitude(position.coords.latitude);
        setDeliveryLongitude(position.coords.longitude);
        toast.success(lang === "ar" ? "تم تحديد موقعك" : "Location captured");
      },
      () => toast.error(lang === "ar" ? "تعذر تحديد الموقع" : "Could not get location")
    );
  };

  const submitOrder = () => {
    if (!user) {
      toast.info(lang === "ar" ? "سجّل الدخول لإتمام الطلب" : "Sign in to complete your order");
      navigate(`/login?next=${encodeURIComponent(location)}`);
      return;
    }
    if (!selectedBranchId || !cart.length || guestName.trim().length < 2 || guestPhone.trim().length < 7) {
      toast.error(lang === "ar" ? "أكمل بيانات الطلب الأساسية" : "Complete the required order details");
      return;
    }
    if (orderMode === "dineIn" && !tableName.trim()) return toast.error(copy.table);
    if (orderMode === "delivery" && (!deliveryAddress.trim() || deliveryLatitude === undefined || deliveryLongitude === undefined)) return toast.error(copy.address);
    const selectedRoom = selectedHotel?.rooms?.find((room:any) => room.id === hotelRoomId);
    if (orderMode === "hotel" && (!hotelId || !hotelRoomId)) return toast.error(copy.roomNumber);
    checkout.mutate({
      slug,
      branchId:selectedBranchId,
      guestName:guestName.trim(),
      guestPhone:guestPhone.trim(),
      paymentMethod,
      channel:orderMode === "dineIn" ? "dine_in" : orderMode,
      tableName:orderMode === "dineIn" ? tableName.trim() : undefined,
      pickupPoint:orderMode === "takeaway" ? pickupPoint.trim() || undefined : undefined,
      deliveryAddress:orderMode === "delivery" ? deliveryAddress.trim() : undefined,
      deliveryLatitude:orderMode === "delivery" ? deliveryLatitude : undefined,
      deliveryLongitude:orderMode === "delivery" ? deliveryLongitude : undefined,
      deliveryFee,
      hotelId:orderMode === "hotel" ? hotelId ?? undefined : undefined,
      hotelRoomId:orderMode === "hotel" ? hotelRoomId ?? undefined : undefined,
      hotelName:orderMode === "hotel" ? selectedHotel?.name : undefined,
      hotelRoom:orderMode === "hotel" ? selectedRoom?.roomNumber : undefined,
      hotelFloor:orderMode === "hotel" ? selectedRoom?.floor ?? undefined : undefined,
      notes:orderNotes.trim() || undefined,
      items:cart.map((line) => ({ menuItemId:line.itemId, quantity:line.quantity, addons:line.addonIds.map((addonId) => ({ addonId })) })),
    });
  };

  const submitReservation = () => {
    if (reservationStep === 1) {
      if (!selectedBranchId || !reservationDate || !seatingSectionId) return toast.error(lang === "ar" ? "اختر التاريخ وقسم الجلسة" : "Choose date and seating");
      setReservationStep(2);
      return;
    }
    if (!selectedBranchId || reservationName.trim().length < 2 || reservationPhone.trim().length < 7 || !reservationEmail.trim() || !policyAccepted) return toast.error(lang === "ar" ? "أكمل بيانات الحجز" : "Complete reservation details");
    reservation.mutate({
      slug,
      branchId:selectedBranchId,
      slotId:reservationSlotId,
      seatingSectionId,
      childrenCount:reservationChildrenCount,
      policyAccepted:true,
      customerName:reservationName.trim(),
      email:reservationEmail.trim(),
      phone:reservationPhone.trim(),
      partySize:reservationPartySize,
      reservedFor:new Date(reservationDate),
      durationMinutes:60,
    });
  };

  const installApp = async () => {
    if (!installPrompt) {
      toast.info(lang === "ar" ? "من قائمة المتصفح اختر إضافة إلى الشاشة الرئيسية" : "Use your browser menu to add this app to your home screen");
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (page.isLoading) return <div className="grid min-h-screen place-items-center bg-[#071525] text-lg font-black text-white">NFOOD</div>;
  if (!restaurant) return <div className="grid min-h-screen place-items-center bg-[#071525] px-6 text-center text-white"><div><Store className="mx-auto h-12 w-12 text-orange-400" /><h1 className="mt-4 text-2xl font-black">{copy.unavailable}</h1></div></div>;

  const surface = dark ? "border-white/10 bg-[#0d2037] text-white" : "border-slate-200 bg-white text-[#0b1d35]";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const pageBg = dark ? "bg-[#071525] text-white" : "bg-[#f6f8fc] text-[#0b1d35]";
  const selectedHotelRooms = selectedHotel?.rooms ?? [];

  return <main dir={direction} className={`min-h-screen overflow-x-hidden ${pageBg}`} style={{ fontFamily:restaurant.brandFontFamily || undefined, "--restaurant-primary":primary, "--restaurant-accent":accent } as React.CSSProperties}>
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${dark ? "border-white/10 bg-[#071525]/92" : "border-slate-200 bg-white/92"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setDrawerOpen(true)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          {restaurant.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 font-black text-white">{restaurant.name.slice(0,1)}</span>}
          <div className="min-w-0"><h1 className="truncate text-sm font-black sm:text-base">{restaurant.brandName || restaurant.name}</h1><p className={`flex items-center gap-1 text-[10px] font-bold ${isOpen ? "text-emerald-500" : "text-red-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />{isOpen ? copy.open : copy.closed}</p></div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact />
          <button onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")} className={`grid h-10 w-10 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`} aria-label="Theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={() => user ? navigate("/customer-portal") : navigate(`/login?next=${encodeURIComponent(location)}`)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1d35] text-white" aria-label={copy.account}><UserRound className="h-4 w-4" /></button>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden bg-[#071525] text-white">
      {restaurant.coverUrl && <img src={restaurant.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071525] via-[#071525]/75 to-[#071525]/30" />
      <div className="relative mx-auto flex min-h-[300px] max-w-7xl items-end px-4 pb-8 pt-24 sm:px-6 sm:pb-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${isOpen ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{isOpen ? copy.open : copy.closed}</span>
            {restaurant.city && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold"><MapPin className="h-3.5 w-3.5" />{restaurant.city}</span>}
          </div>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">{restaurant.brandName || restaurant.name}</h2>
          {restaurant.brandDescription && <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{restaurant.brandDescription}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => document.getElementById("menu-grid")?.scrollIntoView({ behavior:"smooth" })} className="rounded-xl px-4 py-3 text-sm font-black text-white" style={{ background:primary }}>{copy.startOrder}</button>
            {restaurant.reservationEnabled && <button onClick={() => setReservationOpen(true)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black">{copy.reservation}</button>}
            {restaurant.waiterCallEnabled && <button onClick={() => setWaiterOpen(true)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black">{copy.waiter}</button>}
          </div>
        </div>
      </div>
    </section>

    <section className={`sticky top-16 z-30 border-b py-3 backdrop-blur-xl ${dark ? "border-white/10 bg-[#071525]/94" : "border-slate-200 bg-[#f6f8fc]/94"}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {enabledModes.map((mode) => {
            const label = mode === "dineIn" ? copy.local : mode === "takeaway" ? copy.takeaway : mode === "delivery" ? copy.delivery : mode === "reservation" ? copy.withReservation : copy.room;
            const Icon = mode === "dineIn" ? Utensils : mode === "takeaway" ? ShoppingBag : mode === "delivery" ? Truck : mode === "reservation" ? CalendarDays : Hotel;
            return <button key={mode} onClick={() => { setOrderMode(mode); if (mode === "reservation") setReservationOpen(true); }} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black transition ${orderMode === mode ? "border-transparent text-white shadow-lg" : dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`} style={orderMode === mode ? { background:primary } : undefined}><Icon className="h-4 w-4" />{label}</button>;
          })}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-5 sm:py-8">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className={`flex items-center rounded-2xl border px-3 ${surface}`}><Search className={`h-5 w-5 shrink-0 ${muted}`} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0" /></div>
        {branches.length > 1 && <select value={selectedBranchId ?? ""} onChange={(event) => setSelectedBranchId(Number(event.target.value))} className={`h-12 rounded-2xl border px-4 text-sm font-black outline-none ${surface}`}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>}
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveCategory("all")} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${activeCategory === "all" ? "text-white" : surface}`} style={activeCategory === "all" ? { background:accent } : undefined}>{copy.all}</button>
        {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black ${activeCategory === category.id ? "border-transparent text-white" : surface}`} style={activeCategory === category.id ? { background:accent } : undefined}>{localize(category.translationsJson, category.name, lang, "name")}</button>)}
      </div>
    </section>

    <section id="menu-grid" className="mx-auto max-w-7xl px-3 pb-28 sm:px-5">
      {filteredItems.length ? <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.slice(0, visibleCount).map((item) => {
            const name = localize(item.translationsJson, item.name, lang, "name");
            const description = localize(item.translationsJson, item.description || "", lang, "description");
            const discounted = item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price);
            return <button key={item.id} onClick={() => openProduct(item.id)} className={`group min-w-0 overflow-hidden rounded-[22px] border text-start shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${surface}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200/10">{item.imageUrl ? <img src={item.imageUrl} alt={name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Utensils className="h-9 w-9 opacity-20" /></div>}{item.calories ? <span className="absolute end-2 top-2 rounded-full bg-[#071525]/80 px-2 py-1 text-[9px] font-black text-white">{item.calories} {copy.calories}</span> : null}</div>
              <div className="min-w-0 p-3 sm:p-4"><h3 className="line-clamp-2 min-h-10 text-[13px] font-black leading-5 sm:text-sm">{name}</h3>{description && <p className={`mt-1 line-clamp-2 min-h-9 text-[11px] leading-5 ${muted}`}>{description}</p>}<div className="mt-3 flex flex-wrap items-baseline gap-1.5"><span className="text-base font-black">{formatMoney(item.price, currency)}</span>{discounted && <span className={`text-[10px] line-through ${muted}`}>{formatMoney(item.compareAtPrice!, currency)}</span>}</div>{item.prepTimeMinutes ? <p className={`mt-2 flex items-center gap-1 text-[10px] ${muted}`}><Clock3 className="h-3 w-3" />{item.prepTimeMinutes} {copy.prep}</p> : null}</div>
            </button>;
          })}
        </div>
        {visibleCount < filteredItems.length && <div className="mt-7 text-center"><Button onClick={() => setVisibleCount((value) => value + 40)} className="rounded-2xl px-8" style={{ background:primary }}>{copy.more}</Button></div>}
      </> : <div className={`rounded-[26px] border border-dashed p-12 text-center ${surface}`}><Search className="mx-auto h-10 w-10 opacity-20" /><p className="mt-3 font-bold">{copy.empty}</p></div>}
    </section>

    {itemCount > 0 && <button onClick={() => setCartOpen(true)} className="fixed bottom-4 start-1/2 z-40 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl px-5 py-4 text-white shadow-2xl" style={{ background:primary }}><span className="flex items-center gap-2 font-black"><ShoppingBag className="h-5 w-5" />{copy.cart} · {itemCount}</span><span className="font-black">{formatMoney(subtotal, currency)}</span></button>}

    <footer className="bg-[#06101b] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div className="min-w-0"><div className="flex items-center gap-3">{restaurant.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 font-black">{restaurant.name.slice(0,1)}</span>}<strong className="truncate">{restaurant.brandName || restaurant.name}</strong></div><p className="mt-4 break-words text-sm leading-7 text-slate-400">{restaurant.brandDescription || restaurant.address || restaurant.city}</p></div>
        <div className="min-w-0"><h3 className="font-black">{copy.contact}</h3><div className="mt-4 grid gap-3 text-sm text-slate-400">{restaurant.phone && <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 break-all"><Phone className="h-4 w-4" />{restaurant.phone}</a>}{restaurant.whatsapp && <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all"><Smartphone className="h-4 w-4" />{copy.whatsapp}</a>}{restaurant.email && <span className="break-all">{restaurant.email}</span>}</div></div>
        <div className="min-w-0"><h3 className="font-black">{copy.hours}</h3><div className="mt-4 grid gap-3 text-sm text-slate-400">{branches.length ? branches.slice(0,6).map((branch) => <div key={branch.id}><b className="text-slate-200">{branch.name}</b><p>{branch.openingTime || "—"} — {branch.closingTime || "—"}</p></div>) : <p>{copy.noBranch}</p>}</div></div>
        <div className="min-w-0"><h3 className="font-black">{copy.social}</h3><div className="mt-4 flex flex-wrap gap-2">{restaurant.instagramUrl && <a href={restaurant.instagramUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Instagram className="h-4 w-4" /></a>}{restaurant.facebookUrl && <a href={restaurant.facebookUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Facebook className="h-4 w-4" /></a>}{restaurant.websiteUrl && <a href={restaurant.websiteUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Globe2 className="h-4 w-4" /></a>}{restaurant.locationUrl && <a href={restaurant.locationUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/5"><Navigation className="h-4 w-4" /></a>}</div><button onClick={installApp} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-black"><Smartphone className="h-4 w-4" />{copy.install}</button></div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">Powered by NFOOD</div>
    </footer>

    {drawerOpen && <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}><aside onClick={(event) => event.stopPropagation()} className={`absolute top-0 flex h-[100dvh] w-[min(88vw,340px)] flex-col overflow-y-auto p-5 shadow-2xl ${direction === "rtl" ? "end-0" : "start-0"} ${dark ? "bg-[#0b1d35] text-white" : "bg-white text-[#0b1d35]"}`}><div className="flex items-center justify-between"><b className="text-lg">{restaurant.brandName || restaurant.name}</b><button onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><X className="h-4 w-4" /></button></div><div className="mt-6 grid gap-2">
      {[
        [copy.menu, Utensils, () => { setDrawerOpen(false); document.getElementById("menu-grid")?.scrollIntoView({ behavior:"smooth" }); }],
        [copy.cart, ShoppingBag, () => { setDrawerOpen(false); setCartOpen(true); }],
        [copy.reservation, CalendarDays, () => { setDrawerOpen(false); setReservationOpen(true); }],
        [copy.waiter, ConciergeBell, () => { setDrawerOpen(false); setWaiterOpen(true); }],
        [copy.account, UserRound, () => navigate(user ? "/customer-portal" : `/login?next=${encodeURIComponent(location)}`)],
        [copy.install, Smartphone, () => void installApp()],
      ].map(([label, Icon, action]) => <button key={String(label)} onClick={action as () => void} className={`flex items-center justify-between rounded-2xl border p-4 text-start text-sm font-black ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}><span className="flex items-center gap-3"><Icon className="h-5 w-5" />{String(label)}</span><ChevronDown className="h-4 w-4 -rotate-90 opacity-40" /></button>)}
    </div><div className="mt-6 rounded-2xl bg-slate-500/10 p-4"><p className="text-xs font-black">{copy.status}</p><p className={`mt-2 text-sm font-black ${isOpen ? "text-emerald-500" : "text-red-500"}`}>{isOpen ? copy.open : copy.closed}</p>{selectedBranch && <p className="mt-1 text-xs opacity-60">{selectedBranch.name} · {selectedBranch.openingTime || "—"}–{selectedBranch.closingTime || "—"}</p>}</div></aside></div>}

    <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) { setSelectedItemId(null); setSelectedAddonIds([]); } }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-lg overflow-y-auto rounded-[26px] p-0">
        {selectedItem && <>
          <div className="aspect-[16/10] overflow-hidden bg-slate-100">{selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Utensils className="h-10 w-10 text-slate-300" /></div>}</div>
          <div className="p-5"><DialogHeader><DialogTitle>{localize(selectedItem.translationsJson, selectedItem.name, lang, "name")}</DialogTitle><DialogDescription>{localize(selectedItem.translationsJson, selectedItem.description || "", lang, "description")}</DialogDescription></DialogHeader>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">{selectedItem.calories ? <span>{selectedItem.calories} {copy.calories}</span> : null}{selectedItem.prepTimeMinutes ? <span>{selectedItem.prepTimeMinutes} {copy.prep}</span> : null}</div>
            {itemAddons.length > 0 && <div className="mt-5"><h4 className="text-sm font-black">{copy.extras}</h4><div className="mt-2 grid gap-2">{itemAddons.map((addon) => <label key={addon.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={selectedAddonIds.includes(addon.id)} onChange={(event) => setSelectedAddonIds((current) => event.target.checked ? [...current, addon.id] : current.filter((id) => id !== addon.id))} />{localize(addon.translationsJson, addon.name, lang, "name")}</span><b>{formatMoney(addon.price, currency)}</b></label>)}</div></div>}
            <Button onClick={addSelectedProduct} className="mt-6 h-12 w-full rounded-2xl font-black text-white" style={{ background:primary }}>{copy.add} · {formatMoney(Number(selectedItem.price) + selectedAddonTotal, currency)}</Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>

    <Dialog open={cartOpen} onOpenChange={setCartOpen}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-2xl overflow-y-auto rounded-[26px]">
        <DialogHeader><DialogTitle>{copy.cart}</DialogTitle><DialogDescription>{itemCount} {copy.items}</DialogDescription></DialogHeader>
        <div className="grid gap-3">{cart.map((line) => <div key={line.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{line.name}</p><p className="mt-1 text-xs text-slate-500">{formatMoney(line.price + line.addonTotal, currency)}</p></div><div className="flex items-center gap-2"><button onClick={() => updateQty(line.key,-1)} className="grid h-8 w-8 place-items-center rounded-lg border"><Minus className="h-3 w-3" /></button><b>{line.quantity}</b><button onClick={() => updateQty(line.key,1)} className="grid h-8 w-8 place-items-center rounded-lg border"><Plus className="h-3 w-3" /></button></div></div>)}</div>
        <div className="mt-4 flex gap-2 overflow-x-auto">{enabledModes.filter((mode) => mode !== "reservation").map((mode) => <button key={mode} onClick={() => setOrderMode(mode)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black ${orderMode === mode ? "text-white" : ""}`} style={orderMode === mode ? { background:primary, borderColor:primary } : undefined}>{mode === "dineIn" ? copy.local : mode === "takeaway" ? copy.takeaway : mode === "delivery" ? copy.delivery : copy.room}</button>)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={copy.name} />
          <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder={copy.phone} dir="ltr" />
          {orderMode === "dineIn" && <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={copy.table} />}
          {orderMode === "takeaway" && pickupOptions.data?.length ? <select value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className="h-10 rounded-md border px-3"><option value="">{copy.takeaway}</option>{pickupOptions.data.map((point:any) => <option key={point.id ?? point.name} value={point.name}>{point.name}</option>)}</select> : null}
          {orderMode === "delivery" && <><Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={copy.address} className="sm:col-span-2" /><Button type="button" variant="outline" onClick={askLocation} className="sm:col-span-2"><MapPin className="me-2 h-4 w-4" />{copy.location}</Button></>}
          {orderMode === "hotel" && <><select value={hotelId ?? ""} onChange={(e) => { setHotelId(Number(e.target.value) || null); setHotelRoomId(null); }} className="h-10 rounded-md border px-3"><option value="">{copy.hotel}</option>{(hotelOptions.data ?? []).map((hotel:any) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}</select><select value={hotelRoomId ?? ""} onChange={(e) => setHotelRoomId(Number(e.target.value) || null)} className="h-10 rounded-md border px-3"><option value="">{copy.roomNumber}</option>{selectedHotelRooms.map((room:any) => <option key={room.id} value={room.id}>{room.roomNumber}{room.floor ? ` · ${room.floor}` : ""}</option>)}</select></>}
          <Textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder={copy.notes} className="sm:col-span-2" />
          {manualPayments.length > 1 && <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "cash" | "bank_transfer")} className="h-10 rounded-md border px-3 sm:col-span-2"><option value="cash">{copy.cash}</option><option value="bank_transfer">{copy.transfer}</option></select>}
        </div>
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-900"><div className="flex justify-between"><span>{copy.total}</span><b>{formatMoney(subtotal + deliveryFee, currency)}</b></div>{deliveryFee > 0 && <p className="mt-1 text-xs text-slate-500">{copy.delivery}: {formatMoney(deliveryFee, currency)}</p>}</div>
        <Button disabled={checkout.isPending || !cart.length || !isOpen} onClick={submitOrder} className="mt-4 h-12 w-full rounded-2xl font-black text-white" style={{ background:primary }}>{isOpen ? copy.checkout : copy.closed}</Button>
      </DialogContent>
    </Dialog>

    <Dialog open={reservationOpen} onOpenChange={(open) => { setReservationOpen(open); if (!open) setReservationStep(1); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-xl overflow-y-auto rounded-[26px]">
        <DialogHeader><DialogTitle>{copy.reservation}</DialogTitle><DialogDescription>{reservationStep === 1 ? `${copy.date} · ${copy.section}` : `${copy.name} · ${copy.phone}`}</DialogDescription></DialogHeader>
        {reservationStep === 1 ? <div className="grid gap-3 sm:grid-cols-2">
          <Input type="datetime-local" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} />
          {reservationSlots.data?.length ? <select value={reservationSlotId ?? ""} onChange={(e) => setReservationSlotId(Number(e.target.value) || undefined)} className="h-10 rounded-md border px-3"><option value="">{copy.date}</option>{reservationSlots.data.map((slot:any) => <option key={slot.id} value={slot.id}>{slot.label ?? slot.startTime ?? slot.id}</option>)}</select> : <div />}
          <select value={seatingSectionId ?? ""} onChange={(e) => setSeatingSectionId(Number(e.target.value) || undefined)} className="h-10 rounded-md border px-3"><option value="">{copy.section}</option>{seatingSections.filter((section) => !selectedBranchId || section.branchId === selectedBranchId).map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select>
          <Input type="number" min={1} max={50} value={reservationPartySize} onChange={(e) => setReservationPartySize(Math.max(1,Number(e.target.value)||1))} placeholder={copy.party} />
          <Input type="number" min={0} max={20} value={reservationChildrenCount} onChange={(e) => setReservationChildrenCount(Math.max(0,Number(e.target.value)||0))} placeholder={copy.children} />
        </div> : <div className="grid gap-3">
          <Input value={reservationName} onChange={(e) => setReservationName(e.target.value)} placeholder={copy.name} />
          <Input value={reservationEmail} onChange={(e) => setReservationEmail(e.target.value)} placeholder={copy.email} dir="ltr" />
          <Input value={reservationPhone} onChange={(e) => setReservationPhone(e.target.value)} placeholder={copy.phone} dir="ltr" />
          <label className="flex items-start gap-2 rounded-xl border p-3 text-xs"><input type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} className="mt-0.5" /><span>{copy.policy}</span></label>
        </div>}
        <div className="mt-4 flex gap-2">{reservationStep === 2 && <Button variant="outline" onClick={() => setReservationStep(1)} className="flex-1">{copy.back}</Button>}<Button onClick={submitReservation} disabled={reservation.isPending} className="flex-1 text-white" style={{ background:primary }}>{reservationStep === 1 ? copy.next : copy.confirm}</Button></div>
      </DialogContent>
    </Dialog>

    <Dialog open={waiterOpen} onOpenChange={setWaiterOpen}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-md overflow-y-auto rounded-[26px]">
        <DialogHeader><DialogTitle>{copy.waiter}</DialogTitle><DialogDescription>{selectedBranch?.name || copy.branch}</DialogDescription></DialogHeader>
        <div className="grid gap-3"><Input value={waiterTable} onChange={(e) => setWaiterTable(e.target.value)} placeholder={copy.table} /><Input value={waiterName} onChange={(e) => setWaiterName(e.target.value)} placeholder={copy.name} /><select value={waiterReason} onChange={(e) => setWaiterReason(e.target.value as typeof waiterReason)} className="h-10 rounded-md border px-3"><option value="المساعدة">{lang === "ar" ? "مساعدة" : "Help"}</option><option value="الطلب">{lang === "ar" ? "الطلب" : "Order"}</option><option value="الحساب">{lang === "ar" ? "الحساب" : "Account"}</option><option value="الفاتورة">{lang === "ar" ? "الفاتورة" : "Bill"}</option><option value="أخرى">{lang === "ar" ? "أخرى" : "Other"}</option></select></div>
        <Button disabled={!restaurant.waiterCallEnabled || !selectedBranchId || !waiterTable.trim() || notifyWaiter.isPending} onClick={() => selectedBranchId && notifyWaiter.mutate({ slug, branchId:selectedBranchId, tableName:waiterTable.trim(), reason:waiterReason, customerName:waiterName.trim() || undefined })} className="mt-4 w-full text-white" style={{ background:primary }}>{copy.send}</Button>
      </DialogContent>
    </Dialog>
  </main>;
}
