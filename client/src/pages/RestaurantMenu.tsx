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
import { QRCodeSVG } from "qrcode.react";
// QR Menu is intentionally imported separately from the multi-line Dialog import.
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
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function branchOpenNow(branch: any, timezone = "Asia/Riyadh") {
  if (!branch || branch.status !== "open") return false;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(new Date());
  const now = Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const start = minuteValue(branch.openingTime);
  const end = minuteValue(branch.closingTime);
  if (start === null || end === null) return true;
  return start === end || (start < end ? now >= start && now < end : now >= start || now < end);
}
function localize(raw: string | null | undefined, fallback: string, lang: string, field: "name" | "description" = "name") {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const entry = parsed.find((value) => value && typeof value === "object" && String((value as any).language ?? (value as any).lang ?? "").toLowerCase() === lang);
      if (entry && typeof (entry as any)[field] === "string" && (entry as any)[field].trim()) return (entry as any)[field];
      if (field === "name" && entry && typeof (entry as any).value === "string" && (entry as any).value.trim()) return (entry as any).value;
    } else if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, any>;
      const direct = record[lang];
      if (typeof direct === "string" && direct.trim()) return direct;
      if (direct && typeof direct[field] === "string" && direct[field].trim()) return direct[field];
      if (typeof record[field]?.[lang] === "string" && record[field][lang].trim()) return record[field][lang];
    }
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
  const { user, refresh } = useAuth();
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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState<1 | 2 | 3>(1);
  const [waiterStep, setWaiterStep] = useState<1 | 2>(1);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationStep, setReservationStep] = useState<1 | 2>(1);
  const [reservationKind, setReservationKind] = useState<"reservation" | "waitlist">("reservation");
  const [activeWaitlist, setActiveWaitlist] = useState<{ id:number; phone:string } | null>(() => { try { return JSON.parse(window.localStorage.getItem(`nfood:waitlist:${slug}`) || "null"); } catch { return null; } });
  const [waiterOpen, setWaiterOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [tableName, setTableName] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [pickupPoint, setPickupPoint] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLatitude, setDeliveryLatitude] = useState<number | undefined>();
  const [deliveryLongitude, setDeliveryLongitude] = useState<number | undefined>();
  const [orderNotes, setOrderNotes] = useState("");
  const [dineInPartySize, setDineInPartySize] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer">("cash");
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelRoomId, setHotelRoomId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationSlotId, setReservationSlotId] = useState<number | undefined>();
  const [seatingSectionId: seatingSectionId || undefined, setSeatingSectionId] = useState<number | undefined>();
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
  const [pageScrolled, setPageScrolled] = useState(false);

  // Keep registered-customer checkout details for one day. Only service-specific
  // choices (table/section/session) should change between visits.
  useEffect(() => {
    if (!user) return;
    const key = `nfood:customer-checkout:${user.id}`;
    let cached: { name?: string; phone?: string; at?: number } = {};
    try { cached = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
    const fresh = cached.at && Date.now() - cached.at < 24 * 60 * 60 * 1000;
    const accountName = String((user as any).name ?? (user as any).displayName ?? "").trim();
    const accountPhone = String((user as any).phone ?? "").trim();
    if (!guestName) setGuestName(fresh && cached.name ? cached.name : accountName);
    if (!guestPhone) setGuestPhone(fresh && cached.phone ? cached.phone : accountPhone);
    if (!reservationName) setReservationName(fresh && cached.name ? cached.name : accountName);
    if (!reservationPhone) setReservationPhone(fresh && cached.phone ? cached.phone : accountPhone);
    if (!reservationEmail) setReservationEmail(String((user as any).email ?? ""));
  }, [user]);

  useEffect(() => {
    if (!user || !guestName.trim() || !guestPhone.trim()) return;
    try { localStorage.setItem(`nfood:customer-checkout:${user.id}`, JSON.stringify({ name: guestName.trim(), phone: guestPhone.trim(), at: Date.now() })); } catch {}
  }, [user, guestName, guestPhone]);

  useEffect(() => {
    if (!restaurant) return;
    const saved = window.localStorage.getItem(`nfood:menu-theme:${slug}`);
    if (saved === "light" || saved === "dark") { setTheme(saved); return; }
    const configured = restaurant.themeMode;
    if (configured === "light" || configured === "dark") setTheme(configured);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, [restaurant?.themeMode, slug]);

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
    room:"خدمة غرف", add:"إضافة للسلة", extras:"الإضافات", calories:"سعرات حرارية", prep:"دقيقة", total:"الإجمالي",
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
    if (orderMode && !enabledModes.includes(orderMode)) setOrderMode(null);
  }, [enabledModes, orderMode]);

  useEffect(() => {
    setSelectedTableId(null);
    setTableName("");
    setPickupPoint("");
    setHotelId(null);
    setHotelRoomId(null);
  }, [selectedBranchId, orderMode]);

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
  const availableTables = trpc.platform.publicAvailableTables.useQuery(
    { slug, branchId: selectedBranchId ?? 0 },
    { enabled: orderMode === "dineIn" && Boolean(selectedBranchId), retry:false }
  );
  const reservationSlots = trpc.platform.reservationSlots.useQuery(
    { slug, branchId: selectedBranchId ?? 0 },
    { enabled: reservationOpen && Boolean(selectedBranchId), retry:false }
  );
  const waitlistStatus = trpc.platform.publicWaitlistStatus.useQuery(
    { slug, reservationId: activeWaitlist?.id ?? 0, phone: activeWaitlist?.phone ?? "" },
    { enabled: Boolean(activeWaitlist?.id && activeWaitlist?.phone), retry:false, refetchInterval:5000 }
  );
  const deliveryQuote = trpc.platform.deliveryQuote.useQuery(
    { slug, branchId: selectedBranchId ?? 0, latitude: deliveryLatitude ?? 0, longitude: deliveryLongitude ?? 0, subtotal },
    { enabled: orderMode === "delivery" && Boolean(selectedBranchId && deliveryLatitude !== undefined && deliveryLongitude !== undefined), retry:false }
  );
  const deliveryFee = orderMode === "delivery" && deliveryQuote.data?.available ? Number(deliveryQuote.data.fee || 0) : 0;

  const inlineLogin = trpc.auth.testLogin.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success(lang === "ar" ? "تم تسجيل الدخول، يمكنك إكمال الطلب" : lang === "fr" ? "Connexion réussie, vous pouvez terminer la commande" : "Signed in. You can now complete your order");
    },
    onError: (error) => {
      if (error.message === "VERIFY_EMAIL_REQUIRED") {
        toast.error(lang === "ar" ? "تحقق من بريدك الإلكتروني أولًا" : lang === "fr" ? "Vérifiez d’abord votre e-mail" : "Verify your email first");
        return;
      }
      toast.error(error.message || (lang === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid sign-in credentials"));
    },
  });

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
    onSuccess: (result) => {
      setReservationOpen(false);
      setReservationStep(1);
      if (reservationKind === "waitlist") {
        const active = { id: result.id, phone: reservationPhone.trim() };
        setActiveWaitlist(active);
        window.localStorage.setItem(`nfood:waitlist:${slug}`, JSON.stringify(active));
        toast.success(lang === "ar" ? `تم تسجيل انتظارك · W-${String(result.id).padStart(3,"0")}` : `Waitlist W-${String(result.id).padStart(3,"0")}`);
      } else toast.success(lang === "ar" ? "تم إرسال طلب الحجز" : lang === "fr" ? "Réservation envoyée" : "Reservation sent");
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
    if (!orderMode) {
      toast.error(lang === "ar" ? "اختر نوع الطلب أولًا" : lang === "fr" ? "Choisissez d’abord le type de commande" : "Choose an order type first");
      return;
    }
    if (!user) {
      toast.info(lang === "ar" ? "سجّل الدخول من داخل السلة لإتمام الطلب" : lang === "fr" ? "Connectez-vous dans le panier pour terminer la commande" : "Sign in inside the cart to complete your order");
      return;
    }
    if (!selectedBranchId || !cart.length || guestName.trim().length < 2 || guestPhone.trim().length < 7) {
      toast.error(lang === "ar" ? "أكمل بيانات الطلب الأساسية" : "Complete the required order details");
      return;
    }
    if (orderMode === "dineIn" && (!selectedTableId || !tableName.trim())) return toast.error(lang === "ar" ? "اختر طاولة متاحة" : lang === "fr" ? "Choisissez une table disponible" : "Choose an available table");
    if (orderMode === "takeaway" && pickupOptions.data?.length && !pickupPoint.trim()) return toast.error(lang === "ar" ? "اختر نقطة الاستلام" : "Choose pickup point");
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
      partySize:orderMode === "dineIn" ? dineInPartySize : undefined,
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
      if (!selectedBranchId) return toast.error(lang === "ar" ? "اختر الفرع" : "Choose branch");
      if (reservationKind === "reservation" && !seatingSectionId) return toast.error(lang === "ar" ? "اختر قسم الجلسة" : "Choose seating");
      if (reservationKind === "reservation") {
        if (!reservationDate) return toast.error(lang === "ar" ? "اختر تاريخًا ووقتًا مستقبليين" : "Choose a future date and time");
        const when = new Date(reservationDate);
        if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return toast.error(lang === "ar" ? "الحجز المسبق يجب أن يكون في وقت لاحق" : "Advance booking must be in the future");
      }
      setReservationStep(2);
      return;
    }
    if (!selectedBranchId || reservationName.trim().length < 2 || reservationPhone.trim().length < 7 || !policyAccepted) return toast.error(lang === "ar" ? "أكمل البيانات المطلوبة" : "Complete required details");
    if (reservationKind === "reservation" && !reservationEmail.trim()) return toast.error(lang === "ar" ? "أدخل البريد الإلكتروني للحجز المسبق" : "Enter email for advance booking");
    reservation.mutate({
      slug,
      branchId:selectedBranchId,
      kind: reservationKind,
      slotId:reservationKind === "reservation" && reservationSlotId && reservationSlotId > 0 ? reservationSlotId : undefined,
      seatingSectionId,
      childrenCount:reservationChildrenCount,
      policyAccepted:true,
      customerName:reservationName.trim(),
      email:reservationKind === "reservation" ? reservationEmail.trim() : undefined,
      phone:reservationPhone.trim(),
      partySize:reservationPartySize,
      reservedFor:reservationKind === "reservation" ? new Date(reservationDate) : new Date(),
      durationMinutes:reservationKind === "reservation" ? 60 : 15,
    });
  };

  const mapsEmbedUrl = (query: string) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapsOpenUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

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

  return <main dir={direction} className={`min-h-screen overflow-x-hidden ${dark ? "dark" : ""} ${pageBg}`} style={{ fontFamily:restaurant.brandFontFamily || undefined, "--restaurant-primary":primary, "--restaurant-accent":accent } as React.CSSProperties}>
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${dark ? "border-white/10 bg-[#071525]/92" : "border-slate-200 bg-white/92"}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={() => setDrawerOpen(true)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          {restaurant.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 font-black text-white">{restaurant.name.slice(0,1)}</span>}
          <div className="min-w-0"><h1 className="truncate text-sm font-black sm:text-base">{restaurant.brandName || restaurant.name}</h1></div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher compact />
          <button onClick={() => setTheme((value) => { const next = value === "dark" ? "light" : "dark"; window.localStorage.setItem(`nfood:menu-theme:${slug}`, next); return next; })} className={`grid h-10 w-10 place-items-center rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`} aria-label="Theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={() => user ? navigate("/customer-portal") : navigate(`/login?next=${encodeURIComponent(location)}`)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1d35] text-white" aria-label={copy.account}><UserRound className="h-4 w-4" /></button>
        </div>
      </div>
    </header>

    <section className="relative h-[118px] max-h-[118px] w-full overflow-hidden bg-[#071525] text-white motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500 sm:h-[145px] sm:max-h-[145px] md:h-[170px] md:max-h-[170px] lg:h-[190px] lg:max-h-[190px]">
      <div className="relative h-full w-full overflow-hidden">
          {restaurant.coverUrl
            ? <img src={restaurant.coverUrl} alt={restaurant.brandName || restaurant.name} className="absolute inset-0 h-full w-full object-cover object-center" />
            : <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d35] via-[#12345a] to-[#071525]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071525]/55 via-transparent to-transparent" />
          <button type="button" onClick={() => document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="absolute bottom-3 start-1/2 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-white/30 bg-[#071525]/70 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-[#071525]/90" aria-label={lang === "ar" ? "انتقل إلى قائمة الطعام" : "Go to menu"}><ChevronDown className="h-5 w-5" /></button>

      </div>
    </section>

    <section className={`border-b ${dark ? "border-white/10 bg-[#0a1a2d]" : "border-slate-200 bg-white"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {restaurant.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1 dark:border-white/10" /> : null}
          <div className="min-w-0">
            <h2 className="truncate text-base font-black sm:text-lg">{restaurant.brandName || restaurant.name}</h2>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
              <p className="text-xs font-black">{isOpen ? copy.open : copy.closed}</p>
              {selectedBranch && <><span className={`inline-flex min-w-0 items-center gap-1 truncate rounded-full px-2 py-1 text-[10px] font-bold ${dark ? "bg-white/5" : "bg-slate-100"} ${muted}`}><MapPin className="h-3 w-3 shrink-0" />{selectedBranch.city || restaurant.city || selectedBranch.name}</span>{restaurant.reservationEnabled !== false && <button onClick={() => { setReservationStep(1); setReservationOpen(true); }} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black text-white shadow-sm transition active:scale-95" style={{ backgroundColor: primary }}><CalendarDays className="h-3 w-3" />{copy.reservation}</button>}</>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => setDrawerOpen(true)} className={`hidden rounded-xl border px-3 py-2 text-xs font-black sm:block ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>{copy.storeInfo}</button>
        </div>
      </div>
    </section>

    {activeWaitlist && waitlistStatus.data && !["completed","cancelled","no_show"].includes(waitlistStatus.data.status) ? <section className="mx-auto max-w-7xl px-3 pt-3 sm:px-5"><div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-900 shadow-sm dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-white"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold opacity-70">{lang === "ar" ? "رقم انتظارك" : "Your wait number"}</p><p className="text-xl font-black">W-{String(waitlistStatus.data.id).padStart(3,"0")}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700 shadow-sm dark:bg-white/10 dark:text-orange-200">{waitlistStatus.data.status === "confirmed" ? (lang === "ar" ? "طاولتك جاهزة" : "Table ready") : waitlistStatus.data.status === "seated" ? (lang === "ar" ? "تم إجلاسك" : "Seated") : (lang === "ar" ? "بانتظار طاولة" : "Waiting")}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-white/70 p-2 dark:bg-white/5"><b className="block text-lg">{waitlistStatus.data.ahead}</b><span className="text-[11px] opacity-70">{lang === "ar" ? "مجموعات أمامك" : "groups ahead"}</span></div><div className="rounded-xl bg-white/70 p-2 dark:bg-white/5"><b className="block text-lg">{waitlistStatus.data.estimatedMinutes}–{waitlistStatus.data.estimatedMinutes + 5}</b><span className="text-[11px] opacity-70">{lang === "ar" ? "دقيقة تقريبًا" : "estimated minutes"}</span></div></div>{waitlistStatus.data.status === "confirmed" ? <p className="mt-3 rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100">{lang === "ar" ? "طاولتك جاهزة — توجه للاستقبال" : "Your table is ready — please go to reception"}</p> : null}</div></section> : null}
    <section aria-label={copy.menu} className="mx-auto max-w-7xl px-3 pb-2 pt-2 sm:px-5 sm:pb-3 sm:pt-3">
      <div className={`flex items-center rounded-2xl border px-3 ${surface}`}><Search className={`h-5 w-5 shrink-0 ${muted}`} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0" /></div>
      <div className="mt-2"><label className={`mb-1.5 block text-xs font-black ${muted}`}>{lang === "ar" ? "القسم" : lang === "fr" ? "Catégorie" : "Category"}</label><select aria-label={copy.menu} value={String(activeCategory)} onChange={(event) => setActiveCategory(event.target.value === "all" ? "all" : Number(event.target.value))} className={`h-11 w-full rounded-xl border px-3 text-sm font-bold outline-none transition duration-200 focus:ring-2 focus:ring-orange-400/30 sm:max-w-xs ${surface}`}><option value="all">{copy.all}</option>{categories.map((category) => <option key={category.id} value={category.id}>{localize(category.translationsJson, category.name, lang, "name")}</option>)}</select></div>
    </section>

    <section id="menu-grid" className="mx-auto max-w-7xl px-3 pb-28 sm:px-5">
      {filteredItems.length ? <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.slice(0, visibleCount).map((item) => {
            const name = localize(item.translationsJson, item.name, lang, "name");
            const description = localize(item.translationsJson, item.description || "", lang, "description");
            const discounted = item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price);
            return <button key={item.id} onClick={() => openProduct(item.id)} className={`group min-w-0 overflow-hidden rounded-[22px] border text-start shadow-sm transition duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 active:scale-[0.98] sm:hover:-translate-y-1 sm:hover:shadow-xl ${surface}`}>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100/80 dark:bg-white/5">{item.imageUrl ? <><img src={item.imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-black/10" /><img src={item.imageUrl} alt={name} loading="lazy" className="relative z-10 h-full w-full object-contain object-center" /></> : <div className="grid h-full place-items-center"><Utensils className="h-9 w-9 opacity-20" /></div>}</div>
              <div className="min-w-0 p-3"><h3 className="line-clamp-1 text-[13px] font-black leading-5 sm:text-sm">{name}</h3>{description && <p className={`mt-0.5 line-clamp-1 text-[11px] leading-4 ${muted}`}>{description}</p>}<div className="mt-2 flex items-center justify-between gap-2"><div className="flex min-w-0 flex-wrap items-baseline gap-1.5"><span className="text-base font-black">{formatMoney(item.price, currency)}</span>{discounted && <span className="text-[10px] font-bold text-red-600 line-through dark:text-red-400">{formatMoney(item.compareAtPrice!, currency)}</span>}</div><span className="shrink-0 rounded-xl px-3 py-2 text-[10px] font-black text-white" style={{ background:primary }}>{copy.add}</span></div></div>
            </button>;
          })}
        </div>
        {visibleCount < filteredItems.length && <div className="mt-7 text-center"><Button onClick={() => setVisibleCount((value) => value + 40)} className="rounded-2xl px-8" style={{ background:primary }}>{copy.more}</Button></div>}
      </> : <div className={`rounded-[26px] border border-dashed p-12 text-center ${surface}`}><Search className="mx-auto h-10 w-10 opacity-20" /><p className="mt-3 font-bold">{copy.empty}</p></div>}
    </section>

    {itemCount > 0 && <button onClick={() => setCartOpen(true)} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[min(92vw,430px)] -translate-x-1/2 items-center justify-between rounded-2xl border border-white/20 px-5 py-3.5 text-white shadow-2xl backdrop-blur-md motion-safe:animate-in motion-safe:slide-in-from-bottom-5 motion-safe:fade-in motion-safe:duration-300 active:scale-[0.98] sm:hidden" style={{ background:primary }}><span className="flex items-center gap-2 font-black"><ShoppingBag className="h-5 w-5" />{copy.cart} · {itemCount}</span><span className="font-black">{formatMoney(subtotal, currency)}</span></button>}

    <footer className="bg-[#06101b] px-4 py-8 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-7 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {restaurant.brandLogoUrl ? <img src={restaurant.brandLogoUrl} alt="" className="h-12 w-12 rounded-2xl bg-white/10 object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white" style={{ background:primary }}>{(restaurant.brandName || restaurant.name).charAt(0)}</div>}
            <div className="min-w-0"><p className="truncate text-base font-black text-white">{restaurant.brandName || restaurant.name}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><MapPin className="h-3 w-3" />{selectedBranch?.city || restaurant.city || restaurant.address || "—"}</p></div>
          </div>
          {restaurant.brandDescription && <p className="mt-3 max-w-md text-xs leading-6 text-slate-400">{restaurant.brandDescription}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} className="rounded-full border border-white/10 px-3 py-2 text-[11px] font-bold transition hover:border-orange-400 hover:text-white"><Phone className="me-1 inline h-3 w-3" />{restaurant.phone}</a>}
            {restaurant.whatsapp && <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-2 text-[11px] font-bold transition hover:border-orange-400 hover:text-white">WhatsApp</a>}
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-white">{lang === "ar" ? "أقسام المنيو" : lang === "fr" ? "Catégories" : "Menu categories"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => <button key={category.id} onClick={() => { setActiveCategory(category.id); document.getElementById("menu-grid")?.scrollIntoView({ behavior:"smooth" }); }} className="truncate rounded-xl border border-white/10 px-3 py-2 text-start text-[11px] font-bold text-slate-300 transition hover:border-orange-400/60 hover:bg-white/5 hover:text-white">{localize(category.translationsJson, category.name, lang, "name")}</button>)}
          </div>
        </div>
        <div className="flex items-center gap-4 lg:justify-end">
          <div className="rounded-2xl bg-white p-2 shadow-xl"><QRCodeSVG value={typeof window !== "undefined" ? window.location.href.split("?")[0] : `https://fooncard.com/menu/${slug}`} size={92} level="H" /></div>
          <div><p className="text-sm font-black text-white">QR Menu</p><p className="mt-1 max-w-32 text-[10px] leading-5 text-slate-400">{lang === "ar" ? "امسح للدخول مباشرة إلى منيو المطعم" : "Scan to open this menu"}</p></div>
        </div>
      </div>
      <div className="mx-auto mt-7 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[10px] text-slate-500"><span>Powered by NFOOD</span><span>© {new Date().getFullYear()} {restaurant.brandName || restaurant.name}</span></div>
    </footer>

    {drawerOpen && <div className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}><aside onClick={(event) => event.stopPropagation()} className={`absolute top-0 flex h-[100dvh] w-[min(88vw,340px)] flex-col overflow-y-auto p-5 shadow-2xl ${direction === "rtl" ? "end-0" : "start-0"} ${dark ? "bg-[#0b1d35] text-white" : "bg-white text-[#0b1d35]"}`}><div className="flex items-center justify-between"><b className="text-lg">{restaurant.brandName || restaurant.name}</b><button onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><X className="h-4 w-4" /></button></div>
      {restaurant.brandDescription && <p className={`mt-3 text-xs leading-6 ${muted}`}>{restaurant.brandDescription}</p>}
      {branches.length > 0 && <div className="mt-5">
        <label className={`mb-2 block text-[10px] font-black uppercase tracking-[.16em] ${muted}`}>{copy.branch}</label>
        <select value={selectedBranchId ?? ""} onChange={(event) => setSelectedBranchId(Number(event.target.value))} className={`h-11 w-full rounded-xl border px-3 text-sm font-black outline-none ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"}`}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
      </div>}
      <div className="mt-6 grid gap-2">
      {([
        { label: copy.startOrder, Icon: Utensils, action: () => { setDrawerOpen(false); document.getElementById("menu-grid")?.scrollIntoView({ behavior:"smooth" }); } },
        { label: copy.cart, Icon: ShoppingBag, action: () => { setDrawerOpen(false); setCartOpen(true); } },
        { label: copy.reservation, Icon: CalendarDays, action: () => { setDrawerOpen(false); setReservationOpen(true); } },
        { label: copy.waiter, Icon: ConciergeBell, action: () => { setDrawerOpen(false); setWaiterOpen(true); } },
        { label: copy.account, Icon: UserRound, action: () => navigate(user ? "/customer-portal" : `/login?next=${encodeURIComponent(location)}`) },
        { label: copy.install, Icon: Smartphone, action: () => { void installApp(); } },
      ] as const).map(({ label, Icon, action }) => <button key={label} onClick={action} className={`flex items-center justify-between rounded-2xl border p-4 text-start text-sm font-black ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}><span className="flex items-center gap-3"><Icon className="h-5 w-5" />{label}</span><ChevronDown className="h-4 w-4 -rotate-90 opacity-40" /></button>)}
    </div>
      <div className="mt-6 space-y-5 border-t border-slate-500/15 pt-5">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[.16em] ${muted}`}>{copy.hours}</p>
          <div className="mt-2 grid gap-2 text-xs">{branches.slice(0,6).map((branch) => <div key={branch.id} className="flex items-center justify-between gap-3"><span className="truncate font-bold">{branch.name}</span><span className={muted}>{branch.openingTime || "—"}–{branch.closingTime || "—"}</span></div>)}</div>
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[.16em] ${muted}`}>{copy.contact}</p>
          <div className="mt-2 grid gap-2 text-xs">
            {restaurant.phone && <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2"><Phone className="h-4 w-4" />{restaurant.phone}</a>}
            {restaurant.whatsapp && <a href={`https://wa.me/${restaurant.whatsapp.replace(/\\D/g,"")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2"><Smartphone className="h-4 w-4" />{copy.whatsapp}</a>}
            {restaurant.email && <span className="break-all">{restaurant.email}</span>}
          </div>
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[.16em] ${muted}`}>{copy.social}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {restaurant.instagramUrl && <a href={restaurant.instagramUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><Instagram className="h-4 w-4" /></a>}
            {restaurant.facebookUrl && <a href={restaurant.facebookUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><Facebook className="h-4 w-4" /></a>}
            {restaurant.websiteUrl && <a href={restaurant.websiteUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><Globe2 className="h-4 w-4" /></a>}
            {restaurant.locationUrl && <a href={restaurant.locationUrl} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl bg-slate-500/10"><Navigation className="h-4 w-4" /></a>}
          </div>
        </div>
      </div>
    </aside></div>}

    <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) { setSelectedItemId(null); setSelectedAddonIds([]); } }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-lg overflow-y-auto rounded-[26px] p-0">
        {selectedItem && <>
          <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-white/5">{selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt={localize(selectedItem.translationsJson, selectedItem.name, lang, "name")} className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center"><Utensils className="h-10 w-10 text-slate-300" /></div>}</div>
          <div className="p-5"><DialogHeader><DialogTitle>{localize(selectedItem.translationsJson, selectedItem.name, lang, "name")}</DialogTitle><DialogDescription>{localize(selectedItem.translationsJson, selectedItem.description || "", lang, "description")}</DialogDescription></DialogHeader>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">{selectedItem.calories ? <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{copy.calories} · {selectedItem.calories} kcal</span> : null}{selectedItem.prepTimeMinutes ? <span>{selectedItem.prepTimeMinutes} {copy.prep}</span> : null}</div>
            {itemAddons.length > 0 && <div className="mt-5"><h4 className="text-sm font-black">{copy.extras}</h4><div className="mt-2 grid gap-2">{itemAddons.map((addon) => <label key={addon.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm"><span className="flex items-center gap-2"><input type="checkbox" checked={selectedAddonIds.includes(addon.id)} onChange={(event) => setSelectedAddonIds((current) => event.target.checked ? [...current, addon.id] : current.filter((id) => id !== addon.id))} />{localize(addon.translationsJson, addon.name, lang, "name")}</span><b>{formatMoney(addon.price, currency)}</b></label>)}</div></div>}
            <Button onClick={addSelectedProduct} className="mt-6 h-12 w-full rounded-2xl font-black text-white" style={{ background:primary }}>{copy.add} · {formatMoney(Number(selectedItem.price) + selectedAddonTotal, currency)}</Button>
          </div>
        </>}
      </DialogContent>
    </Dialog>

    <button type="button" onClick={() => pageScrolled ? window.scrollTo({ top: 0, behavior: "smooth" }) : document.getElementById("menu-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="fixed bottom-24 end-4 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white shadow-xl transition hover:scale-105 active:scale-95 sm:end-6" style={{ backgroundColor: accent }} aria-label={pageScrolled ? copy.back : copy.menu}><ChevronDown className={`h-5 w-5 transition-transform duration-300 ${pageScrolled ? "rotate-180" : ""}`} /></button>

    <Dialog open={cartOpen} onOpenChange={(open) => { setCartOpen(open); if (!open) setCartStep(1); }}>
      <DialogContent className="fixed left-1/2 top-1/2 max-h-[min(720px,calc(100dvh-32px))] w-[calc(100%-24px)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px]">
        <DialogHeader><DialogTitle>{copy.cart} · {cartStep}/3</DialogTitle><DialogDescription>{cartStep === 1 ? `${itemCount} ${copy.items}` : cartStep === 2 ? (lang === "ar" ? "اختر نوع الطلب" : lang === "fr" ? "Choisissez le service" : "Choose your service") : (lang === "ar" ? "بيانات الطلب والتأكيد" : lang === "fr" ? "Détails et confirmation" : "Details and confirmation")}</DialogDescription></DialogHeader>
        {cartStep === 1 ? <>
        <div className="grid gap-3">{cart.map((line) => <div key={line.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{line.name}</p><p className="mt-1 text-xs text-slate-500">{formatMoney(line.price + line.addonTotal, currency)}</p></div><div className="flex items-center gap-2"><button onClick={() => updateQty(line.key,-1)} className="grid h-8 w-8 place-items-center rounded-lg border"><Minus className="h-3 w-3" /></button><b>{line.quantity}</b><button onClick={() => updateQty(line.key,1)} className="grid h-8 w-8 place-items-center rounded-lg border"><Plus className="h-3 w-3" /></button></div></div>)}</div>
        <Button disabled={!cart.length} onClick={() => setCartStep(2)} className="mt-4 h-11 w-full text-white" style={{ background:primary }}>{copy.next}</Button>
        </> : cartStep === 2 ? <>
        <Button variant="outline" onClick={() => setCartStep(1)} className="mb-3 h-10">{copy.back}</Button>
        <div className="mt-5">
          <p className="text-xs font-black text-slate-500">{lang === "ar" ? "اختر نوع الطلب" : lang === "fr" ? "Choisissez le type de commande" : "Choose order type"}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {enabledModes.map((mode) => {
              const label = mode === "dineIn" ? copy.local : mode === "takeaway" ? copy.takeaway : mode === "delivery" ? copy.delivery : mode === "reservation" ? copy.withReservation : copy.room;
              const Icon = mode === "dineIn" ? Utensils : mode === "takeaway" ? ShoppingBag : mode === "delivery" ? Truck : mode === "reservation" ? CalendarDays : Hotel;
              return <button key={mode} type="button" onClick={() => setOrderMode(mode)} className={`flex min-h-16 items-center gap-2 rounded-2xl border p-3 text-start text-xs font-black transition ${orderMode === mode ? "border-transparent text-white shadow-lg" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`} style={orderMode === mode ? { background:primary } : undefined}><Icon className="h-5 w-5 shrink-0" /><span>{label}</span></button>;
            })}
          </div>
        </div>

        <Button disabled={!orderMode} onClick={() => setCartStep(3)} className="mt-4 h-11 w-full text-white" style={{ background:primary }}>{copy.next}</Button>
        </> : <>
        <Button variant="outline" onClick={() => setCartStep(2)} className="mb-3 h-10">{copy.back}</Button>
        {orderMode ? <>
          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
            <p className="mb-3 text-xs font-black text-slate-500">{lang === "ar" ? "أكمل بيانات الطلب" : lang === "fr" ? "Complétez la commande" : "Complete your order"}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={copy.name} />
              <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder={copy.phone} dir="ltr" />
              {orderMode === "dineIn" && <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-black text-slate-500">{lang === "ar" ? "اختر طاولتك" : lang === "fr" ? "Choisissez votre table" : "Choose your table"}</p>
                {availableTables.isLoading ? <div className="rounded-xl border border-dashed p-3 text-center text-xs text-slate-500">{lang === "ar" ? "جارٍ تحميل الطاولات..." : "Loading tables..."}</div> : availableTables.data?.length ? <select value={selectedTableId ?? ""} onChange={(event) => { const id = Number(event.target.value); const table = availableTables.data?.find((item) => item.id === id); setSelectedTableId(id || null); setTableName(table?.name ?? ""); if (table) setDineInPartySize(Math.max(1, Number(table.seats) || 1)); }} className={`h-11 w-full rounded-xl border px-3 text-sm font-bold outline-none ${surface}`}><option value="">{lang === "ar" ? "اختر رقم الطاولة" : lang === "fr" ? "Choisir une table" : "Choose table"}</option>{[...availableTables.data].sort((a, b) => { const an = Number(String(a.name).match(/\\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER); const bn = Number(String(b.name).match(/\\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER); return an - bn || String(a.name).localeCompare(String(b.name)); }).map((table) => <option key={table.id} value={table.id}>{String(table.name).replace(/^(طاولة|Table|TABLE)\\s*/i, "") || table.name} · {table.seats} {lang === "ar" ? "مقاعد" : lang === "fr" ? "places" : "seats"}</option>)}</select> : <div className="rounded-xl border border-dashed p-3 text-center text-xs text-slate-500">{lang === "ar" ? "لا توجد طاولات متاحة الآن" : lang === "fr" ? "Aucune table disponible" : "No tables available right now"}</div>}
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5"><div><span className="text-xs font-bold">{copy.party}</span><span className="mt-0.5 block text-[10px] text-slate-500">{lang === "ar" ? "عدد الأشخاص الفعلي لتجهيز الخدمة" : lang === "fr" ? "Nombre réel de personnes" : "Actual number of guests"}</span></div><div className="flex items-center gap-2"><button type="button" onClick={() => setDineInPartySize((value) => Math.max(1, value - 1))} className="grid h-8 w-8 place-items-center rounded-lg border" aria-label={lang === "ar" ? "إنقاص عدد الضيوف" : "Decrease guests"}><Minus className="h-3.5 w-3.5" /></button><span className="min-w-8 text-center text-base font-black">{dineInPartySize}</span><button type="button" onClick={() => setDineInPartySize((value) => Math.min(50, value + 1))} className="grid h-8 w-8 place-items-center rounded-lg border" aria-label={lang === "ar" ? "زيادة عدد الضيوف" : "Increase guests"}><Plus className="h-3.5 w-3.5" /></button></div></div>
              </div>}
              {orderMode === "takeaway" && <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-black text-slate-500">{lang === "ar" ? "اختر نقطة الاستلام" : lang === "fr" ? "Choisissez le point de retrait" : "Choose pickup point"}</p>
                {pickupOptions.data?.length ? <div className="grid gap-2">{pickupOptions.data.map((point:any) => {
                  const selected = pickupPoint === point.name;
                  const mapQuery = point.address || point.name;
                  return <div key={point.id ?? point.name} className={`overflow-hidden rounded-2xl border ${selected ? "border-orange-400" : "border-slate-200 dark:border-white/10"}`}>
                    <button type="button" onClick={() => setPickupPoint(point.name)} className={`w-full p-3 text-start ${selected ? "bg-orange-500/10" : "bg-slate-50 dark:bg-white/5"}`}>
                      <span className="block text-sm font-black">{point.name}</span>
                      {point.address && <span className="mt-1 block text-xs text-slate-500">{point.address}</span>}
                      {(point.openingTime || point.closingTime) && <span className="mt-1 block text-[10px] text-slate-400">{point.openingTime || "—"}–{point.closingTime || "—"}</span>}
                    </button>
                    {selected && mapQuery && <div className="border-t border-slate-200 dark:border-white/10"><iframe title={point.name} src={mapsEmbedUrl(mapQuery)} className="h-40 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={mapsOpenUrl(mapQuery)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-black text-blue-600"><MapPin className="h-4 w-4" />{lang === "ar" ? "فتح الموقع في الخريطة" : lang === "fr" ? "Ouvrir sur la carte" : "Open in map"}</a></div>}
                  </div>;
                })}</div> : <div className="rounded-xl border border-dashed p-4 text-center text-xs text-slate-500">{lang === "ar" ? "لم يضف المطعم نقاط استلام لهذا الفرع" : lang === "fr" ? "Aucun point de retrait" : "No pickup points configured"}</div>}
              </div>}
              {orderMode === "delivery" && <div className="sm:col-span-2 space-y-3">
                <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={lang === "ar" ? "عنوان السكن / الحي / الشارع / رقم المبنى" : copy.address} />
                <Button type="button" variant="outline" onClick={askLocation} className="w-full"><MapPin className="me-2 h-4 w-4" />{copy.location}</Button>
                {deliveryLatitude !== undefined && deliveryLongitude !== undefined && <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                  <iframe title="delivery-location" src={mapsEmbedUrl(`${deliveryLatitude},${deliveryLongitude}`)} className="h-48 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  <div className="flex items-center justify-between gap-3 p-3 text-[10px] text-slate-500"><span>{deliveryLatitude.toFixed(5)}, {deliveryLongitude.toFixed(5)}</span><a href={mapsOpenUrl(`${deliveryLatitude},${deliveryLongitude}`)} target="_blank" rel="noreferrer" className="font-black text-blue-600">{lang === "ar" ? "فتح الخريطة" : "Open map"}</a></div>
                </div>}
              </div>}
              {orderMode === "hotel" && <><select value={hotelId ?? ""} onChange={(e) => { setHotelId(Number(e.target.value) || null); setHotelRoomId(null); }} className="h-10 rounded-md border px-3"><option value="">{lang === "ar" ? "اختر الفندق المسجل" : lang === "fr" ? "Choisissez l’hôtel" : "Choose registered hotel"}</option>{(hotelOptions.data ?? []).map((hotel:any) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}</select><select value={hotelRoomId ?? ""} onChange={(e) => setHotelRoomId(Number(e.target.value) || null)} className="h-10 rounded-md border px-3"><option value="">{lang === "ar" ? "اختر رقم الغرفة" : lang === "fr" ? "Choisissez la chambre" : "Choose room number"}</option>{selectedHotelRooms.map((room:any) => <option key={room.id} value={room.id}>{room.roomNumber}{room.floor ? ` · ${room.floor}` : ""}</option>)}</select></>}
              <Textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder={copy.notes} className="sm:col-span-2" />
              {manualPayments.length > 1 && <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "cash" | "bank_transfer")} className="h-10 rounded-md border px-3 sm:col-span-2"><option value="cash">{copy.cash}</option><option value="bank_transfer">{copy.transfer}</option></select>}
            </div>
          </div>
          {!user && <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
            <p className="text-sm font-black text-slate-900 dark:text-white">{lang === "ar" ? "سجّل الدخول لإكمال الطلب" : lang === "fr" ? "Connectez-vous pour terminer la commande" : "Sign in to complete your order"}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{lang === "ar" ? "لن تغادر السلة ولن تفقد الأصناف أو نوع الطلب المختار." : lang === "fr" ? "Vous resterez dans le panier sans perdre vos articles ni le type de commande." : "You will stay in the cart without losing items or your selected order type."}</p>
            <form onSubmit={(event) => { event.preventDefault(); if (loginEmail && loginPassword) inlineLogin.mutate({ email:loginEmail, password:loginPassword }); }} className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder={copy.email} dir="ltr" />
              <Input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={lang === "ar" ? "كلمة المرور" : lang === "fr" ? "Mot de passe" : "Password"} dir="ltr" />
              <Button type="submit" disabled={inlineLogin.isPending} className="h-11 font-black text-white sm:col-span-2" style={{ background:primary }}>{inlineLogin.isPending ? (lang === "ar" ? "جارٍ تسجيل الدخول..." : "Signing in...") : copy.login}</Button>
            </form>
            <div className="my-3 flex items-center gap-2"><span className="h-px flex-1 bg-orange-200/70 dark:bg-white/10" /><span className="text-[10px] font-bold text-slate-400">{lang === "ar" ? "أو" : lang === "fr" ? "ou" : "or"}</span><span className="h-px flex-1 bg-orange-200/70 dark:bg-white/10" /></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={() => { const returnTo = `/menu/${encodeURIComponent(slug)}?resumeCheckout=1`; window.location.href = `/api/oauth/google/start?returnTo=${encodeURIComponent(returnTo)}`; }} className="h-11 rounded-xl bg-white font-black text-slate-800 dark:bg-white/5 dark:text-white"><span className="me-2 grid h-5 w-5 place-items-center rounded-full border text-xs font-black text-blue-600">G</span>{lang === "ar" ? "الدخول عبر Google" : lang === "fr" ? "Continuer avec Google" : "Continue with Google"}</Button>
              <Button type="button" variant="outline" onClick={() => { try { sessionStorage.setItem(`nfood:checkout:${slug}`, JSON.stringify({ cart, cartStep, orderMode, selectedBranchId, selectedTableId, tableName, dineInPartySize, guestName, guestPhone, orderNotes, paymentMethod })); } catch {} navigate(`/customer-register?returnTo=${encodeURIComponent(`/menu/${slug}?resumeCheckout=1`)}`); }} className="h-11 rounded-xl border-orange-200 font-black text-orange-700 dark:text-orange-300">{lang === "ar" ? "تسجيل حساب جديد" : lang === "fr" ? "Créer un compte" : "Create account"}</Button>
            </div>
          </div>}
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-900"><div className="flex justify-between"><span>{copy.total}</span><b>{formatMoney(subtotal + deliveryFee, currency)}</b></div>{deliveryFee > 0 && <p className="mt-1 text-xs text-slate-500">{copy.delivery}: {formatMoney(deliveryFee, currency)}</p>}</div>
          <Button disabled={checkout.isPending || !cart.length || !isOpen || !user} onClick={submitOrder} className="mt-4 h-12 w-full rounded-2xl font-black text-white" style={{ background:primary }}>{!user ? (lang === "ar" ? "سجّل الدخول أولًا" : lang === "fr" ? "Connectez-vous d’abord" : "Sign in first") : isOpen ? copy.checkout : copy.closed}</Button>
        </> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs font-bold text-slate-500 dark:border-white/15">{lang === "ar" ? "بعد اختيار نوع الطلب تظهر لك الخطوات المطلوبة لإكماله." : lang === "fr" ? "Les étapes nécessaires apparaîtront après votre choix." : "The required checkout steps will appear after you choose an order type."}</div>}
        </>}
      </DialogContent>
    </Dialog>

    <Dialog open={reservationOpen} onOpenChange={(open) => { setReservationOpen(open); if (!open) setReservationStep(1); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-xl overflow-y-auto rounded-[26px]">
        <DialogHeader><DialogTitle>{copy.reservation} · {reservationStep}/2</DialogTitle><DialogDescription>{reservationStep === 1 ? (lang === "ar" ? "اختر حجزًا مسبقًا أو انتظار الآن" : "Choose advance booking or wait now") : `${copy.name} · ${copy.phone}`}</DialogDescription></DialogHeader>
        {reservationStep === 1 ? <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <button type="button" onClick={() => setReservationKind("reservation")} className={`rounded-2xl border p-3 text-start transition ${reservationKind === "reservation" ? "border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100" : "border-slate-200 dark:border-white/10"}`}><span className="block text-sm font-black">{lang === "ar" ? "حجز مسبق" : "Advance booking"}</span><span className="mt-1 block text-[11px] opacity-70">{lang === "ar" ? "سأزور المطعم لاحقًا" : "I will visit later"}</span></button>
            <button type="button" onClick={() => { setReservationKind("waitlist"); setReservationDate(""); setReservationSlotId(undefined); }} className={`rounded-2xl border p-3 text-start transition ${reservationKind === "waitlist" ? "border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100" : "border-slate-200 dark:border-white/10"}`}><span className="block text-sm font-black">{lang === "ar" ? "انتظار الآن" : "Wait now"}</span><span className="mt-1 block text-[11px] opacity-70">{lang === "ar" ? "أنا موجود في المطعم الآن" : "I am at the restaurant now"}</span></button>
          </div>
          {reservationKind === "reservation" ? <><label className="grid gap-1 text-xs font-bold"><span>{lang === "ar" ? "التاريخ والوقت (ميلادي)" : lang === "fr" ? "Date et heure (grégorien)" : "Date & time (Gregorian)"}</span><input type="datetime-local" lang="en-US" dir="ltr" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)} value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-left font-sans text-sm tabular-nums text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white" /></label>
          {reservationSlots.isLoading ? <div className="grid h-10 place-items-center rounded-xl border border-slate-200 text-xs text-slate-500">{lang === "ar" ? "جارٍ تحميل أوقات الحجز..." : "Loading reservation times..."}</div> : reservationSlots.data?.length ? <select aria-label="Reservation window" value={reservationSlotId ?? ""} onChange={(e) => setReservationSlotId(Number(e.target.value) || undefined)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="">{lang === "ar" ? "اختر فترة الحجز" : "Choose reservation window"}</option>{reservationSlots.data.map((slot:any) => <option key={slot.id} value={slot.id}>{`${slot.startTime} – ${slot.endTime}`}</option>)}</select> : <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">{lang === "ar" ? "لا توجد فترة حجز متاحة لهذا الفرع." : "No reservation window is available."}</div>}</> : <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">{lang === "ar" ? "سيتم تسجيل وقت وصولك الآن تلقائيًا. لا تحتاج لاختيار تاريخ أو وقت، وسيتم تخصيص أول طاولة مناسبة عند توفرها." : "Your arrival time is recorded now. The first suitable available table will be assigned."}</div>}
          <label className="grid gap-1 sm:col-span-2"><span className="text-[11px] font-bold text-slate-500">{reservationKind === "waitlist" ? (lang === "ar" ? "تفضيل الجلسة (اختياري)" : "Seating preference (optional)") : copy.section}</span><select value={seatingSectionId ?? ""} onChange={(e) => setSeatingSectionId(Number(e.target.value) || undefined)} className="h-12 rounded-xl border px-3"><option value="">{reservationKind === "waitlist" ? (lang === "ar" ? "أي جلسة متاحة — الأسرع" : "Any available — fastest") : copy.section}</option>{seatingSections.filter((section) => !selectedBranchId || section.branchId === selectedBranchId).map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></label>
          <label className="grid gap-1"><span className="text-[11px] font-bold text-slate-500">{lang === "ar" ? "عدد الأشخاص" : "Party size"}</span><Input type="number" min={1} max={50} value={reservationPartySize} onChange={(e) => setReservationPartySize(Math.max(1,Number(e.target.value)||1))} placeholder={copy.party} /></label>
          <label className="grid gap-1"><span className="text-[11px] font-bold text-slate-500">{lang === "ar" ? "الأطفال (اختياري)" : "Children (optional)"}</span><Input type="number" min={0} max={20} value={reservationChildrenCount} onChange={(e) => setReservationChildrenCount(Math.max(0,Number(e.target.value)||0))} placeholder={copy.children} /></label>
        </div> : <div className="grid gap-3">
          <Input value={reservationName} onChange={(e) => setReservationName(e.target.value)} placeholder={copy.name} />
          {reservationKind === "reservation" ? <Input value={reservationEmail} onChange={(e) => setReservationEmail(e.target.value)} placeholder={copy.email} dir="ltr" /> : <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs leading-5 text-orange-950 dark:bg-orange-500/10 dark:text-orange-100"><b className="block">{lang === "ar" ? "باقي خطوة سريعة ✨" : "One quick step ✨"}</b>{lang === "ar" ? "اكتب اسمك ورقم جوالك لنخبرك فور جاهزية طاولتك. يمكنك بعدها متابعة المنيو براحتك." : "Add your name and mobile so we can tell you when your table is ready."}</div>}
          <label className="grid gap-1 text-xs font-bold"><span>{copy.phone} *</span><Input value={reservationPhone} onChange={(e) => setReservationPhone(e.target.value)} placeholder={lang === "ar" ? "مثال: 05xxxxxxxx" : copy.phone} inputMode="tel" autoComplete="tel" dir="ltr" /></label>
          {reservationKind === "reservation" && Number((restaurant as any)?.reservationDepositAmount ?? 0) > 0 && (restaurant as any)?.reservationDepositEnabled ? <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900"><strong>{lang === "ar" ? "رسوم / عربون الحجز" : "Reservation deposit"}: {formatMoney(Number((restaurant as any).reservationDepositAmount), restaurant.currencyCode ?? "SAR")}</strong></div> : null}
          <label className="flex items-start gap-2 rounded-xl border p-3 text-xs"><input type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} className="mt-0.5" /><span>{copy.policy}</span></label>
        </div>}
        <div className="mt-4 flex gap-2">{reservationStep === 2 && <Button variant="outline" onClick={() => setReservationStep(1)} className="flex-1">{copy.back}</Button>}<Button onClick={submitReservation} disabled={reservation.isPending} className="flex-1 text-white" style={{ background:primary }}>{reservationStep === 1 ? copy.next : reservationKind === "waitlist" ? (lang === "ar" ? "انضم للانتظار" : "Join waitlist") : copy.confirm}</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={waiterOpen} onOpenChange={(open) => { setWaiterOpen(open); if (!open) setWaiterStep(1); }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-md overflow-y-auto rounded-[26px]">
        <DialogHeader><DialogTitle>{copy.waiter} · {waiterStep}/2</DialogTitle><DialogDescription>{waiterStep === 1 ? `${selectedBranch?.name || copy.branch} · ${copy.table}` : `${copy.table}: ${waiterTable} · ${waiterReason}`}</DialogDescription></DialogHeader>
        {waiterStep === 1 ? <div className="grid gap-3"><Input value={waiterTable} onChange={(e) => setWaiterTable(e.target.value)} placeholder={copy.table} /><select value={waiterReason} onChange={(e) => setWaiterReason(e.target.value as typeof waiterReason)} className="h-10 rounded-md border px-3"><option value="المساعدة">{lang === "ar" ? "مساعدة" : "Help"}</option><option value="الطلب">{lang === "ar" ? "الطلب" : "Order"}</option><option value="الحساب">{lang === "ar" ? "الحساب" : "Account"}</option><option value="الفاتورة">{lang === "ar" ? "الفاتورة" : "Bill"}</option><option value="أخرى">{lang === "ar" ? "أخرى" : "Other"}</option></select><Button disabled={!restaurant.waiterCallEnabled || !selectedBranchId || !waiterTable.trim()} onClick={() => setWaiterStep(2)} className="mt-2 text-white" style={{ background:primary }}>{copy.next}</Button></div> : <div className="grid gap-3"><Input value={waiterName} onChange={(e) => setWaiterName(e.target.value)} placeholder={copy.name} /><Button variant="outline" onClick={() => setWaiterStep(1)}>{copy.back}</Button>
        <Button disabled={!restaurant.waiterCallEnabled || !selectedBranchId || !waiterTable.trim() || notifyWaiter.isPending} onClick={() => selectedBranchId && notifyWaiter.mutate({ slug, branchId:selectedBranchId, tableName:waiterTable.trim(), reason:waiterReason, customerName:waiterName.trim() || undefined })} className="mt-4 w-full text-white" style={{ background:primary }}>{copy.send}</Button></div>}
      </DialogContent>
    </Dialog>
  </main>;
}
