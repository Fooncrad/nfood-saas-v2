import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, ShieldAlert, Users, Settings, Languages,
  FolderOpen, TrendingUp, ShieldCheck, HeartPulse, Search,
  Bell, Sun, Moon, Globe, ArrowUpRight, ArrowDownRight, Plus,
  UserCheck, X, FileText, Menu, CheckCircle2, Apple, ShoppingCart,
  Shirt, Car, Scissors, HardHat, Eye, ToggleLeft, ToggleRight,
  ArrowUpCircle, ExternalLink, Waves, Sparkles, HardDrive, Camera, LockKeyhole,
  Cookie, Megaphone, Send, Pencil, Store,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const translations = {
  ar: {
    dir: 'rtl', projectName: 'NFOOD', panelTitle: 'لوحة الإدارة العليا', panelSubtitle: 'إدارة المطاعم والمتاجر والاشتراكات والعمليات من مركز واحد', systemReady: 'النظام حي ومستقر', searchPlaceholder: 'ابحث عن منشأة، طلب، عميل... (Ctrl + K)', adminCenter: 'مركز التحكم', adminBadge: 'بوابة التحكم العليا',
    nav_overview: 'نظرة عامة والعمليات', nav_superAdmin: 'Super Admin', nav_admin: 'الإدارة المركزية', nav_accounts: 'إدارة الحسابات والأدوار', nav_settings: 'الإعدادات العامة', settingsGroup: 'الإعدادات والتخصيص', nav_languages: 'اللغة والترجمة', nav_files: 'مكتبة الملفات المركزية', nav_trend: 'سوق NFOOD / Trend Kitchen', nav_security: 'أمان الحساب والجلسات', nav_health: 'صحة النظام والـ Logs',
    nav_future_modules: 'حوكمة القطاعات والوحدات الشاملة (8 وحدات)', nav_veg: 'وحدة الخضار والفواكه', nav_grocery: 'وحدة البقالات والتموينات', nav_laundry: 'وحدة مغاسل الملابس', nav_auto: 'وحدة خدمات السيارات', nav_barber: 'وحدة الصالونات ومراكز التجميل', nav_public: 'وحدة الأشغال العامة والصيانة', nav_fashion: 'وحدة الموضة والأزياء والملبوسات', nav_sweets: 'وحدة الحلويات والمخبوزات والتحلية',
    nav_sectors: 'حوكمة القطاعات',
    sectors_title: 'لوحة حوكمة القطاعات الشاملة', sectors_subtitle: 'تعديل تسميات القطاعات، التفعيل والإيقاف، والتبليغ الجماعي أو المستهدف للمنشآت والعملاء', sector_status_active: 'مفعّل', sector_status_inactive: 'موقوف', sector_entities: 'منشأة', sector_restaurants: 'مطاعم',
    btn_edit_labels: 'تعديل التسمية', btn_activate: 'تفعيل', btn_deactivate: 'إيقاف', btn_broadcast: 'رسالة جماعية', btn_notify: 'إرسال تنبيه', btn_save: 'حفظ', btn_cancel: 'إلغاء', btn_close: 'إغلاق',
    notify_modal_title: 'إرسال إشعار إلى القطاع', notify_broadcast_all: 'إرسال للقطاع كاملاً', notify_targeted: 'إرسال لمنشآت محددة', notify_title_label: 'العنوان', notify_body_label: 'نص الرسالة', notify_type_label: 'نوع الإشعار', notify_select_entities: 'اختر المنشآت المستهدفة', notify_search_placeholder: 'ابحث عن منشأة...', notify_send: 'إرسال الآن', notify_sent: 'تم إرسال الإشعار', notify_failed: 'فشل إرسال الإشعار', notify_type_system: 'نظام', notify_type_message: 'رسالة', notify_type_task: 'مهمة', notify_type_payment: 'دفع', notify_selected: 'محددة',
    edit_modal_title: 'تعديل بيانات القطاع', edit_label_ar: 'التسمية بالعربية', edit_label_en: 'التسمية بالإنجليزية', edit_label_fr: 'التسمية بالفرنسية', edit_active: 'حالة التفعيل', label_updated: 'تم تحديث تسمية القطاع', label_failed: 'فشل تحديث تسمية القطاع',
    card_restaurants: 'المنشآت النشطة', card_accounts: 'الحسابات الكلية', card_subscriptions: 'الاشتراكات الفعالة', card_notifications: 'التنبيهات العاجلة', card_transfers: 'التحويلات المعلقة', card_files: 'ملفات السيرفر',
    table_title: 'منظومة حوكمة القدرات وتغيير الباقات بضغطة زر', table_subtitle: 'تنشيط وإيقاف القطاعات، تعديل الحزم الفورية، مراجعة الحسابات، ومعاينة القوائم الإلكترونية الحية',
    th_orderNum: 'المعرف الرقمي', th_customer: 'الجهة / المنشأة', th_restaurant: 'النوع / القطاع', th_status: 'الحالة التشغيلية', th_amount: 'الحزمة الحالية', th_lastUpdate: 'آخر تحديث', th_actions: 'إجراءات الحوكمة السريعة', btn_viewDetails: 'معاينة حية',
    tab_companies: 'الشركات والمتاجر', tab_creators: 'المبدعون والمصورون', th_storage: 'التخزين السحابي', badge_photographer: 'مصور', btn_seed_data: 'تجهيز بيانات تجريبية', seed_success: 'تم تجهيز بيانات المبدعين التجريبية', seed_failed: 'فشل تجهيز البيانات التجريبية', toggling_catalog: 'تبديل الكتالوج...', catalog_toggle: 'تفعيل / إيقاف الكتالوج', storage_upgrade: 'رقية المساحة', storage_locked: 'ممتلئ - الرفع مقفل', storage_locked_hint: 'المساحة ممتلئة، ارفع الحد لاستئناف الرفع',
    status_pending: 'قيد المراجعة', status_completed: 'نشط وفعال', summary_title: 'مفاتيح تنشيط القدرات والقطاعات', sum_total: 'تفعيل إضافات العملاء', sum_active: 'تفعيل تفرع المطاعم', sum_profiles: 'تفعيل قواميس الترجمة',
    btn_manageCustomers: 'تنشيط كافة الوظائف', btn_addCustomer: 'إضافة منشأة جديدة', currency: 'ريال', modal_title: 'معاينة الكتالوج الرقمي والتدقيق التشغيلي والمستندي', modal_close: 'إغلاق المعاينة', modal_tax: 'الرقم الضريبي / السجل التجاري', modal_transfer_status: 'حالة ترخيص الخدمة',
    loading: 'جارٍ تحميل البيانات الحية...', empty: 'لا توجد منشآت ضمن النطاق المحدد', plan_now: 'الأعلى', plan_upgrade: 'ترقية الحزمة الآن', toggling: 'تبديل الحالة...', upgrading: 'ترقية...', actionToggle: 'تفعيل / إيقاف', planLook: 'الحزمة الحالية',
  },
  en: {
    dir: 'ltr', projectName: 'NFOOD Ecosystem', panelTitle: 'Central & Enterprise Admin', panelSubtitle: 'Instant feature toggles, business sector activation & subscription plan upgrades', systemReady: 'System Live & Stable', searchPlaceholder: 'Search entities... (Ctrl + K)', adminCenter: 'Control Center', adminBadge: 'Master Control Gateway',
    nav_overview: 'Overview & Ops', nav_superAdmin: 'Super Admin', nav_admin: 'Central Admin', nav_accounts: 'Accounts & Roles', nav_settings: 'General Settings', settingsGroup: 'Settings & Customization', nav_languages: 'Languages & Local', nav_files: 'Central File Library', nav_trend: 'NFOOD Market / Trend Kitchen', nav_security: 'Security & Sessions', nav_health: 'System Health & Logs',
    nav_future_modules: 'Ecosystem Modules & Governance (8 Units)', nav_veg: 'Vegetables & Fruits Unit', nav_grocery: 'Grocery & Supermarkets', nav_laundry: 'Laundries Unit', nav_auto: 'Automotive Services', nav_barber: 'Beauty Salons & Barbers', nav_public: 'Public Works & Maintenance', nav_fashion: 'Fashion & Apparel Unit', nav_sweets: 'Sweets, Bakery & Desserts Unit',
    nav_sectors: 'Sector Governance',
    sectors_title: 'All-Sector Governance Board', sectors_subtitle: 'Edit sector labels, activate/deactivate modules, and broadcast or target messages to entities & customers', sector_status_active: 'Active', sector_status_inactive: 'Inactive', sector_entities: 'entities', sector_restaurants: 'restaurants',
    btn_edit_labels: 'Edit Label', btn_activate: 'Activate', btn_deactivate: 'Deactivate', btn_broadcast: 'Broadcast', btn_notify: 'Send Alert', btn_save: 'Save', btn_cancel: 'Cancel', btn_close: 'Close',
    notify_modal_title: 'Send Notification to Sector', notify_broadcast_all: 'Send to entire sector', notify_targeted: 'Send to selected entities', notify_title_label: 'Title', notify_body_label: 'Message Body', notify_type_label: 'Notification Type', notify_select_entities: 'Select targeted entities', notify_search_placeholder: 'Search entities...', notify_send: 'Send Now', notify_sent: 'Notification sent', notify_failed: 'Failed to send notification', notify_type_system: 'System', notify_type_message: 'Message', notify_type_task: 'Task', notify_type_payment: 'Payment', notify_selected: 'selected',
    edit_modal_title: 'Edit Sector Settings', edit_label_ar: 'Arabic Label', edit_label_en: 'English Label', edit_label_fr: 'French Label', edit_active: 'Activation Status', label_updated: 'Sector label updated', label_failed: 'Failed to update sector label',
    card_restaurants: 'Active Entities', card_accounts: 'Total Accounts', card_subscriptions: 'Active Licenses', card_notifications: 'Urgent Alerts', card_transfers: 'Pending Transfers', card_files: 'Server Storage',
    table_title: 'Ecosystem Control & Plan Upgrade Panel', table_subtitle: 'Activate/deactivate business modules, switch tier plans instantly, audit billing, and preview digital menus',
    th_orderNum: 'Entity ID', th_customer: 'Entity / Client', th_restaurant: 'Type / Sector', th_status: 'Operational Status', th_amount: 'Current Plan', th_lastUpdate: 'Last Update', th_actions: 'Governance Actions', btn_viewDetails: 'Preview Live Menu',
    tab_companies: 'Companies & Stores', tab_creators: 'Creators & Photographers', th_storage: 'Cloud Storage', badge_photographer: 'Photographer', btn_seed_data: 'Seed Demo Data', seed_success: 'Demo creator data seeded', seed_failed: 'Failed to seed demo data', toggling_catalog: 'Toggling catalog...', catalog_toggle: 'Toggle Catalog', storage_upgrade: 'Upgrade Storage', storage_locked: 'Full - Upload Locked', storage_locked_hint: 'Storage is full, raise the limit to resume uploading',
    status_pending: 'Pending Review', status_completed: 'Active & Enabled', summary_title: 'Feature Flags & Master Toggles', sum_total: 'Enable Customer Addons', sum_active: 'Enable Multi-Branching', sum_profiles: 'Enable Transliteration',
    btn_manageCustomers: 'Activate All Capabilities', btn_addCustomer: 'Add New Entity', currency: 'SAR', modal_title: 'Menu Preview & Compliance Audit', modal_close: 'Close Preview', modal_tax: 'Tax ID / Commercial Registry', modal_transfer_status: 'Service Licensing Status',
    loading: 'Loading live data...', empty: 'No entities in the current scope', plan_now: 'Top', plan_upgrade: 'Upgrade Plan Now', toggling: 'Toggling status...', upgrading: 'Upgrading...', actionToggle: 'Toggle Status', planLook: 'Current Plan',
  },
  fr: {
    dir: 'ltr', projectName: 'Écosystème NFOOD', panelTitle: 'Admin Central & Entreprise', panelSubtitle: 'Activation instantanée des fonctionnalités, des secteurs et mise à niveau des forfaits', systemReady: 'Système En Ligne', searchPlaceholder: 'Rechercher des entités... (Ctrl + K)', adminCenter: 'Centre de Contrôle', adminBadge: 'Passerelle de Contrôle Maître',
    nav_overview: 'Vue d\'ensemble', nav_superAdmin: 'Super Admin', nav_admin: 'Admin Central', nav_accounts: 'Comptes & Rôles', nav_settings: 'Paramètres Généraux', settingsGroup: 'Paramètres & Personnalisation', nav_languages: 'Langues & Dictionnaire', nav_files: 'Bibliothèque Centrale', nav_trend: 'Marché NFOOD / Trend Kitchen', nav_security: 'Sécurité & Sessions', nav_health: 'Santé du Système & Logs',
    nav_future_modules: 'Modules Écosystème & Gouvernance (8 Unités)', nav_veg: 'Secteur Fruits & Légumes', nav_grocery: 'Épiceries & Supermarchés', nav_laundry: 'Secteur Blanchisserie', nav_auto: 'Services Automobiles', nav_barber: 'Salons de Beauté & Coiffure', nav_public: 'Travaux Publics & Maintenance', nav_fashion: 'Secteur de la Mode', nav_sweets: 'Secteur Douceurs & Boulangerie',
    nav_sectors: 'Gouvernance des Secteurs',
    sectors_title: 'Tableau de Gouvernance des Secteurs', sectors_subtitle: 'Modifier les libellés, activer/désactiver les modules et diffuser des messages ciblés aux entités & clients', sector_status_active: 'Actif', sector_status_inactive: 'Inactif', sector_entities: 'entités', sector_restaurants: 'restaurants',
    btn_edit_labels: 'Modifier le Libellé', btn_activate: 'Activer', btn_deactivate: 'Désactiver', btn_broadcast: 'Diffuser', btn_notify: 'Envoyer une Alerte', btn_save: 'Enregistrer', btn_cancel: 'Annuler', btn_close: 'Fermer',
    notify_modal_title: 'Envoyer une Notification au Secteur', notify_broadcast_all: 'Envoyer à tout le secteur', notify_targeted: 'Envoyer aux entités sélectionnées', notify_title_label: 'Titre', notify_body_label: 'Corps du Message', notify_type_label: 'Type de Notification', notify_select_entities: 'Sélectionner les entités ciblées', notify_search_placeholder: 'Rechercher des entités...', notify_send: 'Envoyer', notify_sent: 'Notification envoyée', notify_failed: 'Échec de l\'envoi', notify_type_system: 'Système', notify_type_message: 'Message', notify_type_task: 'Tâche', notify_type_payment: 'Paiement', notify_selected: 'selectionnés',
    edit_modal_title: 'Modifier les Paramètres du Secteur', edit_label_ar: 'Libellé Arabe', edit_label_en: 'Libellé Anglais', edit_label_fr: 'Libellé Français', edit_active: 'Statut d\'Activation', label_updated: 'Libellé du secteur mis à jour', label_failed: 'Échec de mise à jour du libellé',
    card_restaurants: 'Entités Actives', card_accounts: 'Comptes Totaux', card_subscriptions: 'Licences Actives', card_notifications: 'Alertes Urgentes', card_transfers: 'Transferts En Attente', card_files: 'Stockage Serveur',
    tab_orders: 'Commandes & Opérations', tab_customers: 'Intégration Clients', tab_purchases: 'Restaurants & Abonnements', tab_shipping: 'Livraison & Cartes NFC', table_title: 'Gestion des Capacités & Forfaits en 1-Clic', table_subtitle: 'Activer/désactiver les modules, changer de forfait instantanément et prévisualiser les catalogues',
    th_orderNum: 'ID Entité', th_customer: 'Entité / Client', th_restaurant: 'Type / Secteur', th_status: 'Statut Opérationnel', th_amount: 'Forfait Actuel', th_lastUpdate: 'Dernière Mise à Jour', th_actions: 'Actions de Gouvernance', btn_viewDetails: 'Aperçu Menu',
    tab_companies: 'Entreprises & Magasins', tab_creators: 'Créateurs & Photographes', th_storage: 'Stockage Cloud', badge_photographer: 'Photographe', btn_seed_data: 'Générer Données Démo', seed_success: 'Données des créateurs générées', seed_failed: 'Échec de la génération', toggling_catalog: 'Bascule du catalogue...', catalog_toggle: 'Basculer le Catalogue', storage_upgrade: 'Augmenter le Stockage', storage_locked: 'Plein - Dépôt Bloqué', storage_locked_hint: 'Stockage plein, augmentez la limite pour reprendre',
    status_pending: 'En Révision', status_completed: 'Actif & Activé', summary_title: 'Flags de Fonctionnalités', sum_total: 'Activer Addons Clients', sum_active: 'Activer Multi-Branches', sum_profiles: 'Activer Traduction Automatique',
    btn_manageCustomers: 'Activer Toutes les Fonctions', btn_addCustomer: 'Ajouter une Entité', currency: 'EUR', modal_title: 'Aperçu du Menu & Audit de Conformité', modal_close: 'Fermer l\'Aperçu', modal_tax: 'ID Fiscal / Registre du Commerce', modal_transfer_status: 'Statut de Licence de Service',
    loading: 'Chargement des données en direct...', empty: 'Aucune entité dans ce périmètre', plan_now: 'Top', plan_upgrade: 'Mettre à Niveau le Forfait', toggling: 'Bascule du statut...', upgrading: 'Mise à niveau...', actionToggle: 'Basculer le Statut', planLook: 'Forfait Actuel',
  },
};

type Language = 'ar' | 'en' | 'fr';
type NavSection = 'overview' | 'admin' | 'accounts' | 'settings' | 'languages' | 'files' | 'trend' | 'security' | 'health' | 'sectors' | 'veg' | 'grocery' | 'laundry' | 'auto' | 'barber' | 'public' | 'fashion' | 'sweets';
type OrderType = { id: string; customer: string; email: string; restaurant: string; status: boolean; plan: 'Basic' | 'Pro' | 'Enterprise'; date: string; taxId: string; isFreelancer: boolean; isPhotographer: boolean; catalogEnabled: boolean; storageUsed: number; storageLimit: number; catalog?: { totalItems: number; isPublic: boolean; catalogUrl: string | null; catalogEnabled: boolean; isFreelancer: boolean; isPhotographer: boolean; storageUsed: number; storageLimit: number } | null };

const SECTOR_LABELS: Record<Language, Record<string, string>> = {
  ar: { restaurant: 'مطاعم', vegetables: 'خضار وفواكه', grocery: 'بقالات', laundry: 'مغاسل', automotive: 'سيارات', beauty_salon: 'صالونات', public_works: 'أشغال عامة', fashion: 'موضة', sweets: 'حلويات ومخبوزات' },
  en: { restaurant: 'Restaurants', vegetables: 'Vegetables & Fruits', grocery: 'Grocery', laundry: 'Laundries', automotive: 'Automotive', beauty_salon: 'Beauty Salons', public_works: 'Public Works', fashion: 'Fashion', sweets: 'Sweets & Bakery' },
  fr: { restaurant: 'Restaurants', vegetables: 'Fruits & Légumes', grocery: 'Épicerie', laundry: 'Blanchisserie', automotive: 'Automobile', beauty_salon: 'Salons de Beauté', public_works: 'Travaux Publics', fashion: 'Mode', sweets: 'Douceurs & Boulangerie' },
};

const SECTOR_NAV: { key: NavSection; icon: typeof Apple; label: (t: typeof translations['ar']) => string }[] = [
  { key: 'veg', icon: Apple, label: (t) => t.nav_veg },
  { key: 'grocery', icon: ShoppingCart, label: (t) => t.nav_grocery },
  { key: 'laundry', icon: Waves, label: (t) => t.nav_laundry },
  { key: 'auto', icon: Car, label: (t) => t.nav_auto },
  { key: 'barber', icon: Scissors, label: (t) => t.nav_barber },
  { key: 'public', icon: HardHat, label: (t) => t.nav_public },
  { key: 'fashion', icon: Shirt, label: (t) => t.nav_fashion },
  { key: 'sweets', icon: Cookie, label: (t) => t.nav_sweets },
];

const ALL_SECTORS = new Set<NavSection>(['veg', 'grocery', 'laundry', 'auto', 'barber', 'public', 'fashion', 'sweets']);

type SectorGovernance = {
  key: string;
  alias: string;
  labelAr: string;
  labelEn: string;
  labelFr: string;
  active: boolean;
  entityCount: number;
  coverUrl: string;
  source: 'platformEntity' | 'contentCreators';
};

function SidebarLink({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-gradient-to-l from-orange-500/20 to-amber-500/10 text-orange-300 ring-1 ring-orange-500/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
      <span className={`${active ? 'text-orange-400' : ''} shrink-0`}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function SectionGroupLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</div>;
}

export function CentralAdminDashboard({ onToggleTheme, currentTheme, embedded = false }: { onToggleTheme?: () => void, currentTheme: string, embedded?: boolean }) {
  const dark = currentTheme === 'dark';
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('nfood-lang') as Language) || 'ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<NavSection>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orders' | 'freelancers'>('orders');
  const [features, setFeatures] = useState({ customers: true, restaurants: true, translations: false });
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Pro' | 'Enterprise'>('Basic');
  const [upgradeMenuId, setUpgradeMenuId] = useState<string | null>(null);

  const t = translations[lang];

  const { data: liveData, isLoading, refetch } = trpc.admin.getPlatformEntities.useQuery(
    { sector: currentSection, search: searchQuery, filterTab: activeTab }
  );

  const toggleStatusMutation = trpc.admin.toggleEntityStatus.useMutation({
    onSuccess: () => { toast.success(lang === 'ar' ? 'تم تحديث حالة تفعيل المنشأة بنجاح' : lang === 'en' ? 'Entity status updated successfully' : 'Statut de l\'entité mis à jour'); refetch(); },
    onError: () => toast.error(lang === 'ar' ? 'فشل تعديل حالة المنشأة' : lang === 'en' ? 'Failed to update entity status' : 'Échec de la mise à jour du statut'),
  });

  const upgradePlanMutation = trpc.admin.upgradeEntityPlan.useMutation({
    onSuccess: (data) => { toast.success(lang === 'ar' ? `تم تبديل الحزمة بنجاح إلى ${data.nextPlan}` : lang === 'en' ? `Plan switched to ${data.nextPlan}` : `Forfait passé à ${data.nextPlan}`); refetch(); },
    onError: () => toast.error(lang === 'ar' ? 'فشل ترقية باقة المنشأة' : lang === 'en' ? 'Failed to upgrade plan' : 'Échec de la mise à niveau du forfait'),
  });

  const toggleCatalogMutation = trpc.admin.toggleFreelancerCatalog.useMutation({
    onSuccess: () => { toast.success(lang === 'ar' ? 'تم تحديث حالة كتالوج المبدع بنجاح' : lang === 'en' ? 'Creator catalog updated' : 'Catalogue du créateur mis à jour'); refetch(); },
    onError: () => toast.error(lang === 'ar' ? 'فشل تحديث حالة كتالوج المبدع' : lang === 'en' ? 'Failed to update creator catalog' : 'Échec de mise à jour du catalogue'),
  });

  const upgradeStorageMutation = trpc.admin.upgradeStorageLimit.useMutation({
    onSuccess: (data) => { toast.success(lang === 'ar' ? `تمت ترقية مساحة التخزين إلى ${data.nextLimitMb} MB برسوم ${data.fee} ريال — الفاتورة ${data.invoiceNumber}` : lang === 'en' ? `Storage upgraded to ${data.nextLimitMb} MB · Fee ${data.fee} SAR — Invoice ${data.invoiceNumber}` : `Stockage passé à ${data.nextLimitMb} Mo · Frais ${data.fee} SAR — Facture ${data.invoiceNumber}`); setUpgradeMenuId(null); refetch(); },
    onError: () => toast.error(lang === 'ar' ? 'فشلت ترقية مساحة التخزين (راجع الحد المطلوب)' : lang === 'en' ? 'Storage upgrade failed (check requested limit)' : 'Échec de l\'augmentation du stockage (vérifiez la limite)'),
  });

  const sectorCatalogQuery = trpc.admin.sectorCatalog.useQuery();
  const sectors: SectorGovernance[] = sectorCatalogQuery.data?.sectors ?? [];

  const [editSectorKey, setEditSectorKey] = useState<string | null>(null);
  const [editLabels, setEditLabels] = useState({ labelAr: '', labelEn: '', labelFr: '' });
  const [editActive, setEditActive] = useState(true);
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const platformImagesQuery = trpc.media.list.useQuery({ scope: "platform", category: "image" }, { enabled: coverPickerOpen, retry: false });
  const uploadSectorCover = trpc.media.upload.useMutation();

  const updateSectorMutation = trpc.admin.updateSectorMeta.useMutation({
    onSuccess: () => { toast.success(t.label_updated); sectorCatalogQuery.refetch(); setEditSectorKey(null); },
    onError: () => toast.error(t.label_failed),
  });

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyTargetSector, setNotifyTargetSector] = useState<SectorGovernance | null>(null);
  const [notifyMode, setNotifyMode] = useState<'broadcast' | 'targeted'>('broadcast');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifyType, setNotifyType] = useState<'system' | 'message' | 'task' | 'payment'>('system');
  const [notifySelectedIds, setNotifySelectedIds] = useState<string[]>([]);
  const [notifyEntitySearch, setNotifyEntitySearch] = useState('');

  const notifyEntityQuery = trpc.admin.getPlatformEntities.useQuery(
    { sector: notifyTargetSector?.alias ?? notifyTargetSector?.key, search: notifyEntitySearch, filterTab: 'orders' },
    { enabled: notifyOpen && notifyMode === 'targeted' && !!notifyTargetSector && notifyTargetSector.source === 'platformEntity' },
  );

  const notifySectorMutation = trpc.admin.notifySector.useMutation({
    onSuccess: (data) => { toast.success(t.notify_sent + ` (${data.notified} ${lang === 'ar' ? 'منشأة' : t.sector_entities})`); setNotifyOpen(false); setNotifyTitle(''); setNotifyBody(''); setNotifySelectedIds([]); },
    onError: () => toast.error(t.notify_failed),
  });

  const notifyEntitiesMutation = trpc.admin.notifyEntities.useMutation({
    onSuccess: (data) => { toast.success(t.notify_sent + ` (${data.notified} ${lang === 'ar' ? 'منشأة' : t.sector_entities})`); setNotifyOpen(false); setNotifyTitle(''); setNotifyBody(''); setNotifySelectedIds([]); },
    onError: () => toast.error(t.notify_failed),
  });

  const openNotifyModal = (sector: SectorGovernance) => { setNotifyTargetSector(sector); setNotifyMode('broadcast'); setNotifyTitle(''); setNotifyBody(''); setNotifyType('system'); setNotifySelectedIds([]); setNotifyEntitySearch(''); setNotifyOpen(true); };

  const openEditModal = (sector: SectorGovernance) => { setEditSectorKey(sector.key); setEditLabels({ labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr }); setEditActive(sector.active); setEditCoverUrl(sector.coverUrl || ''); };

  const toggleSectorActive = (sector: SectorGovernance) => {
    const fields = lang === 'ar' ? { labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr } : lang === 'en' ? { labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr } : { labelAr: sector.labelAr, labelEn: sector.labelEn, labelFr: sector.labelFr };
    updateSectorMutation.mutate({ sectorKey: sector.key, ...fields, active: !sector.active, coverUrl: sector.coverUrl || '' });
  };

  const handleNotifySubmit = () => {
    if (!notifyTargetSector || !notifyTitle.trim() || !notifyBody.trim()) return;
    if (notifyMode === 'targeted' && notifySelectedIds.length === 0) return;
    if (notifyMode === 'broadcast') {
      notifySectorMutation.mutate({ sectorKey: notifyTargetSector.alias || notifyTargetSector.key, title: notifyTitle.trim(), body: notifyBody.trim(), type: notifyType });
    } else {
      notifyEntitiesMutation.mutate({ entityIds: notifySelectedIds, title: notifyTitle.trim(), body: notifyBody.trim(), type: notifyType });
    }
  };

  const typeOptions = [
    { value: 'system' as const, label: t.notify_type_system },
    { value: 'message' as const, label: t.notify_type_message },
    { value: 'task' as const, label: t.notify_type_task },
    { value: 'payment' as const, label: t.notify_type_payment },
  ];

  const getSectorLabel = (sector: SectorGovernance) => lang === 'ar' ? sector.labelAr : lang === 'fr' ? sector.labelFr : sector.labelEn;

  useEffect(() => {
    document.documentElement.dir = t.dir;
    localStorage.setItem('nfood-lang', lang);
  }, [lang, t.dir]);

  const summary = liveData?.summary;

  const orders: OrderType[] = (liveData?.entities ?? []).map((row) => ({
    id: row.id,
    customer: row.customerName,
    email: row.email,
    restaurant: SECTOR_LABELS[lang][row.sector] ?? row.sector,
    status: row.status,
    plan: row.plan,
    date: new Date(row.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'medium', timeStyle: 'short' }),
    taxId: row.taxId,
    isFreelancer: row.catalog?.isFreelancer ?? false,
    isPhotographer: row.catalog?.isPhotographer ?? false,
    catalogEnabled: row.catalog?.catalogEnabled ?? true,
    storageUsed: row.catalog?.storageUsed ?? 0,
    storageLimit: row.catalog?.storageLimit ?? 0,
    catalog: row.catalog,
  }));

  const handleOpenModal = (order: OrderType) => {
    setSelectedOrder(order);
    setSelectedPlan(order.plan);
    setIsModalOpen(true);
  };


  const isSectorSection = ALL_SECTORS.has(currentSection);
  const showEntityTable = currentSection === 'overview' || isSectorSection;
  useEffect(() => { if (embedded) setCurrentSection('sectors'); }, [embedded]);

  const kpis = [
    { label: lang === 'ar' ? 'المطاعم النشطة' : lang === 'fr' ? 'Restaurants actifs' : 'Active restaurants', value: String(summary?.active ?? 0), detail: lang === 'ar' ? 'بيانات حية' : 'live data', icon: Store },
    { label: lang === 'ar' ? 'الإيرادات الشهرية' : lang === 'fr' ? 'Revenu mensuel' : 'Monthly revenue', value: '—', detail: lang === 'ar' ? 'غير مفحوص' : 'Not checked', icon: TrendingUp },
    { label: lang === 'ar' ? 'الطلبات اليوم' : lang === 'fr' ? 'Commandes aujourd’hui' : 'Orders today', value: '—', detail: lang === 'ar' ? 'غير مفحوص' : 'Not checked', icon: ShoppingCart },
    { label: lang === 'ar' ? 'إجمالي المتاجر' : lang === 'fr' ? 'Total magasins' : 'Total stores', value: String(summary?.total ?? 0), detail: lang === 'ar' ? 'كل المنشآت' : 'all entities', icon: Store },
    { label: lang === 'ar' ? 'إجمالي المستخدمين' : lang === 'fr' ? 'Total utilisateurs' : 'Total users', value: '—', detail: lang === 'ar' ? 'غير مفحوص' : 'Not checked', icon: Users },
  ];

  const planCls: Record<'Basic' | 'Pro' | 'Enterprise', string> = {
    Basic: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    Pro: 'bg-violet-50 text-violet-600 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30',
    Enterprise: 'bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30',
  };

  if (embedded) {
    return (
      <div className="space-y-5 p-1">
        {currentSection === 'sectors' ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black">{t.sectors_title}</h2>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{t.sectors_subtitle}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30">
                      <Store size={12} />
                      {sectors.length} {lang === 'ar' ? 'قطاعات' : lang === 'en' ? 'Sectors' : 'Secteurs'}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {sectors.map((sector) => {
                    const NavIcon = sector.key === 'trend' ? Sparkles : (SECTOR_NAV.find((n) => n.key === (sector.alias || sector.key))?.icon ?? ShieldAlert);
                    const label = getSectorLabel(sector);
                    const isTrend = sector.source === 'contentCreators';
                    return (
                      <div key={sector.key} className={`flex min-h-[330px] flex-col overflow-hidden rounded-2xl border shadow-sm transition ${sector.active ? 'border-slate-200 bg-white dark:border-slate-700/60 dark:bg-[#1e293b]' : 'border-dashed border-slate-300 bg-slate-50/60 opacity-75 dark:border-slate-700 dark:bg-[#1e293b]/60'}`}>
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                          {sector.coverUrl ? <img src={sector.coverUrl} alt={label} className="h-full w-full object-cover object-center" /> : <div className="flex h-full items-center justify-center text-slate-400"><NavIcon size={42} /></div>}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sector.active ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                              <NavIcon size={20} />
                            </span>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">{sector.entityCount} {sector.entityCount === 1 ? t.sector_entities : t.sector_entities}</p>
                            </div>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-black ring-1 ${sector.active ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'}`}>
                            {sector.active ? t.sector_status_active : t.sector_status_inactive}
                          </span>
                        </div>
                        {isTrend && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30">
                            <Sparkles size={9} />
                            {lang === 'ar' ? 'سوق المبدعين' : lang === 'en' ? 'Creators Marketplace' : 'Marché des Créateurs'}
                          </span>
                        )}
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => openEditModal(sector)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
                            <Pencil size={11} />{t.btn_edit_labels}
                          </button>
                          <button type="button" onClick={() => openNotifyModal(sector)} disabled={notifySectorMutation.isPending || notifyEntitiesMutation.isPending} className="flex cursor-pointer items-center gap-1 rounded-lg bg-orange-50 px-2 py-1.5 text-[10px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                            <Megaphone size={11} />{t.btn_notify}
                          </button>
                          {!isTrend && (
                            <button type="button" onClick={() => toggleSectorActive(sector)} disabled={updateSectorMutation.isPending} className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black ring-1 ring-inset transition disabled:opacity-50 ${sector.active ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}>
                              {sector.active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                              {sector.active ? t.btn_deactivate : t.btn_activate}
                            </button>
                          )}
                        </div>
                        {!sector.active && !isTrend && <p className="text-[9px] text-slate-400 dark:text-slate-500">{lang === 'ar' ? 'القطاع موقوف — لا يستقبل طلبات جديدة' : lang === 'en' ? 'Sector inactive — not accepting new orders' : 'Secteur inactif — n\'accepte pas les nouvelles commandes'}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : showEntityTable ? (
              <>
                {isSectorSection && (() => {
                  const sec = sectors.find((s) => (s.alias === currentSection || s.key === currentSection) && s.source === 'platformEntity');
                  if (!sec) return null;
                  const label = getSectorLabel(sec);
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${sec.active ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'}`}>
                          {sec.active ? t.sector_status_active : t.sector_status_inactive}
                        </span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                        <span className="text-[10px] text-slate-400">{sec.entityCount} {t.sector_entities}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => openEditModal(sec)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
                          <Pencil size={12} />{t.btn_edit_labels}
                        </button>
                        <button type="button" onClick={() => openNotifyModal(sec)} disabled={notifySectorMutation.isPending || notifyEntitiesMutation.isPending} className="flex cursor-pointer items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[11px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                          <Megaphone size={12} />{t.btn_broadcast}
                        </button>
                        <button type="button" onClick={() => toggleSectorActive(sec)} disabled={updateSectorMutation.isPending} className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${sec.active ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}>
                          {sec.active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                          {sec.active ? t.btn_deactivate : t.btn_activate}
                        </button>
                      </div>
                    </div>
                  );
                })()}
                {currentSection === 'overview' && (
                  <>
                    <section className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-black">{lang === 'ar' ? 'مرحباً بعودتك 👋' : lang === 'fr' ? 'Bon retour 👋' : 'Welcome back 👋'}</h1>
                        <p className="mt-1 text-xs text-slate-400">{lang === 'ar' ? 'إليك نظرة شاملة على أداء منصتك اليوم' : 'A live overview of your platform today'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-[#0c1828] dark:text-slate-300">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </section>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {kpis.map((kpi) => { const Icon = kpi.icon; return <div key={kpi.label} className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><Icon size={19}/></span><span className="text-[10px] font-black text-emerald-400">{kpi.detail}</span></div><p className="mt-3 text-2xl font-black">{kpi.value}</p><p className="mt-1 text-[11px] text-slate-400">{kpi.label}</p></div>})}
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
                      <section className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-5">
                        <div className="flex items-center justify-between"><h2 className="text-sm font-black">{lang === 'ar' ? 'نظرة عامة على المبيعات' : 'Sales overview'}</h2><span className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400">{lang === 'ar' ? 'بيانات مباشرة فقط' : 'Live data only'}</span></div>
                        <div className="mt-4 flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#08111d] px-5 text-center text-xs text-slate-500">{lang === 'ar' ? "سيظهر الرسم البياني فور ربط مصدر الإيرادات والطلبات الموثوق — لا توجد أرقام تجريبية. الحالة الحالية: 'غير مفحوص'." : "Financial chart will appear when a trusted revenue/orders source is available — no demo figures are shown. Status: 'Not checked'."}</div>
                      </section>
                      <section className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-5">
                        <h2 className="text-sm font-black">{lang === 'ar' ? 'توزيع الفئات' : 'Category distribution'}</h2>
                        <div className="mt-5 space-y-3">{sectors.length ? sectors.slice(0, 6).map((sector) => { const total = Math.max(1, sectors.reduce((sum, item) => sum + item.entityCount, 0)); return <div key={sector.key}><div className="mb-1 flex justify-between text-[11px]"><span>{getSectorLabel(sector)}</span><span className="font-black">{sector.entityCount}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-orange-500" style={{width: `${Math.round((sector.entityCount / total) * 100)}%`}} /></div></div> }) : <div className="flex h-36 items-center justify-center text-xs text-slate-500">{lang === 'ar' ? 'لا توجد بيانات فئات متاحة' : 'No category data available'}</div>}</div>
                      </section>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {[
  [Settings, lang === 'ar' ? 'التحكم في الميزات' : 'Feature controls', lang === 'ar' ? 'إدارة صلاحيات المنصة' : 'Manage platform capabilities'],
  [ShieldCheck, lang === 'ar' ? 'باقات الاشتراك' : 'Subscription plans', lang === 'ar' ? 'إدارة الباقات والحدود' : 'Plans and entitlements'],
  [Send, lang === 'ar' ? 'قوالب الرسائل' : 'Message templates', lang === 'ar' ? 'البريد والرسائل والإشعارات' : 'Email, messages and alerts'],
  [Store, lang === 'ar' ? 'إدارة المتاجر' : 'Store management', lang === 'ar' ? 'عرض وتفعيل وتعديل' : 'View, activate and edit'],
  [Sparkles, lang === 'ar' ? 'تخصيص موقعك' : 'Site customization', lang === 'ar' ? 'الهوية والمظهر العام' : 'Brand and appearance'],
].map(([Icon,title,subtitle],index)=>{const QuickIcon=Icon as typeof Settings; return <button key={String(title)} type="button" onClick={()=>setCurrentSection(index===2?'settings':index===3?'admin':index===4?'files':index===0?'settings':'sectors')} className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 text-start transition hover:border-orange-500/60"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><QuickIcon size={19}/></span><p className="mt-3 text-sm font-black">{String(title)}</p><p className="mt-1 text-[10px] text-slate-400">{String(subtitle)}</p></button>})}
                    </div>
                  </>
                )}
                {currentSection === 'overview' && (
                  <section className="grid gap-3 rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 sm:grid-cols-5">
                    <div><p className="text-sm font-black">{lang === 'ar' ? 'الحالة النظامية' : 'System status'}</p><p className="mt-1 text-[10px] text-slate-500">{lang === 'ar' ? 'لا نعرض حالة خضراء دون فحص فعلي' : 'No healthy status is shown without a real probe'}</p></div>
                    {['API / Server','Database','Payment gateway','Messaging','Cloud storage'].map((service) => <div key={service} className="rounded-lg border border-slate-700 bg-[#08111d] px-3 py-2"><p className="text-[10px] text-slate-400">{service}</p><p className="mt-1 text-xs font-black text-amber-400">{lang === 'ar' ? 'غير مفحوص' : 'Not checked'}</p></div>)}
                  </section>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    <button type="button" onClick={() => setActiveTab('orders')} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                      <ShieldCheck size={13} />
                      {t.tab_companies}
                    </button>
                    <button type="button" onClick={() => setActiveTab('freelancers')} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${activeTab === 'freelancers' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                      <Camera size={13} />
                      {t.tab_creators}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-700/50">
                    <div>
                      <h2 className="text-base font-black">{currentSection === 'overview' ? (lang === 'ar' ? 'أحدث المتاجر والمنشآت' : lang === 'fr' ? 'Dernières entreprises' : 'Latest stores & businesses') : t.table_title}</h2>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{currentSection === 'overview' ? (lang === 'ar' ? 'أحدث البيانات الحقيقية المسجلة في المنصة' : 'Latest live records registered on the platform') : t.table_subtitle}</p>
                    </div>
                    <button type="button" onClick={() => handleOpenModal(orders[0])} disabled={!orders.length} className="flex cursor-pointer items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600 transition hover:bg-orange-100 disabled:cursor-default disabled:opacity-40 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20">
                      <ShieldCheck size={11} />
                      {t.btn_viewDetails}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 dark:bg-slate-900/40">
                          <th className="px-5 py-3 text-start">{t.th_orderNum}</th>
                          <th className="px-5 py-3 text-start">{t.th_customer}</th>
                          <th className="px-5 py-3 text-start">{t.th_restaurant}</th>
                          <th className="px-5 py-3 text-start">{t.th_status}</th>
                          <th className="px-5 py-3 text-start">{t.th_amount}</th>
                          {activeTab === 'freelancers' && <th className="px-5 py-3 text-start">{t.th_storage}</th>}
                          <th className="px-5 py-3 text-start">{t.th_lastUpdate}</th>
                          <th className="px-5 py-3 text-start">{t.th_actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={activeTab === 'freelancers' ? 8 : 7} className="px-5 py-10 text-center text-xs font-semibold text-slate-400">{t.loading}</td>
                          </tr>
                        ) : orders.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab === 'freelancers' ? 8 : 7} className="px-5 py-10 text-center text-xs font-semibold text-slate-400">{t.empty}</td>
                          </tr>
                        ) : orders.map((order) => (
                          <tr key={order.id} className="border-t border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-700/40 dark:hover:bg-slate-800/40">
                            <td className="px-5 py-4 font-mono text-xs font-bold">{order.id}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{order.customer}</p>
                                {activeTab === 'freelancers' && order.isPhotographer && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black text-violet-600 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30">
                                    <Camera size={9} />
                                    {t.badge_photographer}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-400" dir="ltr">{order.email}</p>
                            </td>
                            <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{order.restaurant}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${order.status ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30'}`}>
                                {order.status ? t.status_completed : t.status_pending}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${planCls[order.plan]}`}>{order.plan}</span>
                            </td>
                            {activeTab === 'freelancers' && (
                              <td className="px-5 py-4">
                                <div className="flex min-w-[150px] flex-col gap-1.5">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${order.catalogEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                    <HardDrive size={11} />
                                    {order.catalogEnabled ? t.status_completed : t.status_pending}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                      <div className={`h-full rounded-full ${order.storageUsed >= order.storageLimit ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} style={{ width: `${Math.min(100, Math.round((order.storageUsed / Math.max(order.storageLimit, 1)) * 100))}%` }} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400" dir="ltr">{order.storageUsed} / {order.storageLimit} MB</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setUpgradeMenuId(upgradeMenuId === order.id ? null : order.id)}
                                      disabled={upgradeStorageMutation.isPending}
                                      title={t.storage_locked_hint}
                                      className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.storageUsed >= order.storageLimit ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-orange-50 text-orange-600 ring-orange-200 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20'}`}
                                    >
                                      <ArrowUpCircle size={11} />
                                      {t.storage_upgrade}
                                    </button>
                                    {upgradeMenuId === order.id && (
                                      <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        {[2, 5, 10].map((gb) => {
                                          const targetLimitMb = order.storageLimit + gb * 1024;
                                          const fee = gb * 20;
                                          return (
                                            <button
                                              key={gb}
                                              type="button"
                                              onClick={() => upgradeStorageMutation.mutate({ entityId: order.id, targetLimitMb })}
                                              disabled={upgradeStorageMutation.isPending}
                                              className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-orange-500/10"
                                            >
                                              <span dir="ltr">+{gb} GB</span>
                                              <span className="text-orange-600 dark:text-orange-400">{fee} SAR</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  {order.storageUsed >= order.storageLimit && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 dark:text-rose-400">
                                      <LockKeyhole size={9} />
                                      {t.storage_locked}
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400" dir="ltr">{order.date}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleStatusMutation.mutate({ entityId: order.id })}
                                  disabled={toggleStatusMutation.isPending}
                                  title={t.actionToggle}
                                  className={`flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.status ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}
                                >
                                  {order.status ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                  {lang === 'ar' ? (order.status ? 'إيقاف' : 'تفعيل') : lang === 'en' ? (order.status ? 'Off' : 'On') : (order.status ? 'Off' : 'On')}
                                </button>
                                {activeTab === 'freelancers' && (
                                  <button
                                    type="button"
                                    onClick={() => toggleCatalogMutation.mutate({ entityId: order.id })}
                                    disabled={toggleCatalogMutation.isPending}
                                    title={t.catalog_toggle}
                                    className={`flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.catalogEnabled ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-violet-50 text-violet-600 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30 dark:hover:bg-violet-500/20'}`}
                                  >
                                    {order.catalogEnabled ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                    {t.catalog_toggle}
                                  </button>
                                )}
                                <button type="button" onClick={() => handleOpenModal(order)} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-50 px-2.5 py-1.5 text-[11px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                                  <Eye size={13} />
                                  {t.btn_viewDetails}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-700/50">
                    <p className="text-[11px] text-slate-400">
                      {orders.length} {t.th_actions === 'إجراءات الحوكمة السريعة' ? 'منشأة' : 'entities'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">{t.summary_title}</h3>
                      <p className="mt-1 text-[11px] text-slate-400">{t.table_subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, customers: !f.customers }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.customers ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_total}
                      </button>
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, restaurants: !f.restaurants }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.restaurants ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_active}
                      </button>
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, translations: !f.translations }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.translations ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_profiles}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-xl p-4 ${features.customers ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_total}</p>
                      <p className={`mt-1 text-xl font-black ${features.customers ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.customers ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${features.restaurants ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_active}</p>
                      <p className={`mt-1 text-xl font-black ${features.restaurants ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.restaurants ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${features.translations ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_profiles}</p>
                      <p className={`mt-1 text-xl font-black ${features.translations ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.translations ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                <ShieldAlert size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-base font-black">{t[`nav_${currentSection}`]}</p>
                <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-slate-400">{t.panelSubtitle}</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t.modal_title}</h3>
                <p className="mt-1 font-mono text-xs text-slate-400">{selectedOrder.id}</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close">
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.th_customer}</p>
                <p className="mt-1 text-sm font-bold">{selectedOrder.customer}</p>
                <p className="mt-0.5 text-[11px] text-slate-400" dir="ltr">{selectedOrder.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.th_restaurant}</p>
                <p className="mt-1 text-sm font-bold">{selectedOrder.restaurant}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.modal_tax}</p>
                <p className="mt-1 font-mono text-sm font-bold">{selectedOrder.taxId}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.modal_transfer_status}</p>
                <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${selectedOrder.status ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30'}`}>
                  {selectedOrder.status ? <CheckCircle2 size={12} /> : <X size={12} />}
                  {selectedOrder.status ? t.status_completed : t.status_pending}
                </span>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.actionToggle} · {t.planLook}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value as 'Basic' | 'Pro' | 'Enterprise')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => upgradePlanMutation.mutate({ entityId: selectedOrder.id, plan: selectedPlan })}
                    disabled={upgradePlanMutation.isPending || selectedPlan === selectedOrder.plan}
                    className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50"
                  >
                    <ArrowUpCircle size={13} />
                    {upgradePlanMutation.isPending ? t.upgrading : t.plan_upgrade}
                  </button>
                  {selectedOrder.catalog && selectedOrder.catalog.catalogUrl && (
                    <a href={selectedOrder.catalog.catalogUrl.startsWith('http') ? selectedOrder.catalog.catalogUrl : `https://${selectedOrder.catalog.catalogUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <ExternalLink size={13} />
                      {t.btn_viewDetails}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setIsModalOpen(false)} className="mt-5 w-full rounded-xl bg-[#0f172a] py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:text-slate-900 dark:hover:bg-orange-600">
              {t.modal_close}
            </button>
          </div>
        </div>
      )}

      {editSectorKey && (() => {
        const sec = sectors.find((s) => s.key === editSectorKey);
        if (!sec) return null;
        return (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setEditSectorKey(null)}>
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black">{t.edit_modal_title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{getSectorLabel(sec)}</p>
                </div>
                <button type="button" onClick={() => setEditSectorKey(null)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close"><X size={17} /></button>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_ar}</span>
                  <input dir="rtl" value={editLabels.labelAr} onChange={(e) => setEditLabels((p) => ({ ...p, labelAr: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_en}</span>
                  <input dir="ltr" value={editLabels.labelEn} onChange={(e) => setEditLabels((p) => ({ ...p, labelEn: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_fr}</span>
                  <input dir="ltr" value={editLabels.labelFr} onChange={(e) => setEditLabels((p) => ({ ...p, labelFr: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                {sec.source !== 'contentCreators' && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <button type="button" onClick={() => setEditActive(!editActive)} className={`flex cursor-pointer items-center gap-2 text-[11px] font-black ${editActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {editActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {editActive ? t.sector_status_active : t.sector_status_inactive}
                    </button>
                    <span className="text-[10px] text-slate-400">{t.edit_active}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <button type="button" onClick={() => updateSectorMutation.mutate({ sectorKey: editSectorKey, ...editLabels, active: sec.source === 'contentCreators' ? sec.active : editActive })} disabled={updateSectorMutation.isPending || !editLabels.labelAr.trim() || !editLabels.labelEn.trim() || !editLabels.labelFr.trim()} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50">
                  <CheckCircle2 size={15} />
                  {updateSectorMutation.isPending ? t.loading : t.btn_save}
                </button>
                <button type="button" onClick={() => setEditSectorKey(null)} className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  {t.btn_cancel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {notifyOpen && notifyTargetSector && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setNotifyOpen(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t.notify_modal_title}</h3>
                <p className="mt-1 text-xs text-slate-400">{getSectorLabel(notifyTargetSector)}</p>
              </div>
              <button type="button" onClick={() => setNotifyOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close"><X size={17} /></button>
            </div>

            {notifyTargetSector.source === 'platformEntity' && (
              <div className="mt-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button type="button" onClick={() => { setNotifyMode('broadcast'); setNotifySelectedIds([]); }} className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-[11px] font-black transition ${notifyMode === 'broadcast' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {t.notify_broadcast_all}
                </button>
                <button type="button" onClick={() => setNotifyMode('targeted')} className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-[11px] font-black transition ${notifyMode === 'targeted' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {t.notify_targeted} ({notifySelectedIds.length})
                </button>
              </div>
            )}

            {notifyTargetSector.source === 'contentCreators' && notifyMode === 'targeted' && (
              <p className="mt-3 text-[10px] text-amber-600 dark:text-amber-400">{lang === 'ar' ? 'سوق الترند يدعم الإرسال الجماعي فقط — يُرسل لجميع المبدعين' : lang === 'en' ? 'Trend Market only supports broadcast — message goes to all creators' : 'Le Marché Trend supporte uniquement la diffusion — message envoyé à tous les créateurs'}</p>
            )}

            {notifyMode === 'targeted' && notifyTargetSector.source === 'platformEntity' && (
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input dir="ltr" value={notifyEntitySearch} onChange={(e) => setNotifyEntitySearch(e.target.value)} placeholder={t.notify_search_placeholder} className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 text-sm outline-none placeholder:text-slate-400 focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                  {(notifyEntityQuery.data?.entities ?? []).map((ent) => (
                    <label key={ent.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="checkbox" checked={notifySelectedIds.includes(ent.id)} onChange={() => setNotifySelectedIds((prev) => prev.includes(ent.id) ? prev.filter((id) => id !== ent.id) : [...prev, ent.id])} className="h-3.5 w-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300">{ent.customerName}</p>
                        <p className="truncate text-[9px] text-slate-400" dir="ltr">{ent.email}</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-slate-400">{ent.id}</span>
                    </label>
                  ))}
                  {(notifyEntityQuery.data?.entities ?? []).length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">{t.loading}</p>}
                </div>
                {notifySelectedIds.length > 0 && <p className="text-[10px] text-slate-400">{notifySelectedIds.length} {t.notify_selected}</p>}
              </div>
            )}

            <div className="mt-4 grid gap-4">
              <div className="flex gap-2">
                <label className="flex-1 block">
                  <span className="text-[10px] font-bold text-slate-400">{t.notify_title_label}</span>
                  <input dir="rtl" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="w-32 block">
                  <span className="text-[10px] font-bold text-slate-400">{t.notify_type_label}</span>
                  <select value={notifyType} onChange={(e) => setNotifyType(e.target.value as typeof notifyType)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {typeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400">{t.notify_body_label}</span>
                <textarea dir="rtl" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} rows={4} className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={handleNotifySubmit} disabled={(notifySectorMutation.isPending || notifyEntitiesMutation.isPending) || !notifyTitle.trim() || !notifyBody.trim() || (notifyMode === 'targeted' && notifySelectedIds.length === 0)} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50">
                <Send size={15} />
                {(notifySectorMutation.isPending || notifyEntitiesMutation.isPending) ? t.loading : t.notify_send}
              </button>
              <button type="button" onClick={() => setNotifyOpen(false)} className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {t.btn_close}
              </button>
            </div>
          </div>
        </div>
      )}
    {coverPickerOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4" onMouseDown={() => setCoverPickerOpen(false)}><div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#0c1828]" onMouseDown={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">{lang === 'ar' ? 'اختيار كفر النشاط' : 'Choose sector cover'}</h3><p className="mt-1 text-[11px] text-slate-500">{lang === 'ar' ? 'المقاس الموصى به 1200×675 بنسبة 16:9' : 'Recommended 1200×675 · 16:9'}</p></div><button type="button" onClick={() => setCoverPickerOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button></div>{platformImagesQuery.isLoading ? <div className="py-12 text-center text-sm text-slate-500">{t.loading}</div> : (platformImagesQuery.data ?? []).length === 0 ? <div className="py-12 text-center text-sm text-slate-500">{lang === 'ar' ? 'لا توجد صور في مكتبة المنصة بعد' : 'No platform images yet'}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{(platformImagesQuery.data ?? []).map((file) => <button key={file.id} type="button" onClick={() => { setEditCoverUrl(file.publicUrl); setCoverPickerOpen(false); }} className="overflow-hidden rounded-2xl border border-slate-200 text-start transition hover:border-orange-400 dark:border-slate-700"><div className="aspect-video bg-slate-100 dark:bg-slate-900"><img src={file.publicUrl} alt={file.originalName} className="h-full w-full object-cover object-center"/></div><p className="truncate p-2 text-[10px] font-bold">{file.originalName}</p></button>)}</div>}</div></div>}
</div>
  );
              </>\n            ) : null}
      </div>
    );
  }

  return (
    <div dir={t.dir} className="w-full min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-[#0f172a] dark:text-[#f8fafc]">
      <div className="flex h-screen overflow-hidden">

        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 end-0 z-40 flex w-64 flex-col border-e border-white/10 bg-[#07111f] text-white shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 dark:bg-[#07111f] ${isSidebarOpen ? 'translate-x-0' : t.dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-orange-500/10 font-black text-orange-400">NF</div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white">{t.projectName}</h1>
                <p className="text-xs text-slate-400">{t.adminBadge ?? t.adminCenter}</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden" aria-label="close">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-[13px]">
            <SidebarLink icon={<LayoutDashboard size={18} />} label={lang === 'ar' ? 'الرئيسية' : t.nav_overview} active={currentSection === 'overview'} onClick={() => setCurrentSection('overview')} />
            <SectionGroupLabel>{lang === 'ar' ? 'المتاجر والمطاعم' : 'Stores & Restaurants'}</SectionGroupLabel>
            <SidebarLink icon={<Store size={18} />} label={lang === 'ar' ? 'جميع المتاجر' : lang === 'fr' ? 'Toutes les entreprises' : 'All stores'} active={currentSection === 'admin'} onClick={() => setCurrentSection('admin')} />
            <SidebarLink icon={<Plus size={18} />} label={lang === 'ar' ? 'إضافة متجر جديد' : lang === 'fr' ? 'Ajouter une entreprise' : 'Add new store'} active={false} onClick={() => setCurrentSection('admin')} />
            <SidebarLink icon={<FolderOpen size={18} />} label={lang === 'ar' ? 'الفئات والتصنيفات' : lang === 'fr' ? 'Catégories' : 'Categories'} active={false} onClick={() => setCurrentSection('sectors')} />
            <SidebarLink icon={<UserCheck size={18} />} label={lang === 'ar' ? 'مراجعة طلبات الانضمام' : lang === 'fr' ? 'Demandes d’adhésion' : 'Join requests'} active={false} onClick={() => setCurrentSection('admin')} />
            <SectionGroupLabel>{lang === 'ar' ? 'إدارة المنصة' : lang === 'fr' ? 'Gestion de la plateforme' : 'Platform management'}</SectionGroupLabel>
            <SidebarLink icon={<Users size={18} />} label={lang === 'ar' ? 'إدارة المستخدمين' : t.nav_accounts} active={currentSection === 'accounts'} onClick={() => setCurrentSection('accounts')} />
            <SidebarLink icon={<ShieldCheck size={18} />} label={lang === 'ar' ? 'الاشتراكات والباقات' : 'Subscriptions & plans'} active={currentSection === 'sectors'} onClick={() => setCurrentSection('sectors')} />
            <SidebarLink icon={<Megaphone size={18} />} label={lang === 'ar' ? 'التسويق والعروض' : 'Marketing & offers'} active={false} onClick={() => setCurrentSection('admin')} />
            <SidebarLink icon={<Send size={18} />} label={lang === 'ar' ? 'الرسائل والإشعارات' : 'Messages & notifications'} active={currentSection === 'settings'} onClick={() => setCurrentSection('settings')} />
            <SidebarLink icon={<TrendingUp size={18} />} label={lang === 'ar' ? 'التحليلات والتقارير' : 'Analytics & reports'} active={false} onClick={() => setCurrentSection('overview')} />
            <SidebarLink icon={<Sparkles size={18} />} label={lang === 'ar' ? 'المظهر والهوية' : 'Appearance & identity'} active={currentSection === 'files'} onClick={() => setCurrentSection('files')} />
            <SidebarLink icon={<Settings size={18} />} label={lang === 'ar' ? 'الإعدادات العامة' : t.nav_settings} active={currentSection === 'settings'} onClick={() => setCurrentSection('settings')} />
            <SidebarLink icon={<FolderOpen size={18} />} label={lang === 'ar' ? 'المحتوى والصفحات' : 'Content & pages'} active={currentSection === 'files'} onClick={() => setCurrentSection('files')} />
            <SidebarLink icon={<Languages size={18} />} label={lang === 'ar' ? 'اللغات والترجمة' : t.nav_languages} active={currentSection === 'languages'} onClick={() => setCurrentSection('languages')} />
            <SidebarLink icon={<ShieldCheck size={18} />} label={lang === 'ar' ? 'النظام والأمان' : t.nav_security} active={currentSection === 'security'} onClick={() => setCurrentSection('security')} />
            <SectionGroupLabel>{lang === 'ar' ? 'NFOOD' : 'NFOOD'}</SectionGroupLabel>
            <SidebarLink icon={<TrendingUp size={18} />} label={lang === 'ar' ? 'سوق NFOOD' : 'NFOOD Marketplace'} active={false} onClick={() => window.location.assign('/marketplace')} />
          </nav>

          <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-xs text-slate-300">
              <HeartPulse size={16} className="text-emerald-400" />
              <span>{t.systemReady} · {t.adminCenter}</span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/95">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" aria-label="menu">
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{t.panelTitle}</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{t.panelSubtitle}</p>
              </div>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-200 md:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                <CheckCircle2 size={12} />
                {t.systemReady}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer" className="hidden h-9 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-black text-emerald-600 transition hover:bg-emerald-500/20 md:flex dark:text-emerald-400"><ExternalLink size={14} />{lang === 'ar' ? 'عرض الموقع' : lang === 'en' ? 'View site' : 'Voir le site'}</a>
              <a href="/marketplace" className="hidden h-9 items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 text-xs font-black text-orange-600 transition hover:bg-orange-500/20 lg:flex dark:text-orange-400"><TrendingUp size={14} />{lang === 'ar' ? 'السوق' : lang === 'en' ? 'Marketplace' : 'Marché'}</a>
              <div className="relative hidden sm:block">
                <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="h-9 w-56 rounded-xl border border-slate-200 bg-slate-50 ps-9 text-sm outline-none placeholder:text-slate-400 focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <button type="button" onClick={() => onToggleTheme?.()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="theme">
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <div className="relative hidden md:block">
                <Globe size={14} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={lang} onChange={(event) => setLang(event.target.value as Language)} className="h-9 appearance-none rounded-xl border border-slate-200 bg-white ps-8 pe-7 text-[11px] font-black text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" aria-label="language">
                  <option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option>
                </select>
              </div>
              <button type="button" className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="notifications">
                <Bell size={17} />
                {(liveData?.recentGovernance?.length ?? 0) > 0 && <span className="absolute -end-1 -top-1 min-w-4 rounded-full bg-orange-500 px-1 text-center text-[9px] font-black leading-4 text-white">{Math.min(liveData?.recentGovernance?.length ?? 0, 99)}</span>}
              </button>
              <div className="hidden items-center gap-2 border-s border-slate-200 ps-3 lg:flex dark:border-white/10">
                <div className="text-end leading-tight"><p className="text-[11px] font-black">FOON Cards</p><p className="text-[9px] font-bold text-orange-500">Super Admin</p></div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-xs font-black text-white">FC</div>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-4 sm:p-5 dark:bg-[#08121f]">
            {currentSection === 'sectors' ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black">{t.sectors_title}</h2>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{t.sectors_subtitle}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30">
                      <Store size={12} />
                      {sectors.length} {lang === 'ar' ? 'قطاعات' : lang === 'en' ? 'Sectors' : 'Secteurs'}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {sectors.map((sector) => {
                    const NavIcon = sector.key === 'trend' ? Sparkles : (SECTOR_NAV.find((n) => n.key === (sector.alias || sector.key))?.icon ?? ShieldAlert);
                    const label = getSectorLabel(sector);
                    const isTrend = sector.source === 'contentCreators';
                    return (
                      <div key={sector.key} className={`flex min-h-[330px] flex-col overflow-hidden rounded-2xl border shadow-sm transition ${sector.active ? 'border-slate-200 bg-white dark:border-slate-700/60 dark:bg-[#1e293b]' : 'border-dashed border-slate-300 bg-slate-50/60 opacity-75 dark:border-slate-700 dark:bg-[#1e293b]/60'}`}>
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                          {sector.coverUrl ? <img src={sector.coverUrl} alt={label} className="h-full w-full object-cover object-center" /> : <div className="flex h-full items-center justify-center text-slate-400"><NavIcon size={42} /></div>}
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sector.active ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                              <NavIcon size={20} />
                            </span>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">{sector.entityCount} {sector.entityCount === 1 ? t.sector_entities : t.sector_entities}</p>
                            </div>
                          </div>
                          <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-black ring-1 ${sector.active ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'}`}>
                            {sector.active ? t.sector_status_active : t.sector_status_inactive}
                          </span>
                        </div>
                        {isTrend && (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30">
                            <Sparkles size={9} />
                            {lang === 'ar' ? 'سوق المبدعين' : lang === 'en' ? 'Creators Marketplace' : 'Marché des Créateurs'}
                          </span>
                        )}
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => openEditModal(sector)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
                            <Pencil size={11} />{t.btn_edit_labels}
                          </button>
                          <button type="button" onClick={() => openNotifyModal(sector)} disabled={notifySectorMutation.isPending || notifyEntitiesMutation.isPending} className="flex cursor-pointer items-center gap-1 rounded-lg bg-orange-50 px-2 py-1.5 text-[10px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                            <Megaphone size={11} />{t.btn_notify}
                          </button>
                          {!isTrend && (
                            <button type="button" onClick={() => toggleSectorActive(sector)} disabled={updateSectorMutation.isPending} className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-black ring-1 ring-inset transition disabled:opacity-50 ${sector.active ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}>
                              {sector.active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
                              {sector.active ? t.btn_deactivate : t.btn_activate}
                            </button>
                          )}
                        </div>
                        {!sector.active && !isTrend && <p className="text-[9px] text-slate-400 dark:text-slate-500">{lang === 'ar' ? 'القطاع موقوف — لا يستقبل طلبات جديدة' : lang === 'en' ? 'Sector inactive — not accepting new orders' : 'Secteur inactif — n\'accepte pas les nouvelles commandes'}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : showEntityTable ? (
              <>
                {isSectorSection && (() => {
                  const sec = sectors.find((s) => (s.alias === currentSection || s.key === currentSection) && s.source === 'platformEntity');
                  if (!sec) return null;
                  const label = getSectorLabel(sec);
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${sec.active ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'}`}>
                          {sec.active ? t.sector_status_active : t.sector_status_inactive}
                        </span>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                        <span className="text-[10px] text-slate-400">{sec.entityCount} {t.sector_entities}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => openEditModal(sec)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
                          <Pencil size={12} />{t.btn_edit_labels}
                        </button>
                        <button type="button" onClick={() => openNotifyModal(sec)} disabled={notifySectorMutation.isPending || notifyEntitiesMutation.isPending} className="flex cursor-pointer items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[11px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                          <Megaphone size={12} />{t.btn_broadcast}
                        </button>
                        <button type="button" onClick={() => toggleSectorActive(sec)} disabled={updateSectorMutation.isPending} className={`flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${sec.active ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}>
                          {sec.active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                          {sec.active ? t.btn_deactivate : t.btn_activate}
                        </button>
                      </div>
                    </div>
                  );
                })()}
                {currentSection === 'overview' && (
                  <>
                    <section className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-black">{lang === 'ar' ? 'مرحباً بعودتك 👋' : lang === 'fr' ? 'Bon retour 👋' : 'Welcome back 👋'}</h1>
                        <p className="mt-1 text-xs text-slate-400">{lang === 'ar' ? 'إليك نظرة شاملة على أداء منصتك اليوم' : 'A live overview of your platform today'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-[#0c1828] dark:text-slate-300">{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </section>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {kpis.map((kpi) => { const Icon = kpi.icon; return <div key={kpi.label} className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><Icon size={19}/></span><span className="text-[10px] font-black text-emerald-400">{kpi.detail}</span></div><p className="mt-3 text-2xl font-black">{kpi.value}</p><p className="mt-1 text-[11px] text-slate-400">{kpi.label}</p></div>})}
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
                      <section className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-5">
                        <div className="flex items-center justify-between"><h2 className="text-sm font-black">{lang === 'ar' ? 'نظرة عامة على المبيعات' : 'Sales overview'}</h2><span className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400">{lang === 'ar' ? 'بيانات مباشرة فقط' : 'Live data only'}</span></div>
                        <div className="mt-4 flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#08111d] px-5 text-center text-xs text-slate-500">{lang === 'ar' ? "سيظهر الرسم البياني فور ربط مصدر الإيرادات والطلبات الموثوق — لا توجد أرقام تجريبية. الحالة الحالية: 'غير مفحوص'." : "Financial chart will appear when a trusted revenue/orders source is available — no demo figures are shown. Status: 'Not checked'."}</div>
                      </section>
                      <section className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-5">
                        <h2 className="text-sm font-black">{lang === 'ar' ? 'توزيع الفئات' : 'Category distribution'}</h2>
                        <div className="mt-5 space-y-3">{sectors.length ? sectors.slice(0, 6).map((sector) => { const total = Math.max(1, sectors.reduce((sum, item) => sum + item.entityCount, 0)); return <div key={sector.key}><div className="mb-1 flex justify-between text-[11px]"><span>{getSectorLabel(sector)}</span><span className="font-black">{sector.entityCount}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-orange-500" style={{width: `${Math.round((sector.entityCount / total) * 100)}%`}} /></div></div> }) : <div className="flex h-36 items-center justify-center text-xs text-slate-500">{lang === 'ar' ? 'لا توجد بيانات فئات متاحة' : 'No category data available'}</div>}</div>
                      </section>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      {[
  [Settings, lang === 'ar' ? 'التحكم في الميزات' : 'Feature controls', lang === 'ar' ? 'إدارة صلاحيات المنصة' : 'Manage platform capabilities'],
  [ShieldCheck, lang === 'ar' ? 'باقات الاشتراك' : 'Subscription plans', lang === 'ar' ? 'إدارة الباقات والحدود' : 'Plans and entitlements'],
  [Send, lang === 'ar' ? 'قوالب الرسائل' : 'Message templates', lang === 'ar' ? 'البريد والرسائل والإشعارات' : 'Email, messages and alerts'],
  [Store, lang === 'ar' ? 'إدارة المتاجر' : 'Store management', lang === 'ar' ? 'عرض وتفعيل وتعديل' : 'View, activate and edit'],
  [Sparkles, lang === 'ar' ? 'تخصيص موقعك' : 'Site customization', lang === 'ar' ? 'الهوية والمظهر العام' : 'Brand and appearance'],
].map(([Icon,title,subtitle],index)=>{const QuickIcon=Icon as typeof Settings; return <button key={String(title)} type="button" onClick={()=>setCurrentSection(index===2?'settings':index===3?'admin':index===4?'files':index===0?'settings':'sectors')} className="rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 text-start transition hover:border-orange-500/60"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400"><QuickIcon size={19}/></span><p className="mt-3 text-sm font-black">{String(title)}</p><p className="mt-1 text-[10px] text-slate-400">{String(subtitle)}</p></button>})}
                    </div>
                  </>
                )}
                {currentSection === 'overview' && (
                  <section className="grid gap-3 rounded-xl border border-slate-700/60 bg-[#0c1828] p-4 sm:grid-cols-5">
                    <div><p className="text-sm font-black">{lang === 'ar' ? 'الحالة النظامية' : 'System status'}</p><p className="mt-1 text-[10px] text-slate-500">{lang === 'ar' ? 'لا نعرض حالة خضراء دون فحص فعلي' : 'No healthy status is shown without a real probe'}</p></div>
                    {['API / Server','Database','Payment gateway','Messaging','Cloud storage'].map((service) => <div key={service} className="rounded-lg border border-slate-700 bg-[#08111d] px-3 py-2"><p className="text-[10px] text-slate-400">{service}</p><p className="mt-1 text-xs font-black text-amber-400">{lang === 'ar' ? 'غير مفحوص' : 'Not checked'}</p></div>)}
                  </section>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    <button type="button" onClick={() => setActiveTab('orders')} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                      <ShieldCheck size={13} />
                      {t.tab_companies}
                    </button>
                    <button type="button" onClick={() => setActiveTab('freelancers')} className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${activeTab === 'freelancers' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                      <Camera size={13} />
                      {t.tab_creators}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-700/50">
                    <div>
                      <h2 className="text-base font-black">{currentSection === 'overview' ? (lang === 'ar' ? 'أحدث المتاجر والمنشآت' : lang === 'fr' ? 'Dernières entreprises' : 'Latest stores & businesses') : t.table_title}</h2>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{currentSection === 'overview' ? (lang === 'ar' ? 'أحدث البيانات الحقيقية المسجلة في المنصة' : 'Latest live records registered on the platform') : t.table_subtitle}</p>
                    </div>
                    <button type="button" onClick={() => handleOpenModal(orders[0])} disabled={!orders.length} className="flex cursor-pointer items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-600 transition hover:bg-orange-100 disabled:cursor-default disabled:opacity-40 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20">
                      <ShieldCheck size={11} />
                      {t.btn_viewDetails}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 dark:bg-slate-900/40">
                          <th className="px-5 py-3 text-start">{t.th_orderNum}</th>
                          <th className="px-5 py-3 text-start">{t.th_customer}</th>
                          <th className="px-5 py-3 text-start">{t.th_restaurant}</th>
                          <th className="px-5 py-3 text-start">{t.th_status}</th>
                          <th className="px-5 py-3 text-start">{t.th_amount}</th>
                          {activeTab === 'freelancers' && <th className="px-5 py-3 text-start">{t.th_storage}</th>}
                          <th className="px-5 py-3 text-start">{t.th_lastUpdate}</th>
                          <th className="px-5 py-3 text-start">{t.th_actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan={activeTab === 'freelancers' ? 8 : 7} className="px-5 py-10 text-center text-xs font-semibold text-slate-400">{t.loading}</td>
                          </tr>
                        ) : orders.length === 0 ? (
                          <tr>
                            <td colSpan={activeTab === 'freelancers' ? 8 : 7} className="px-5 py-10 text-center text-xs font-semibold text-slate-400">{t.empty}</td>
                          </tr>
                        ) : orders.map((order) => (
                          <tr key={order.id} className="border-t border-slate-100 transition hover:bg-slate-50/60 dark:border-slate-700/40 dark:hover:bg-slate-800/40">
                            <td className="px-5 py-4 font-mono text-xs font-bold">{order.id}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{order.customer}</p>
                                {activeTab === 'freelancers' && order.isPhotographer && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black text-violet-600 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30">
                                    <Camera size={9} />
                                    {t.badge_photographer}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-400" dir="ltr">{order.email}</p>
                            </td>
                            <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{order.restaurant}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${order.status ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30'}`}>
                                {order.status ? t.status_completed : t.status_pending}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${planCls[order.plan]}`}>{order.plan}</span>
                            </td>
                            {activeTab === 'freelancers' && (
                              <td className="px-5 py-4">
                                <div className="flex min-w-[150px] flex-col gap-1.5">
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${order.catalogEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                    <HardDrive size={11} />
                                    {order.catalogEnabled ? t.status_completed : t.status_pending}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                      <div className={`h-full rounded-full ${order.storageUsed >= order.storageLimit ? 'bg-gradient-to-r from-rose-500 to-red-400' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} style={{ width: `${Math.min(100, Math.round((order.storageUsed / Math.max(order.storageLimit, 1)) * 100))}%` }} />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400" dir="ltr">{order.storageUsed} / {order.storageLimit} MB</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setUpgradeMenuId(upgradeMenuId === order.id ? null : order.id)}
                                      disabled={upgradeStorageMutation.isPending}
                                      title={t.storage_locked_hint}
                                      className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.storageUsed >= order.storageLimit ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-orange-50 text-orange-600 ring-orange-200 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20'}`}
                                    >
                                      <ArrowUpCircle size={11} />
                                      {t.storage_upgrade}
                                    </button>
                                    {upgradeMenuId === order.id && (
                                      <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        {[2, 5, 10].map((gb) => {
                                          const targetLimitMb = order.storageLimit + gb * 1024;
                                          const fee = gb * 20;
                                          return (
                                            <button
                                              key={gb}
                                              type="button"
                                              onClick={() => upgradeStorageMutation.mutate({ entityId: order.id, targetLimitMb })}
                                              disabled={upgradeStorageMutation.isPending}
                                              className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-orange-500/10"
                                            >
                                              <span dir="ltr">+{gb} GB</span>
                                              <span className="text-orange-600 dark:text-orange-400">{fee} SAR</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  {order.storageUsed >= order.storageLimit && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-500 dark:text-rose-400">
                                      <LockKeyhole size={9} />
                                      {t.storage_locked}
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400" dir="ltr">{order.date}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleStatusMutation.mutate({ entityId: order.id })}
                                  disabled={toggleStatusMutation.isPending}
                                  title={t.actionToggle}
                                  className={`flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.status ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20'}`}
                                >
                                  {order.status ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                  {lang === 'ar' ? (order.status ? 'إيقاف' : 'تفعيل') : lang === 'en' ? (order.status ? 'Off' : 'On') : (order.status ? 'Off' : 'On')}
                                </button>
                                {activeTab === 'freelancers' && (
                                  <button
                                    type="button"
                                    onClick={() => toggleCatalogMutation.mutate({ entityId: order.id })}
                                    disabled={toggleCatalogMutation.isPending}
                                    title={t.catalog_toggle}
                                    className={`flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-black ring-1 ring-inset transition disabled:opacity-50 ${order.catalogEnabled ? 'bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/20' : 'bg-violet-50 text-violet-600 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30 dark:hover:bg-violet-500/20'}`}
                                  >
                                    {order.catalogEnabled ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                                    {t.catalog_toggle}
                                  </button>
                                )}
                                <button type="button" onClick={() => handleOpenModal(order)} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-50 px-2.5 py-1.5 text-[11px] font-black text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30 dark:hover:bg-orange-500/20">
                                  <Eye size={13} />
                                  {t.btn_viewDetails}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-700/50">
                    <p className="text-[11px] text-slate-400">
                      {orders.length} {t.th_actions === 'إجراءات الحوكمة السريعة' ? 'منشأة' : 'entities'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">{t.summary_title}</h3>
                      <p className="mt-1 text-[11px] text-slate-400">{t.table_subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, customers: !f.customers }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.customers ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_total}
                      </button>
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, restaurants: !f.restaurants }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.restaurants ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_active}
                      </button>
                      <button type="button" onClick={() => setFeatures((f) => ({ ...f, translations: !f.translations }))} className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {features.translations ? <ToggleRight size={14} className="text-orange-500" /> : <ToggleLeft size={14} />}
                        {t.sum_profiles}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className={`rounded-xl p-4 ${features.customers ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_total}</p>
                      <p className={`mt-1 text-xl font-black ${features.customers ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.customers ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${features.restaurants ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_active}</p>
                      <p className={`mt-1 text-xl font-black ${features.restaurants ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.restaurants ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${features.translations ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.sum_profiles}</p>
                      <p className={`mt-1 text-xl font-black ${features.translations ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>{features.translations ? (lang === 'ar' ? 'مفعّل' : lang === 'en' ? 'Enabled' : 'Activé') : (lang === 'ar' ? 'معطّل' : lang === 'en' ? 'Disabled' : 'Désactivé')}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b]">
                <ShieldAlert size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-base font-black">{t[`nav_${currentSection}`]}</p>
                <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-slate-400">{t.panelSubtitle}</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t.modal_title}</h3>
                <p className="mt-1 font-mono text-xs text-slate-400">{selectedOrder.id}</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close">
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.th_customer}</p>
                <p className="mt-1 text-sm font-bold">{selectedOrder.customer}</p>
                <p className="mt-0.5 text-[11px] text-slate-400" dir="ltr">{selectedOrder.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.th_restaurant}</p>
                <p className="mt-1 text-sm font-bold">{selectedOrder.restaurant}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.modal_tax}</p>
                <p className="mt-1 font-mono text-sm font-bold">{selectedOrder.taxId}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.modal_transfer_status}</p>
                <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${selectedOrder.status ? 'bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30'}`}>
                  {selectedOrder.status ? <CheckCircle2 size={12} /> : <X size={12} />}
                  {selectedOrder.status ? t.status_completed : t.status_pending}
                </span>
              </div>
              <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                <p className="text-[10px] font-bold text-slate-400">{t.actionToggle} · {t.planLook}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select value={selectedPlan} onChange={(event) => setSelectedPlan(event.target.value as 'Basic' | 'Pro' | 'Enterprise')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => upgradePlanMutation.mutate({ entityId: selectedOrder.id, plan: selectedPlan })}
                    disabled={upgradePlanMutation.isPending || selectedPlan === selectedOrder.plan}
                    className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50"
                  >
                    <ArrowUpCircle size={13} />
                    {upgradePlanMutation.isPending ? t.upgrading : t.plan_upgrade}
                  </button>
                  {selectedOrder.catalog && selectedOrder.catalog.catalogUrl && (
                    <a href={selectedOrder.catalog.catalogUrl.startsWith('http') ? selectedOrder.catalog.catalogUrl : `https://${selectedOrder.catalog.catalogUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <ExternalLink size={13} />
                      {t.btn_viewDetails}
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setIsModalOpen(false)} className="mt-5 w-full rounded-xl bg-[#0f172a] py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:text-slate-900 dark:hover:bg-orange-600">
              {t.modal_close}
            </button>
          </div>
        </div>
      )}

      {editSectorKey && (() => {
        const sec = sectors.find((s) => s.key === editSectorKey);
        if (!sec) return null;
        return (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setEditSectorKey(null)}>
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black">{t.edit_modal_title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{getSectorLabel(sec)}</p>
                </div>
                <button type="button" onClick={() => setEditSectorKey(null)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close"><X size={17} /></button>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_ar}</span>
                  <input dir="rtl" value={editLabels.labelAr} onChange={(e) => setEditLabels((p) => ({ ...p, labelAr: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_en}</span>
                  <input dir="ltr" value={editLabels.labelEn} onChange={(e) => setEditLabels((p) => ({ ...p, labelEn: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400">{t.edit_label_fr}</span>
                  <input dir="ltr" value={editLabels.labelFr} onChange={(e) => setEditLabels((p) => ({ ...p, labelFr: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                {sec.source !== 'contentCreators' && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                    <button type="button" onClick={() => setEditActive(!editActive)} className={`flex cursor-pointer items-center gap-2 text-[11px] font-black ${editActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {editActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {editActive ? t.sector_status_active : t.sector_status_inactive}
                    </button>
                    <span className="text-[10px] text-slate-400">{t.edit_active}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <button type="button" onClick={() => updateSectorMutation.mutate({ sectorKey: editSectorKey, ...editLabels, active: sec.source === 'contentCreators' ? sec.active : editActive })} disabled={updateSectorMutation.isPending || !editLabels.labelAr.trim() || !editLabels.labelEn.trim() || !editLabels.labelFr.trim()} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50">
                  <CheckCircle2 size={15} />
                  {updateSectorMutation.isPending ? t.loading : t.btn_save}
                </button>
                <button type="button" onClick={() => setEditSectorKey(null)} className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  {t.btn_cancel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {notifyOpen && notifyTargetSector && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setNotifyOpen(false)}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#1e293b]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black">{t.notify_modal_title}</h3>
                <p className="mt-1 text-xs text-slate-400">{getSectorLabel(notifyTargetSector)}</p>
              </div>
              <button type="button" onClick={() => setNotifyOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="close"><X size={17} /></button>
            </div>

            {notifyTargetSector.source === 'platformEntity' && (
              <div className="mt-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button type="button" onClick={() => { setNotifyMode('broadcast'); setNotifySelectedIds([]); }} className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-[11px] font-black transition ${notifyMode === 'broadcast' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {t.notify_broadcast_all}
                </button>
                <button type="button" onClick={() => setNotifyMode('targeted')} className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-[11px] font-black transition ${notifyMode === 'targeted' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                  {t.notify_targeted} ({notifySelectedIds.length})
                </button>
              </div>
            )}

            {notifyTargetSector.source === 'contentCreators' && notifyMode === 'targeted' && (
              <p className="mt-3 text-[10px] text-amber-600 dark:text-amber-400">{lang === 'ar' ? 'سوق الترند يدعم الإرسال الجماعي فقط — يُرسل لجميع المبدعين' : lang === 'en' ? 'Trend Market only supports broadcast — message goes to all creators' : 'Le Marché Trend supporte uniquement la diffusion — message envoyé à tous les créateurs'}</p>
            )}

            {notifyMode === 'targeted' && notifyTargetSector.source === 'platformEntity' && (
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input dir="ltr" value={notifyEntitySearch} onChange={(e) => setNotifyEntitySearch(e.target.value)} placeholder={t.notify_search_placeholder} className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 text-sm outline-none placeholder:text-slate-400 focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                  {(notifyEntityQuery.data?.entities ?? []).map((ent) => (
                    <label key={ent.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input type="checkbox" checked={notifySelectedIds.includes(ent.id)} onChange={() => setNotifySelectedIds((prev) => prev.includes(ent.id) ? prev.filter((id) => id !== ent.id) : [...prev, ent.id])} className="h-3.5 w-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300">{ent.customerName}</p>
                        <p className="truncate text-[9px] text-slate-400" dir="ltr">{ent.email}</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-slate-400">{ent.id}</span>
                    </label>
                  ))}
                  {(notifyEntityQuery.data?.entities ?? []).length === 0 && <p className="py-4 text-center text-[11px] text-slate-400">{t.loading}</p>}
                </div>
                {notifySelectedIds.length > 0 && <p className="text-[10px] text-slate-400">{notifySelectedIds.length} {t.notify_selected}</p>}
              </div>
            )}

            <div className="mt-4 grid gap-4">
              <div className="flex gap-2">
                <label className="flex-1 block">
                  <span className="text-[10px] font-bold text-slate-400">{t.notify_title_label}</span>
                  <input dir="rtl" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                </label>
                <label className="w-32 block">
                  <span className="text-[10px] font-bold text-slate-400">{t.notify_type_label}</span>
                  <select value={notifyType} onChange={(e) => setNotifyType(e.target.value as typeof notifyType)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {typeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400">{t.notify_body_label}</span>
                <textarea dir="rtl" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} rows={4} className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button type="button" onClick={handleNotifySubmit} disabled={(notifySectorMutation.isPending || notifyEntitiesMutation.isPending) || !notifyTitle.trim() || !notifyBody.trim() || (notifyMode === 'targeted' && notifySelectedIds.length === 0)} className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-default disabled:opacity-50">
                <Send size={15} />
                {(notifySectorMutation.isPending || notifyEntitiesMutation.isPending) ? t.loading : t.notify_send}
              </button>
              <button type="button" onClick={() => setNotifyOpen(false)} className="flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {t.btn_close}
              </button>
            </div>
          </div>
        </div>
      )}
    {coverPickerOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4" onMouseDown={() => setCoverPickerOpen(false)}><div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#0c1828]" onMouseDown={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><div><h3 className="font-black">{lang === 'ar' ? 'اختيار كفر النشاط' : 'Choose sector cover'}</h3><p className="mt-1 text-[11px] text-slate-500">{lang === 'ar' ? 'المقاس الموصى به 1200×675 بنسبة 16:9' : 'Recommended 1200×675 · 16:9'}</p></div><button type="button" onClick={() => setCoverPickerOpen(false)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button></div>{platformImagesQuery.isLoading ? <div className="py-12 text-center text-sm text-slate-500">{t.loading}</div> : (platformImagesQuery.data ?? []).length === 0 ? <div className="py-12 text-center text-sm text-slate-500">{lang === 'ar' ? 'لا توجد صور في مكتبة المنصة بعد' : 'No platform images yet'}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{(platformImagesQuery.data ?? []).map((file) => <button key={file.id} type="button" onClick={() => { setEditCoverUrl(file.publicUrl); setCoverPickerOpen(false); }} className="overflow-hidden rounded-2xl border border-slate-200 text-start transition hover:border-orange-400 dark:border-slate-700"><div className="aspect-video bg-slate-100 dark:bg-slate-900"><img src={file.publicUrl} alt={file.originalName} className="h-full w-full object-cover object-center"/></div><p className="truncate p-2 text-[10px] font-bold">{file.originalName}</p></button>)}</div>}</div></div>}
</div>
  );
}