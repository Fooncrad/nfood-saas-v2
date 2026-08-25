import { int, index, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, uniqueIndex } from "drizzle-orm/mysql-core";

export const platformSettings = mysqlTable("platformSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedByUserId: int("updatedByUserId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const integrationSettings = mysqlTable("integrationSettings", {
  id: int("id").autoincrement().primaryKey(),
  scope: mysqlEnum("scope", ["platform", "restaurant"]).notNull(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  providerKey: varchar("providerKey", { length: 120 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["not_configured", "configured", "disabled"]).default("not_configured").notNull(),
  keyReference: varchar("keyReference", { length: 180 }),
  secretCiphertext: text("secretCiphertext"),
  updatedByUserId: int("updatedByUserId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  birthDate: timestamp("birthDate"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 128 }),
  emailVerificationExpiresAt: timestamp("emailVerificationExpiresAt"),
});

export const customerProfiles = mysqlTable("customerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  isPublic: boolean("isPublic").default(false).notNull(),
  displayName: varchar("displayName", { length: 160 }),
  title: varchar("title", { length: 160 }),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  coverUrl: varchar("coverUrl", { length: 500 }),
  phone: varchar("phone", { length: 40 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  email: varchar("email", { length: 320 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 120 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  twitterUrl: varchar("twitterUrl", { length: 500 }),
  facebookUrl: varchar("facebookUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  servicesJson: text("servicesJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  customDomain: varchar("customDomain", { length: 255 }).unique(),
  barcode: varchar("barcode", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "trial", "suspended"]).default("trial").notNull(),
  plan: varchar("plan", { length: 64 }).default("Growth").notNull(),
  brandName: varchar("brandName", { length: 160 }),
  brandColor: varchar("brandColor", { length: 7 }).default("#e76f3c"),
  themeMode: mysqlEnum("themeMode", ["light", "dark", "system"]).default("light").notNull(),
  themePreset: varchar("themePreset", { length: 40 }).default("nfood-sunset").notNull(),
  menuTemplate: mysqlEnum("menuTemplate", ["editorial", "bistro", "glass"]).default("editorial").notNull(),
  brandLogoUrl: varchar("brandLogoUrl", { length: 500 }),
  coverUrl: varchar("coverUrl", { length: 500 }),
  pwaInstallMessage: varchar("pwaInstallMessage", { length: 180 }),
  pwaInstallIconUrl: varchar("pwaInstallIconUrl", { length: 500 }),
  brandDescription: text("brandDescription"),
  seoTitle: varchar("seoTitle", { length: 180 }),
  seoDescription: varchar("seoDescription", { length: 320 }),
  seoKeywords: text("seoKeywords"),
  seoHashtags: text("seoHashtags"),
  seoImageUrl: varchar("seoImageUrl", { length: 500 }),
  seoCanonicalUrl: varchar("seoCanonicalUrl", { length: 500 }),
  seoRobots: varchar("seoRobots", { length: 120 }).default("index,follow"),
  googleSearchConsoleVerification: varchar("googleSearchConsoleVerification", { length: 500 }),
  googleAnalyticsMeasurementId: varchar("googleAnalyticsMeasurementId", { length: 80 }),
  googleTagManagerId: varchar("googleTagManagerId", { length: 80 }),
  structuredDataJson: text("structuredDataJson"),
  homepageContent: text("homepageContent"),
  termsOfService: text("termsOfService"),
  privacyPolicy: text("privacyPolicy"),
  refundPolicy: text("refundPolicy"),
  phone: varchar("phone", { length: 40 }),
  country: varchar("country", { length: 120 }),
  countryCode: varchar("countryCode", { length: 2 }).default("SA").notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  currencyDecimals: int("currencyDecimals").default(2).notNull(),
  city: varchar("city", { length: 120 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  facebookUrl: varchar("facebookUrl", { length: 500 }),
  tiktokUrl: varchar("tiktokUrl", { length: 500 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  address: varchar("address", { length: 500 }),
  primaryLanguage: varchar("primaryLanguage", { length: 10 }).default("ar").notNull(),
  timezone: varchar("timezone", { length: 64 }).default("Asia/Riyadh").notNull(),
  languagesJson: text("languagesJson").default('["ar","en","fr","ur"]'),
  reservationEnabled: boolean("reservationEnabled").default(true).notNull(),
  cancellationEnabled: boolean("cancellationEnabled").default(true).notNull(),
  cancellationWindowMinutes: int("cancellationWindowMinutes").default(15).notNull(),
  reservationNoShowGraceMinutes: int("reservationNoShowGraceMinutes").default(10).notNull(),
  defaultDiscountPercent: decimal("defaultDiscountPercent", { precision: 5, scale: 2 }).default("0").notNull(),
  taxPercent: decimal("taxPercent", { precision: 5, scale: 2 }).default("0").notNull(),
  tipsEnabled: boolean("tipsEnabled").default(false).notNull(),
  tipPercent: decimal("tipPercent", { precision: 5, scale: 2 }).default("0").notNull(),
  serviceFeeEnabled: boolean("serviceFeeEnabled").default(false).notNull(),
  serviceFeePercent: decimal("serviceFeePercent", { precision: 5, scale: 2 }).default("0").notNull(),
  showBranchesOnMenu: boolean("showBranchesOnMenu").default(false).notNull(),
  menuTemplateScheduleJson: text("menuTemplateScheduleJson"),
  menuTemplateScheduleTimezone: varchar("menuTemplateScheduleTimezone", { length: 64 }).default("Asia/Riyadh").notNull(),
  menuTemplateScheduleCronTaskUid: varchar("menuTemplateScheduleCronTaskUid", { length: 65 }),
  glassGlowColor: varchar("glassGlowColor", { length: 7 }).default("#F97316").notNull(),
  glassCardOpacity: decimal("glassCardOpacity", { precision: 3, scale: 2 }).default("0.10").notNull(),
  mediaShowcaseEnabled: boolean("mediaShowcaseEnabled").default(true).notNull(),
  motionEffectsEnabled: boolean("motionEffectsEnabled").default(true).notNull(),
  menuDisplaySettingsJson: text("menuDisplaySettingsJson"),
  integrationMode: mysqlEnum("integrationMode", ["platform", "custom"]).default("platform").notNull(),
  manualPaymentMethodsJson: text("manualPaymentMethodsJson"),
  manualPaymentInstructions: varchar("manualPaymentInstructions", { length: 1000 }),
  orderModesJson: varchar("orderModesJson", { length: 255 }).default('["dineIn","takeaway","delivery","reservation","hotel"]').notNull(),
  deliveryManagementMode: mysqlEnum("deliveryManagementMode", ["restaurant", "platform"]).default("restaurant").notNull(),
  platformDeliveryEnabled: boolean("platformDeliveryEnabled").default(false).notNull(),
  reservationEventTypesJson: varchar("reservationEventTypesJson", { length: 1000 }).default('["حفل عيد ميلاد","فعالية","اجتماع","عشاء خاص"]').notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ menuTemplateScheduleTaskIdx: index("restaurants_menu_template_schedule_task_idx").on(table.menuTemplateScheduleCronTaskUid) }));

export const receiptTemplates = mysqlTable("receiptTemplates", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().unique().references(() => restaurants.id),
  headerText: varchar("headerText", { length: 240 }).default("").notNull(),
  footerText: varchar("footerText", { length: 240 }).default("شكراً لزيارتكم").notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  messageTemplatesJson: text("messageTemplatesJson"),
  escPosReceiptTemplate: text("escPosReceiptTemplate"),
  escPosKitchenTemplate: text("escPosKitchenTemplate"),
  escPosInternalTemplate: text("escPosInternalTemplate"),
  escPosExternalTemplate: text("escPosExternalTemplate"),
  escPosDeliveryTemplate: text("escPosDeliveryTemplate"),
  escPosReceiptLocalesJson: text("escPosReceiptLocalesJson"),
  escPosKitchenLocalesJson: text("escPosKitchenLocalesJson"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menuAnalyticsEvents = mysqlTable("menuAnalyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  eventType: mysqlEnum("eventType", ["menu_open", "qr_scan"]).notNull(),
  visitorKey: varchar("visitorKey", { length: 96 }),
  source: varchar("source", { length: 40 }).default("direct").notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
});

export const supportAgents = mysqlTable("supportAgents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  isActive: boolean("isActive").default(true).notNull(),
  skillsJson: text("skillsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  requesterUserId: int("requesterUserId").notNull().references(() => users.id),
  assignedAgentId: int("assignedAgentId").references(() => supportAgents.id),
  subject: varchar("subject", { length: 240 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "pending", "resolved", "closed"]).default("open").notNull(),
  firstResponseDueAt: timestamp("firstResponseDueAt"),
  resolutionDueAt: timestamp("resolutionDueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const apiWebhooks = mysqlTable("apiWebhooks", {
  id: int("id").autoincrement().primaryKey(),
  scope: mysqlEnum("scope", ["platform", "restaurant"]).notNull(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  name: varchar("name", { length: 160 }).notNull(),
  endpointUrl: varchar("endpointUrl", { length: 500 }).notNull(),
  secretHash: varchar("secretHash", { length: 180 }).notNull(),
  eventsJson: text("eventsJson"),
  status: mysqlEnum("status", ["active", "disabled"]).default("active").notNull(),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  countryCode: varchar("countryCode", { length: 2 }),
  currencyCode: varchar("currencyCode", { length: 3 }),
  currencyDecimals: int("currencyDecimals"),
  city: varchar("city", { length: 120 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  openingTime: varchar("openingTime", { length: 5 }),
  closingTime: varchar("closingTime", { length: 5 }),
  defaultTableFee: decimal("defaultTableFee", { precision: 10, scale: 2 }).default("0").notNull(),
  operatingWindowsJson: text("operatingWindowsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 180 }).notNull(),
  code: varchar("code", { length: 80 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ restaurantBranchIdx: index("hotels_restaurant_branch_idx").on(table.restaurantId, table.branchId) }));

export const hotelRooms = mysqlTable("hotelRooms", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull().references(() => hotels.id),
  roomNumber: varchar("roomNumber", { length: 40 }).notNull(),
  floor: varchar("floor", { length: 40 }),
  syncKey: varchar("syncKey", { length: 120 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ hotelRoomNumberUidx: uniqueIndex("hotel_rooms_hotel_room_number_uidx").on(table.hotelId, table.roomNumber), hotelActiveIdx: index("hotel_rooms_hotel_active_idx").on(table.hotelId, table.isActive) }));

export const deliveryZones = mysqlTable("deliveryZones", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  centerLatitude: decimal("centerLatitude", { precision: 10, scale: 7 }).notNull(),
  centerLongitude: decimal("centerLongitude", { precision: 10, scale: 7 }).notNull(),
  radiusKm: decimal("radiusKm", { precision: 8, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0").notNull(),
  minimumOrder: decimal("minimumOrder", { precision: 10, scale: 2 }).default("0").notNull(),
  polygonJson: text("polygonJson"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pickupPoints = mysqlTable("pickupPoints", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  address: varchar("address", { length: 500 }),
  openingTime: varchar("openingTime", { length: 5 }),
  closingTime: varchar("closingTime", { length: 5 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reservationSlots = mysqlTable("reservationSlots", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  dayOfWeek: int("dayOfWeek").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  capacity: int("capacity").default(1).notNull(),
  bookedCount: int("bookedCount").default(0).notNull(),
  slotDurationMinutes: int("slotDurationMinutes").default(60).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  language: varchar("language", { length: 10 }).default("ar").notNull(),
  themeMode: mysqlEnum("themeMode", ["light", "dark", "system"]).default("system").notNull(),
  themePreset: varchar("themePreset", { length: 40 }).default("nfood-sunset").notNull(),
  noteTemplatesJson: text("noteTemplatesJson"),
  notificationPreferencesJson: text("notificationPreferencesJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const guestOrderClaimOtps = mysqlTable("guestOrderClaimOtps", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  guestPhone: varchar("guestPhone", { length: 40 }).notNull(),
  codeHash: varchar("codeHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ claimOtpUserIdx: index("guest_order_claim_otps_user_idx").on(table.userId, table.guestPhone), claimOtpExpiryIdx: index("guest_order_claim_otps_expiry_idx").on(table.expiresAt) }));

export const customerAuthOtps = mysqlTable("customerAuthOtps", {
  id: int("id").autoincrement().primaryKey(),
  phone: varchar("phone", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }),
  codeHash: varchar("codeHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ customerAuthPhoneIdx: index("customer_auth_otps_phone_idx").on(table.phone), customerAuthExpiryIdx: index("customer_auth_otps_expiry_idx").on(table.expiresAt) }));

export const menuCategories = mysqlTable("menuCategories", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  kitchenSectionId: int("kitchenSectionId"),
  name: varchar("name", { length: 120 }).notNull(),
  imageUrl: text("imageUrl"),
  translationsJson: text("translationsJson"),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const menuItems = mysqlTable("menuItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  categoryId: int("categoryId").notNull(),
  kitchenSectionId: int("kitchenSectionId"),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  imageUrl: text("imageUrl"),
  translationsJson: text("translationsJson"),
  tagsJson: text("tagsJson"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  prepTimeMinutes: int("prepTimeMinutes").default(10).notNull(),
  calories: int("calories"),
});

export const favoriteMenuItems = mysqlTable("favoriteMenuItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  menuItemId: int("menuItemId").notNull().references(() => menuItems.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ favoriteUnique: uniqueIndex("favoriteMenuItems_user_restaurant_item").on(table.userId, table.restaurantId, table.menuItemId) }));

export const translationErrorLogs = mysqlTable("translationErrorLogs", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  entityType: mysqlEnum("entityType", ["category", "item", "addon"]).notNull(),
  entityId: int("entityId").notNull(),
  sourceLanguage: varchar("sourceLanguage", { length: 10 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  sourceName: text("sourceName").notNull(),
  errorMessage: text("errorMessage").notNull(),
  status: mysqlEnum("status", ["open", "resolved"]).default("open").notNull(),
  attempts: int("attempts").default(1).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export const translationGlossaryEntries = mysqlTable("translationGlossaryEntries", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  sourceLanguage: varchar("sourceLanguage", { length: 10 }).notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  sourceTerm: varchar("sourceTerm", { length: 180 }).notNull(),
  translatedTerm: varchar("translatedTerm", { length: 180 }).notNull(),
  termType: mysqlEnum("termType", ["brand", "dish", "ingredient", "modifier", "other"]).default("other").notNull(),
  isProtected: boolean("isProtected").default(true).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ glossaryUnique: uniqueIndex("translationGlossaryEntries_unique_term").on(table.restaurantId, table.sourceLanguage, table.targetLanguage, table.sourceTerm) }));

export const translationJobs = mysqlTable("translationJobs", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["queued", "running", "completed", "failed", "cancelled"]).default("queued").notNull(),
  totalItems: int("totalItems").default(0).notNull(),
  processedItems: int("processedItems").default(0).notNull(),
  successItems: int("successItems").default(0).notNull(),
  errorItems: int("errorItems").default(0).notNull(),
  currentLabel: varchar("currentLabel", { length: 220 }),
  lastError: text("lastError"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ jobRestaurantIndex: index("translationJobs_restaurant_status").on(table.restaurantId, table.status) }));

export const translationJobErrors = mysqlTable("translationJobErrors", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => translationJobs.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  entityType: mysqlEnum("entityType", ["category", "item", "addon"]).notNull(),
  entityId: int("entityId").notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  sourceName: varchar("sourceName", { length: 180 }).notNull(),
  errorMessage: text("errorMessage").notNull(),
  attempts: int("attempts").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ jobErrorIndex: index("translationJobErrors_job_restaurant").on(table.jobId, table.restaurantId) }));

export const menuItemAddons = mysqlTable("menuItemAddons", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  menuItemId: int("menuItemId").notNull().references(() => menuItems.id),
  name: varchar("name", { length: 160 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  imageUrl: text("imageUrl"),
  translationsJson: text("translationsJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const kitchenSections = mysqlTable("kitchenSections", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  name: varchar("name", { length: 120 }).notNull(),
  printerName: varchar("printerName", { length: 160 }),
  printerType: mysqlEnum("printerType", ["network", "usb", "bluetooth", "browser", "none"]).default("none").notNull(),
  printerAddress: varchar("printerAddress", { length: 255 }),
  printerPort: int("printerPort"),
  printerPurpose: mysqlEnum("printerPurpose", ["kitchen", "receipt", "general"]).default("general").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  printerStatus: mysqlEnum("printerStatus", ["unknown", "connected", "offline"]).default("unknown").notNull(),
  printerLastCheckedAt: timestamp("printerLastCheckedAt"),
  printerLastError: varchar("printerLastError", { length: 500 }),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const printerLogs = mysqlTable("printerLogs", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  kitchenSectionId: int("kitchenSectionId").notNull().references(() => kitchenSections.id),
  operation: mysqlEnum("operation", ["health_check", "test_print", "print"]).notNull(),
  result: mysqlEnum("result", ["success", "error"]).notNull(),
  message: varchar("message", { length: 500 }),
  latencyMs: int("latencyMs"),
  printDurationMs: int("printDurationMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const kitchenSectionSla = mysqlTable("kitchenSectionSla", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  kitchenSectionId: int("kitchenSectionId").notNull().references(() => kitchenSections.id),
  thresholdMinutes: int("thresholdMinutes").default(15).notNull(),
  updatedByUserId: int("updatedByUserId").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantSectionUidx: uniqueIndex("kitchenSectionSla_restaurant_section_uidx").on(table.restaurantId, table.kitchenSectionId),
}));

export const orderStatusHistory = mysqlTable("orderStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  orderId: int("orderId").notNull().references(() => orders.id),
  fromStatus: varchar("fromStatus", { length: 40 }),
  toStatus: varchar("toStatus", { length: 40 }).notNull(),
  actorUserId: int("actorUserId").references(() => users.id),
  durationSeconds: int("durationSeconds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orderCreatedAtIdx: index("orderStatusHistory_order_created_idx").on(table.orderId, table.createdAt),
  restaurantCreatedAtIdx: index("orderStatusHistory_restaurant_created_idx").on(table.restaurantId, table.createdAt),
}));

export const printerRoutingRules = mysqlTable("printerRoutingRules", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  kitchenSectionId: int("kitchenSectionId").notNull().references(() => kitchenSections.id),
  categoryId: int("categoryId"),
  menuItemId: int("menuItemId"),
  priority: int("priority").default(0).notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
});

export const seatingSections = mysqlTable("seatingSections", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 120 }).notNull(),
  seatingType: mysqlEnum("seatingType", ["indoor", "outdoor"]).default("indoor").notNull(),
  smokingAllowed: boolean("smokingAllowed").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ branchActiveIdx: index("seatingSections_branch_active_idx").on(table.branchId, table.isActive) }));

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  branchId: int("branchId").notNull(),
  kitchenSectionId: int("kitchenSectionId").references(() => kitchenSections.id),
  seatingSectionId: int("seatingSectionId").references(() => seatingSections.id),
  tableName: varchar("tableName", { length: 80 }),
  partySize: int("partySize"),
  childrenCount: int("childrenCount").default(0).notNull(),
  pickupPoint: varchar("pickupPoint", { length: 240 }),
  deliveryAddress: varchar("deliveryAddress", { length: 500 }),
  deliveryLatitude: decimal("deliveryLatitude", { precision: 10, scale: 7 }),
  deliveryLongitude: decimal("deliveryLongitude", { precision: 10, scale: 7 }),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0").notNull(),
  countryCode: varchar("countryCode", { length: 2 }).default("SA").notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  currencyDecimals: int("currencyDecimals").default(2).notNull(),
  reservationDate: timestamp("reservationDate"),
  reservationEventType: varchar("reservationEventType", { length: 160 }),
  policyAcceptedAt: timestamp("policyAcceptedAt"),
  splitBillMode: mysqlEnum("splitBillMode", ["single", "restaurant_required", "customer_choice", "friends"]).default("single").notNull(),
  splitBillGroupId: varchar("splitBillGroupId", { length: 80 }),
  hotelId: int("hotelId").references(() => hotels.id),
  hotelRoomId: int("hotelRoomId").references(() => hotelRooms.id),
  hotelName: varchar("hotelName", { length: 180 }),
  hotelRoom: varchar("hotelRoom", { length: 80 }),
  hotelFloor: varchar("hotelFloor", { length: 40 }),
  status: mysqlEnum("status", ["new", "preparing", "ready", "completed", "cancelled"]).default("new").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: varchar("cancellationReason", { length: 500 }),
  cancelledByUserId: int("cancelledByUserId").references(() => users.id),
  channel: mysqlEnum("channel", ["dine_in", "takeaway", "delivery", "reservation", "hotel"]).default("dine_in").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "bank_transfer", "online", "other"]).default("cash").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "failed", "refunded"]).default("unpaid").notNull(),
  customerId: int("customerId").references(() => users.id),
  clientRequestId: varchar("clientRequestId", { length: 64 }),
  guestName: varchar("guestName", { length: 160 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  driverId: int("driverId").references(() => users.id),
  deliveryStatus: mysqlEnum("deliveryStatus", ["unassigned", "assigned", "picked_up", "out_for_delivery", "delivered", "failed", "returned"]).default("unassigned").notNull(),
  deliveryEtaMinutes: int("deliveryEtaMinutes"),
  deliveryFailureReason: varchar("deliveryFailureReason", { length: 500 }),
  deliveryNote: varchar("deliveryNote", { length: 1000 }),
  notes: text("notes"),
  cashierNotes: text("cashierNotes"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  serviceFeeAmount: decimal("serviceFeeAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  tipAmount: decimal("tipAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantBranchStatusCreatedAtIdx: index("orders_restaurant_branch_status_created_idx").on(table.restaurantId, table.branchId, table.status, table.createdAt),
  restaurantKitchenSectionStatusIdx: index("orders_restaurant_kitchen_section_status_idx").on(table.restaurantId, table.kitchenSectionId, table.status, table.createdAt),
  restaurantCreatedAtIdx: index("orders_restaurant_created_at_idx").on(table.restaurantId, table.createdAt),
  driverDeliveryStatusIdx: index("orders_driver_delivery_status_idx").on(table.driverId, table.deliveryStatus, table.updatedAt),
  restaurantClientRequestUidx: uniqueIndex("orders_restaurant_client_request_uidx").on(table.restaurantId, table.clientRequestId),
}));

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  selectedAddonsJson: text("selectedAddonsJson"),
}, (table) => ({
  orderIdIdx: index("orderItems_order_id_idx").on(table.orderId),
}));

export const loyaltyAccounts = mysqlTable("loyaltyAccounts", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  customerId: int("customerId").notNull().references(() => users.id),
  pointsBalance: int("pointsBalance").default(0).notNull(),
  tier: varchar("tier", { length: 40 }).default("standard").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loyaltyTransactions = mysqlTable("loyaltyTransactions", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  customerId: int("customerId").notNull().references(() => users.id),
  orderId: int("orderId").references(() => orders.id),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["earn", "adjust", "redeem"]).default("earn").notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const walletAccounts = mysqlTable("walletAccounts", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ customerUnique: uniqueIndex("walletAccounts_customer_unique").on(table.customerId) }));

export const walletTopupRequests = mysqlTable("walletTopupRequests", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  walletAccountId: int("walletAccountId").notNull().references(() => walletAccounts.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "cash", "apple_pay"]).default("bank_transfer").notNull(),
  receiptUrl: text("receiptUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNote: varchar("reviewNote", { length: 500 }),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const walletTransactions = mysqlTable("walletTransactions", {
  id: int("id").autoincrement().primaryKey(),
  walletAccountId: int("walletAccountId").notNull().references(() => walletAccounts.id),
  customerId: int("customerId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["credit", "debit", "refund", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  referenceType: varchar("referenceType", { length: 60 }),
  referenceId: int("referenceId"),
  note: varchar("note", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referralRecords = mysqlTable("referralRecords", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  referrerCustomerId: int("referrerCustomerId").notNull().references(() => users.id),
  referredCustomerId: int("referredCustomerId").references(() => users.id),
  qualifyingOrderId: int("qualifyingOrderId").references(() => orders.id),
  code: varchar("code", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["pending", "qualified", "rewarded", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  qualifiedAt: timestamp("qualifiedAt"),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  orderId: int("orderId").notNull().references(() => orders.id),
  customerId: int("customerId").notNull().references(() => users.id),
  targetType: mysqlEnum("targetType", ["restaurant", "driver", "product"]).notNull(),
  targetId: int("targetId"),
  rating: int("rating").notNull(),
  comment: varchar("comment", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const inventoryItems = mysqlTable("inventoryItems", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  minimumQuantity: decimal("minimumQuantity", { precision: 10, scale: 2 }).default("0").notNull(),
});

export const restaurantTables = mysqlTable("restaurantTables", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 80 }).notNull(),
  seats: int("seats").default(2).notNull(),
  status: mysqlEnum("status", ["available", "occupied", "reserved"]).default("available").notNull(),
  seatingSectionId: int("seatingSectionId").references(() => seatingSections.id),
  tableType: varchar("tableType", { length: 80 }).default("standard").notNull(),
  minimumCharge: decimal("minimumCharge", { precision: 10, scale: 2 }).default("0").notNull(),
  tableFee: decimal("tableFee", { precision: 10, scale: 2 }).default("0").notNull(),
});

export const qrCodes = mysqlTable("qrCodes", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  type: mysqlEnum("type", ["table", "order", "waiter_call", "custom"]).notNull(),
  purpose: varchar("purpose", { length: 40 }).default("menu").notNull(),
  token: varchar("token", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  tableId: int("tableId").references(() => restaurantTables.id),
  orderId: int("orderId").references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  targetUrl: varchar("targetUrl", { length: 500 }),
  visualConfigJson: text("visualConfigJson"),
  status: mysqlEnum("status", ["active", "used", "disabled", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ qrBranchTypeIdx: index("qrCodes_branch_type_status_idx").on(table.branchId, table.type, table.status), qrTableIdx: index("qrCodes_table_idx").on(table.tableId), qrOrderIdx: index("qrCodes_order_idx").on(table.orderId) }));
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  supplier: varchar("supplier", { length: 160 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["draft", "received", "cancelled"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  workDate: varchar("workDate", { length: 16 }).notNull(),
  status: mysqlEnum("status", ["present", "absent", "late"]).default("present").notNull(),
});

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  name: varchar("name", { length: 160 }).notNull(),
  kind: mysqlEnum("kind", ["general", "birthday", "reengagement"]).default("general").notNull(),
  reengagementDays: int("reengagementDays").default(30),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "ended"]).default("draft").notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
});

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  code: varchar("code", { length: 64 }).notNull().unique(),
  discountPercent: int("discountPercent").default(0).notNull(),
  usageLimit: int("usageLimit"),
  usedCount: int("usedCount").default(0).notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  plan: varchar("plan", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled"]).default("trial").notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
  renewsAt: timestamp("renewsAt"),
});

export const subscriptionTransferReceipts = mysqlTable("subscriptionTransferReceipts", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  email: varchar("email", { length: 320 }).notNull(),
  plan: varchar("plan", { length: 80 }).notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewNote: text("reviewNote"),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});
export const packagePlans = mysqlTable("packagePlans", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  planType: mysqlEnum("planType", ["free", "monthly", "yearly", "trial", "enterprise"]).default("monthly").notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  yearlyPrice: decimal("yearlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const packagePlanFeatures = mysqlTable("packagePlanFeatures", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull().references(() => packagePlans.id),
  featureId: int("featureId").notNull().references(() => featureDefinitions.id),
  enabled: boolean("enabled").default(true).notNull(),
  featureLimit: int("featureLimit"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const restaurantMembers = mysqlTable("restaurantMembers", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  userId: int("userId").notNull().references(() => users.id),
  roleId: int("roleId").references(() => roles.id),
  branchId: int("branchId").references(() => branches.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  name: varchar("name", { length: 80 }).notNull(),
  scope: mysqlEnum("scope", ["platform", "restaurant"]).default("restaurant").notNull(),
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
});

export const rolePermissions = mysqlTable("rolePermissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull().references(() => roles.id),
  permissionId: int("permissionId").notNull().references(() => permissions.id),
});

export const employees = mysqlTable("employees", {
  branchId: int("branchId").references(() => branches.id),
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
});

export const driverApplications = mysqlTable("driverApplications", {
  id: int("id").autoincrement().primaryKey(),
  applicantUserId: int("applicantUserId").references(() => users.id),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  vehicleType: mysqlEnum("vehicleType", ["bicycle", "motorcycle", "car", "van", "other"]).notNull(),
  identityDocumentUrl: varchar("identityDocumentUrl", { length: 500 }),
  licenseDocumentUrl: varchar("licenseDocumentUrl", { length: 500 }),
  vehicleFrontUrl: varchar("vehicleFrontUrl", { length: 500 }),
  vehicleBackUrl: varchar("vehicleBackUrl", { length: 500 }),
  vehicleLeftUrl: varchar("vehicleLeftUrl", { length: 500 }),
  vehicleRightUrl: varchar("vehicleRightUrl", { length: 500 }),
  status: mysqlEnum("status", ["pending_review", "approved", "rejected"]).default("pending_review").notNull(),
  reviewNote: text("reviewNote"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const remoteWorkers = mysqlTable("remoteWorkers", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  userId: int("userId").notNull().references(() => users.id),
  role: varchar("role", { length: 80 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  vehicleType: varchar("vehicleType", { length: 40 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  lastLocationAt: timestamp("lastLocationAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ restaurantRoleAvailabilityIdx: index("remote_workers_restaurant_role_availability_idx").on(table.restaurantId, table.role, table.isActive, table.isAvailable) }));

export const remoteWorkerApplications = mysqlTable("remoteWorkerApplications", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  applicantUserId: int("applicantUserId").notNull().references(() => users.id),
  role: varchar("role", { length: 80 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const remoteTasks = mysqlTable("remoteTasks", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  assignedWorkerId: int("assignedWorkerId").references(() => remoteWorkers.id),
  type: mysqlEnum("type", ["orders", "reservations", "social", "support", "marketing", "other"]).default("other").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 8 }).default("SAR").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["manual", "bank_transfer", "wallet", "pending_gateway"]).default("manual").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "cancelled"]).default("unpaid").notNull(),
  status: mysqlEnum("status", ["published", "reviewing", "accepted", "in_progress", "submitted", "completed", "cancelled"]).default("published").notNull(),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const taskMessages = mysqlTable("taskMessages", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull().references(() => remoteTasks.id),
  senderUserId: int("senderUserId").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  slotId: int("slotId").references(() => reservationSlots.id),
  createdByUserId: int("createdByUserId").references(() => users.id),
  customerId: int("customerId").references(() => users.id),
  assignedTableId: int("assignedTableId").references(() => restaurantTables.id),
  seatingSectionId: int("seatingSectionId").references(() => seatingSections.id),
  kind: mysqlEnum("kind", ["reservation", "waitlist"]).default("reservation").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  partySize: int("partySize").default(1).notNull(),
  childrenCount: int("childrenCount").default(0).notNull(),
  policyAcceptedAt: timestamp("policyAcceptedAt"),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  reservedFor: timestamp("reservedFor").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  noShowNotifiedAt: timestamp("noShowNotifiedAt"),
});
export const testAccounts = mysqlTable("testAccounts", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  email: varchar("email", { length: 320 }).notNull().unique(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  role: mysqlEnum("role", ["admin", "restaurant_admin", "waiter", "kitchen", "bar", "cashier", "customer", "driver"]).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  endpoint: varchar("endpoint", { length: 1000 }).notNull().unique(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  taskId: int("taskId").references(() => remoteTasks.id),
  type: mysqlEnum("type", ["task", "message", "payment", "system"]).default("task").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Restaurant = typeof restaurants.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;


export const authSessions = mysqlTable("authSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sessionTokenHash: varchar("sessionTokenHash", { length: 128 }).notNull().unique(),
  deviceLabel: varchar("deviceLabel", { length: 160 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSecurity = mysqlTable("userSecurity", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  passkeyEnabled: boolean("passkeyEnabled").default(false).notNull(),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const featureDefinitions = mysqlTable("featureDefinitions", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  category: varchar("category", { length: 80 }).default("core").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["ON", "OFF", "LIMITED", "ADD_ON", "ENTERPRISE_ONLY"]).default("ON").notNull(),
  dependencyKey: varchar("dependencyKey", { length: 120 }),
  defaultLimit: int("defaultLimit"),
  isAddOn: boolean("isAddOn").default(false).notNull(),
  addonPrice: decimal("addonPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const restaurantFeatures = mysqlTable("restaurantFeatures", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  featureId: int("featureId").notNull().references(() => featureDefinitions.id),
  enabled: boolean("enabled").default(true).notNull(),
  overrideLimit: int("overrideLimit"),
  overrideValue: varchar("overrideValue", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const featureRequests = mysqlTable("featureRequests", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  requestedByUserId: int("requestedByUserId").notNull().references(() => users.id),
  featureKey: varchar("featureKey", { length: 120 }).notNull(),
  featureLabel: varchar("featureLabel", { length: 180 }).notNull(),
  requestedPrice: decimal("requestedPrice", { precision: 10, scale: 2 }),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ restaurantFeatureStatusIdx: index("feature_requests_restaurant_feature_status_idx").on(table.restaurantId, table.featureKey, table.status) }));
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  actorUserId: int("actorUserId").references(() => users.id),
  actorRole: varchar("actorRole", { length: 80 }),
  action: varchar("action", { length: 160 }).notNull(),
  entityType: varchar("entityType", { length: 80 }),
  entityId: varchar("entityId", { length: 80 }),
  outcome: mysqlEnum("outcome", ["success", "failure", "denied"]).default("success").notNull(),
  requestId: varchar("requestId", { length: 120 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});


export const vcardCardProducts = mysqlTable("vcardCardProducts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("SAR").notNull(),
  targetRole: mysqlEnum("targetRole", ["customer", "restaurant", "driver"]).default("customer").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const vcardCardOrders = mysqlTable("vcardCardOrders", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => vcardCardProducts.id),
  userId: int("userId").notNull().references(() => users.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  status: mysqlEnum("status", ["pending_payment", "paid", "cancelled", "fulfilled"]).default("pending_payment").notNull(),
  paymentProvider: varchar("paymentProvider", { length: 80 }),
  externalPaymentId: varchar("externalPaymentId", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const vcardCardCodes = mysqlTable("vcardCardCodes", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => vcardCardProducts.id),
  codeHash: varchar("codeHash", { length: 128 }).notNull().unique(),
  codeLast4: varchar("codeLast4", { length: 4 }).notNull(),
  status: mysqlEnum("status", ["available", "reserved", "bound", "disabled"]).default("available").notNull(),
  orderId: int("orderId").references(() => vcardCardOrders.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  boundAt: timestamp("boundAt"),
});
export const vcardCardBindings = mysqlTable("vcardCardBindings", {
  id: int("id").autoincrement().primaryKey(),
  codeId: int("codeId").notNull().unique().references(() => vcardCardCodes.id),
  userId: int("userId").notNull().references(() => users.id),
  customerProfileId: int("customerProfileId").references(() => customerProfiles.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  targetRole: mysqlEnum("targetRole", ["customer", "restaurant", "driver"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mediaFolders = mysqlTable("mediaFolders", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").references(() => users.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  scope: mysqlEnum("scope", ["platform", "restaurant", "user"]).default("user").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const mediaFiles = mysqlTable("mediaFiles", {
  id: int("id").autoincrement().primaryKey(),
  folderId: int("folderId").references(() => mediaFolders.id),
  ownerUserId: int("ownerUserId").references(() => users.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  scope: mysqlEnum("scope", ["platform", "restaurant", "user"]).default("user").notNull(),
  originalName: varchar("originalName", { length: 240 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull().unique(),
  publicUrl: varchar("publicUrl", { length: 700 }).notNull(),
  contentType: varchar("contentType", { length: 160 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  category: mysqlEnum("category", ["image", "menu", "logo", "document", "other"]).default("other").notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  uploadedByUserId: int("uploadedByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contentListings = mysqlTable("contentListings", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  mediaFileId: int("mediaFileId").notNull().references(() => mediaFiles.id),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  title: varchar("title", { length: 180 }).notNull(),
  description: varchar("description", { length: 1000 }),
  contentCategory: varchar("contentCategory", { length: 40 }).default("events").notNull(),
  watermarkEnabled: boolean("watermarkEnabled").default(true).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 8 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["draft", "published", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentPurchaseOrders = mysqlTable("contentPurchaseOrders", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  customerUserId: int("customerUserId").references(() => users.id),
  receiptMediaFileId: int("receiptMediaFileId").references(() => mediaFiles.id),
  itemsJson: text("itemsJson").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 8 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["unpaid", "verifying", "approved", "rejected"]).default("unpaid").notNull(),
  customerName: varchar("customerName", { length: 160 }),
  customerPhone: varchar("customerPhone", { length: 40 }),
  note: varchar("note", { length: 500 }),
  receiptExtractedAmount: decimal("receiptExtractedAmount", { precision: 10, scale: 2 }),
  receiptExtractedDate: varchar("receiptExtractedDate", { length: 40 }),
  receiptExtractionConfidence: decimal("receiptExtractionConfidence", { precision: 5, scale: 4 }),
  receiptExtractedAt: timestamp("receiptExtractedAt"),
  receiptAmountMatch: mysqlEnum("receiptAmountMatch", ["not_checked", "matched", "mismatch", "unknown"]).default("not_checked").notNull(),
  receiptAmountDifference: decimal("receiptAmountDifference", { precision: 10, scale: 2 }),
  rejectionReason: varchar("rejectionReason", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const restaurantDisplayScreens = mysqlTable("restaurantDisplayScreens", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  deviceKey: varchar("deviceKey", { length: 120 }).notNull().unique(),
  publicToken: varchar("publicToken", { length: 120 }).notNull().unique(),
  publicLinkEnabled: boolean("publicLinkEnabled").default(true).notNull(),
  kioskPinHash: varchar("kioskPinHash", { length: 220 }),
  qrEnabled: boolean("qrEnabled").default(true).notNull(),
  qrPosition: mysqlEnum("qrPosition", ["top-left", "top-right", "bottom-left", "bottom-right", "center"]).default("bottom-right").notNull(),
  qrSize: int("qrSize").default(180).notNull(),
  qrForeground: varchar("qrForeground", { length: 20 }).default("#ffffff").notNull(),
  qrBackground: varchar("qrBackground", { length: 20 }).default("#111c2e").notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  refreshSeconds: int("refreshSeconds").default(30).notNull(),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const restaurantDisplaySlides = mysqlTable("restaurantDisplaySlides", {
  id: int("id").autoincrement().primaryKey(),
  screenId: int("screenId").notNull().references(() => restaurantDisplayScreens.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  menuItemId: int("menuItemId").references(() => menuItems.id),
  mediaFileId: int("mediaFileId").references(() => mediaFiles.id),
  campaignId: int("campaignId").references(() => campaigns.id),
  title: varchar("title", { length: 180 }),
  subtitle: text("subtitle"),
  sortOrder: int("sortOrder").default(0).notNull(),
  durationSeconds: int("durationSeconds").default(8).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const restaurantDisplayMatchModes = mysqlTable("restaurantDisplayMatchModes", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["idle", "live"]).default("idle").notNull(),
  headline: varchar("headline", { length: 180 }).notNull(),
  body: text("body"),
  callToAction: varchar("callToAction", { length: 120 }),
  mediaFileId: int("mediaFileId").references(() => mediaFiles.id),
  qrTargetUrl: varchar("qrTargetUrl", { length: 700 }),
  countdownEndsAt: timestamp("countdownEndsAt"),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const campaignContents = mysqlTable("campaignContents", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => campaigns.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  menuItemId: int("menuItemId").references(() => menuItems.id),
  mediaFileId: int("mediaFileId").references(() => mediaFiles.id),
  locale: varchar("locale", { length: 8 }).default("ar").notNull(),
  headline: varchar("headline", { length: 180 }).notNull(),
  body: text("body"),
  callToAction: varchar("callToAction", { length: 120 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
