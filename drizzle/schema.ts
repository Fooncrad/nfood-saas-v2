import { foreignKey, int, index, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, uniqueIndex } from "drizzle-orm/mysql-core";

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
  passwordHash: varchar("passwordHash", { length: 255 }),
  accountRole: mysqlEnum("accountRole", ["admin", "restaurant_admin", "waiter", "kitchen", "bar", "cashier", "customer", "driver"]).default("customer").notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  birthDate: timestamp("birthDate"),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("ar").notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 128 }),
  emailVerificationExpiresAt: timestamp("emailVerificationExpiresAt"),
  deletedAt: timestamp("deletedAt"),
});

export const customerProfiles = mysqlTable("customerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  isPublic: boolean("isPublic").default(false).notNull(),
  defaultContentVisibility: mysqlEnum("defaultContentVisibility", ["public", "friends"]).default("public").notNull(),
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
  productsJson: text("productsJson"),
  paymentMethodsJson: text("paymentMethodsJson"),
  qrVisualConfigJson: text("qrVisualConfigJson"),
  profileVisibility: mysqlEnum("profileVisibility", ["public", "private", "unlisted", "pin"]).default("private").notNull(),
  profilePinHash: varchar("profilePinHash", { length: 220 }),
  tiktokUrl: varchar("tiktokUrl", { length: 500 }),
  snapchatUrl: varchar("snapchatUrl", { length: 500 }),
  youtubeUrl: varchar("youtubeUrl", { length: 500 }),
  linksJson: text("linksJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const customerBusinessRelationships = mysqlTable("customer_business_relationships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  acquisitionSource: mysqlEnum("acquisition_source", ["order", "reservation", "service", "marketplace", "profile", "other"]).default("other").notNull(),
  isAcquisitionEntity: boolean("is_acquisition_entity").default(false).notNull(),
  contactAlias: varchar("contact_alias", { length: 80 }).notNull(),
  contactConsent: boolean("contact_consent").default(true).notNull(),
  revealPhoneConsent: boolean("reveal_phone_consent").default(false).notNull(),
  revealEmailConsent: boolean("reveal_email_consent").default(false).notNull(),
  firstInteractionAt: timestamp("first_interaction_at").defaultNow().notNull(),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerBusinessUnique: uniqueIndex("customer_business_unique").on(table.userId, table.entityId),
  entityCustomerIdx: index("entity_customer_idx").on(table.entityId, table.lastInteractionAt),
}));

export const restaurants = mysqlTable("restaurants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  customDomain: varchar("customDomain", { length: 255 }).unique(),
  barcode: varchar("barcode", { length: 64 }).notNull().unique(),
  posSupervisorPinHash: varchar("posSupervisorPinHash", { length: 220 }),
  status: mysqlEnum("status", ["active", "trial", "suspended"]).default("trial").notNull(),
  plan: varchar("plan", { length: 64 }).default("Growth").notNull(),
  brandName: varchar("brandName", { length: 160 }),
  brandColor: varchar("brandColor", { length: 7 }).default("#e76f3c"),
  brandAccentColor: varchar("brandAccentColor", { length: 7 }).default("#f59e0b").notNull(),
  brandTextColor: varchar("brandTextColor", { length: 7 }).default("#172033").notNull(),
  brandFontFamily: varchar("brandFontFamily", { length: 120 }).default("IBM Plex Sans Arabic").notNull(),
  brandHeadingFontFamily: varchar("brandHeadingFontFamily", { length: 120 }).default("IBM Plex Sans Arabic").notNull(),
  themeMode: mysqlEnum("themeMode", ["light", "dark", "system"]).default("light").notNull(),
  themePreset: varchar("themePreset", { length: 40 }).default("nfood-sunset").notNull(),
  menuTemplate: mysqlEnum("menuTemplate", ["editorial", "bistro", "glass", "customer", "market", "signature"]).default("editorial").notNull(),
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
  customPagesJson: text("customPagesJson"),
  termsOfService: text("termsOfService"),
  privacyPolicy: text("privacyPolicy"),
  refundPolicy: text("refundPolicy"),
  phone: varchar("phone", { length: 40 }),
  country: varchar("country", { length: 120 }),
  countryCode: varchar("countryCode", { length: 2 }).default("SA").notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  currencyDecimals: int("currencyDecimals").default(2).notNull(),
  taxNumber: varchar("taxNumber", { length: 80 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  locationUrl: varchar("locationUrl", { length: 1000 }),
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
  reservationMaxPerDay: int("reservationMaxPerDay"),
  reservationDepositEnabled: boolean("reservationDepositEnabled").default(false).notNull(),
  reservationDepositAmount: decimal("reservationDepositAmount", { precision: 10, scale: 2 }).default("0").notNull(),
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
  allowMultipleDriverOrders: boolean("allowMultipleDriverOrders").default(true).notNull(),
  platformDeliveryEnabled: boolean("platformDeliveryEnabled").default(false).notNull(),
  reservationEventTypesJson: varchar("reservationEventTypesJson", { length: 1000 }).default('["حفل عيد ميلاد","فعالية","اجتماع","عشاء خاص"]').notNull(),
  waiterCallEnabled: boolean("waiterCallEnabled").default(true).notNull(),
  waiterCallCooldownMinutes: int("waiterCallCooldownMinutes").default(10).notNull(),
  waiterCallAlertMode: mysqlEnum("waiterCallAlertMode", ["none", "sound", "vibrate", "both"]).default("both").notNull(),
  waiterCallInAppEnabled: boolean("waiterCallInAppEnabled").default(true).notNull(),
  waiterCallEmailEnabled: boolean("waiterCallEmailEnabled").default(false).notNull(),
  reservationHelpText: text("reservationHelpText"),
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
export const supportTicketMessages = mysqlTable("support_ticket_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  senderUserId: int("sender_user_id").notNull().references(() => users.id),
  senderRole: mysqlEnum("sender_role", ["customer", "business", "platform"]).notNull(),
  body: text("body").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 1000 }),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  ticketCreatedIdx: index("support_ticket_messages_ticket_created_idx").on(table.ticketId, table.createdAt),
}));

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

export const businessDepartments = mysqlTable("business_departments", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
  branchId: int("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 80 }),
  isActive: boolean("is_active").default(true).notNull(),
  modulesJson: text("modules_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  branchIdx: index("business_departments_branch_idx").on(table.branchId, table.isActive),
  restaurantIdx: index("business_departments_restaurant_idx").on(table.restaurantId),
}));

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

export const reservationBlackoutDates = mysqlTable("reservationBlackoutDates", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  blackoutDate: varchar("blackoutDate", { length: 10 }).notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  branchDateUnique: uniqueIndex("reservation_blackout_branch_date_unique").on(table.branchId, table.blackoutDate),
  restaurantDateIdx: index("reservation_blackout_restaurant_date_idx").on(table.restaurantId, table.blackoutDate),
}));

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

export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ resetUserExpiryIdx: index("password_reset_tokens_user_expiry_idx").on(table.userId, table.expiresAt) }));

export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  scope: mysqlEnum("scope", ["platform", "restaurant"]).default("restaurant").notNull(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  eventKey: varchar("eventKey", { length: 100 }).notNull(),
  locale: varchar("locale", { length: 10 }).default("ar").notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  htmlBody: text("htmlBody").notNull(),
  textBody: text("textBody").notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  updatedByUserId: int("updatedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ emailTemplateLookupIdx: index("email_templates_scope_restaurant_event_locale_idx").on(table.scope, table.restaurantId, table.eventKey, table.locale) }));

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
  isVisible: boolean("isVisible").default(true).notNull(),
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
  additionalImagesJson: text("additionalImagesJson"),
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

export const favoriteRestaurants = mysqlTable("favoriteRestaurants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ favoriteUnique: uniqueIndex("favoriteRestaurants_user_restaurant").on(table.userId, table.restaurantId) }));

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

export const uiTranslationEntries = mysqlTable("uiTranslationEntries", {
  id: int("id").autoincrement().primaryKey(),
  translationKey: varchar("translationKey", { length: 220 }).notNull(),
  sourceText: text("sourceText").notNull(),
  sourceLanguage: varchar("sourceLanguage", { length: 10 }).default("ar").notNull(),
  targetLanguage: varchar("targetLanguage", { length: 10 }).notNull(),
  translatedText: text("translatedText"),
  context: varchar("context", { length: 180 }),
  status: mysqlEnum("status", ["untranslated", "draft", "published", "ignored"]).default("untranslated").notNull(),
  occurrenceCount: int("occurrenceCount").default(1).notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  updatedByUserId: int("updatedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uiTranslationUnique: uniqueIndex("ui_translation_key_target_unique").on(table.translationKey, table.targetLanguage),
  uiTranslationStatus: index("ui_translation_status_idx").on(table.status, table.targetLanguage),
}));

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
  groupName: varchar("groupName", { length: 120 }).default("الإضافات الاختيارية").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isRequired: boolean("isRequired").default(false).notNull(),
  minSelections: int("minSelections").default(0).notNull(),
  maxSelections: int("maxSelections").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
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
  routingSectionIdsJson: text("routingSectionIdsJson"),
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
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded", "cancelled"]).default("unpaid").notNull(),
  receiptPrintStatus: mysqlEnum("receiptPrintStatus", ["not_printed", "queued", "printed", "failed"]).default("not_printed").notNull(),
  receiptPrintedAt: timestamp("receiptPrintedAt"),
  receiptPrintError: varchar("receiptPrintError", { length: 500 }),
  paymentSplitsJson: text("paymentSplitsJson"),
  customerId: int("customerId").references(() => users.id),
  clientRequestId: varchar("clientRequestId", { length: 64 }),
  guestName: varchar("guestName", { length: 160 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  driverId: int("driverId").references(() => users.id),
  deliveryStatus: mysqlEnum("deliveryStatus", ["unassigned", "assigned", "picked_up", "out_for_delivery", "delivered", "failed", "returned"]).default("unassigned").notNull(),
  restaurantAcceptedAt: timestamp("restaurantAcceptedAt"),
  restaurantReadyAt: timestamp("restaurantReadyAt"),
  driverPickedUpAt: timestamp("driverPickedUpAt"),
  cashDebtAmount: decimal("cashDebtAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  driverEarningAmount: decimal("driverEarningAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  driverEarningType: mysqlEnum("driverEarningType", ["commission", "salary", "none"]).default("none").notNull(),
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

export const deliveryMessages = mysqlTable("deliveryMessages", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  senderUserId: int("senderUserId").notNull().references(() => users.id),
  senderRole: mysqlEnum("senderRole", ["customer", "driver", "restaurant", "admin"]).notNull(),
  body: varchar("body", { length: 1000 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
}, (table) => ({ deliveryMessageOrderIdx: index("delivery_messages_order_created_idx").on(table.orderId, table.createdAt) }));

export const deliveryLocationAccess = mysqlTable("deliveryLocationAccess", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id),
  driverUserId: int("driverUserId").notNull().references(() => users.id),
  grantedByUserId: int("grantedByUserId").references(() => users.id),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ deliveryLocationOrderIdx: index("delivery_location_order_driver_idx").on(table.orderId, table.driverUserId, table.expiresAt) }));

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

export const waiterTableAssignments = mysqlTable("waiterTableAssignments", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  waiterUserId: int("waiterUserId").notNull().references(() => users.id),
  tableId: int("tableId").notNull().references(() => restaurantTables.id),
  assignedByUserId: int("assignedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  waiterTableUnique: uniqueIndex("waiter_table_assignments_unique").on(table.waiterUserId, table.tableId),
  branchWaiterIdx: index("waiter_table_assignments_branch_waiter_idx").on(table.branchId, table.waiterUserId),
}));

export const waiterCalls = mysqlTable("waiterCalls", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  tableId: int("tableId").notNull().references(() => restaurantTables.id),
  waiterUserId: int("waiterUserId").notNull().references(() => users.id),
  reason: varchar("reason", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["active", "acknowledged", "closed", "expired"]).default("active").notNull(),
  customerName: varchar("customerName", { length: 160 }),
  publicToken: varchar("publicToken", { length: 128 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  closedAt: timestamp("closedAt"),
}, (table) => ({
  tableStatusIdx: index("waiter_calls_table_status_idx").on(table.tableId, table.status),
  waiterStatusIdx: index("waiter_calls_waiter_status_idx").on(table.waiterUserId, table.status),
  branchCreatedIdx: index("waiter_calls_branch_created_idx").on(table.branchId, table.createdAt),
}));

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

export const scopedRoleAssignments = mysqlTable("scoped_role_assignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  restaurantId: int("restaurant_id").references(() => restaurants.id, { onDelete: "cascade" }),
  branchId: int("branch_id").references(() => branches.id, { onDelete: "cascade" }),
  departmentId: int("department_id").references(() => businessDepartments.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("scoped_role_assignments_user_idx").on(table.userId, table.isActive),
  scopeIdx: index("scoped_role_assignments_scope_idx").on(table.restaurantId, table.branchId, table.departmentId),
}));

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
  compensationType: mysqlEnum("compensationType", ["commission", "salary"]).default("commission").notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("0").notNull(),
  salaryAmount: decimal("salaryAmount", { precision: 10, scale: 2 }).default("0").notNull(),
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
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded", "cancelled"]).default("unpaid").notNull(),
  invoicePrintStatus: mysqlEnum("invoicePrintStatus", ["not_printed", "queued", "printed", "failed"]).default("not_printed").notNull(),
  invoicePrintedAt: timestamp("invoicePrintedAt"),
  invoicePrintError: varchar("invoicePrintError", { length: 500 }),
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
  status: mysqlEnum("status", ["pending", "confirmed", "rejected", "seated", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  rejectionReason: varchar("rejectionReason", { length: 500 }),
  isTest: boolean("isTest").default(false).notNull(),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  depositStatus: mysqlEnum("depositStatus", ["not_required", "pending", "paid", "refunded"]).default("not_required").notNull(),
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
  permissionsJson: text("permissionsJson"),
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
export const customerBenefitFeatures = mysqlTable("customerBenefitFeatures", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  label: varchar("label", { length: 160 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 80 }).default("customer").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isAddOn: boolean("isAddOn").default(false).notNull(),
  addonPrice: decimal("addonPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const customerBenefitPlans = mysqlTable("customerBenefitPlans", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  yearlyPrice: decimal("yearlyPrice", { precision: 10, scale: 2 }).default("0").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const customerBenefitPlanFeatures = mysqlTable("customerBenefitPlanFeatures", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  featureId: int("featureId").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  planFeatureUnique: uniqueIndex("customer_benefit_plan_feature_unique").on(table.planId, table.featureId),
  planForeignKey: foreignKey({ name: "cbpf_plan_fk", columns: [table.planId], foreignColumns: [customerBenefitPlans.id] }),
  featureForeignKey: foreignKey({ name: "cbpf_feature_fk", columns: [table.featureId], foreignColumns: [customerBenefitFeatures.id] }),
}));

export const customerBenefitSubscriptions = mysqlTable("customerBenefitSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "pending", "cancelled", "expired"]).default("active").notNull(),
  startsAt: timestamp("startsAt").defaultNow().notNull(),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerSubscriptionIdx: index("customer_benefit_subscription_user_status_idx").on(table.userId, table.status),
  userForeignKey: foreignKey({ name: "cbs_user_fk", columns: [table.userId], foreignColumns: [users.id] }),
  planForeignKey: foreignKey({ name: "cbs_plan_fk", columns: [table.planId], foreignColumns: [customerBenefitPlans.id] }),
}));

export const customerBenefitRequests = mysqlTable("customerBenefitRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  featureId: int("featureId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  requestedPrice: decimal("requestedPrice", { precision: 10, scale: 2 }),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  notes: text("notes"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  customerFeatureStatusIdx: index("customer_benefit_request_user_feature_status_idx").on(table.userId, table.featureId, table.status),
  userForeignKey: foreignKey({ name: "cbr_user_fk", columns: [table.userId], foreignColumns: [users.id] }),
  featureForeignKey: foreignKey({ name: "cbr_feature_fk", columns: [table.featureId], foreignColumns: [customerBenefitFeatures.id] }),
  reviewerForeignKey: foreignKey({ name: "cbr_reviewer_fk", columns: [table.reviewedByUserId], foreignColumns: [users.id] }),
}));

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
  paymentMethod: mysqlEnum("paymentMethod", ["manual", "bank_transfer", "card", "online", "wallet", "other"]).default("manual").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded", "cancelled"]).default("unpaid").notNull(),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  paidAt: timestamp("paidAt"),
  refundedAt: timestamp("refundedAt"),
  printStatus: mysqlEnum("printStatus", ["not_printed", "queued", "printed", "failed"]).default("not_printed").notNull(),
  printedAt: timestamp("printedAt"),
  printError: varchar("printError", { length: 500 }),
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
  virusScanStatus: mysqlEnum("virusScanStatus", ["pending", "clean", "infected", "unavailable"]).default("pending").notNull(),
  virusScanName: varchar("virusScanName", { length: 160 }),
  virusScanVersion: varchar("virusScanVersion", { length: 160 }),
  virusScannedAt: timestamp("virusScannedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contentModerationReviews = mysqlTable("contentModerationReviews", {
  id: int("id").autoincrement().primaryKey(),
  mediaFileId: int("mediaFileId").notNull().unique().references(() => mediaFiles.id),
  status: mysqlEnum("status", ["pending", "approved", "blocked"]).default("pending").notNull(),
  reason: varchar("reason", { length: 500 }),
  scanVersion: varchar("scanVersion", { length: 40 }).default("rules-v1").notNull(),
  captureMethod: mysqlEnum("captureMethod", ["camera", "file"]).default("file").notNull(),
  capturedAt: timestamp("capturedAt"),
  deviceModel: varchar("deviceModel", { length: 160 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  exifJson: text("exifJson"),
  watermarkApplied: boolean("watermarkApplied").default(false).notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ moderationStatusIdx: index("content_moderation_status_idx").on(table.status, table.updatedAt) }));

export const contentListings = mysqlTable("contentListings", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  mediaFileId: int("mediaFileId").notNull().references(() => mediaFiles.id),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  title: varchar("title", { length: 180 }).notNull(),
  description: varchar("description", { length: 1000 }),
  contentCategory: varchar("contentCategory", { length: 40 }).default("events").notNull(),
  visibility: mysqlEnum("visibility", ["public", "friends"]).default("public").notNull(),
  foodTagsJson: text("foodTagsJson"),
  watermarkEnabled: boolean("watermarkEnabled").default(true).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 8 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["draft", "published", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentFoodTags = mysqlTable("contentFoodTags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 80 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const contentListingInvites = mysqlTable("contentListingInvites", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull().references(() => contentListings.id),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  invitedUserId: int("invitedUserId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "accepted", "revoked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const commerceFundingAccounts = mysqlTable("commerceFundingAccounts", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  accountType: mysqlEnum("accountType", ["merchant_purchase", "customer_purchase", "platform_purchase"]).default("merchant_purchase").notNull(),
  currencyCode: varchar("currencyCode", { length: 8 }).default("SAR").notNull(),
  availableBalance: decimal("availableBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "closed"]).default("active").notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerTypeIdx: index("commerce_funding_owner_type_idx").on(table.ownerUserId, table.accountType),
  restaurantIdx: index("commerce_funding_restaurant_idx").on(table.restaurantId),
}));
export const contentPurchaseOrders = mysqlTable("contentPurchaseOrders", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  customerUserId: int("customerUserId").references(() => users.id),
  buyerUserId: int("buyerUserId").references(() => users.id),
  buyerType: mysqlEnum("buyerType", ["customer", "merchant"]).default("customer").notNull(),
  paymentSource: mysqlEnum("paymentSource", ["wallet", "manual", "purchase_account", "external_channel"]).default("manual").notNull(),
  purchaseAccountId: int("purchaseAccountId").references(() => commerceFundingAccounts.id),
  operatingFundsExcluded: boolean("operatingFundsExcluded").default(true).notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }),
  paymentMethod: mysqlEnum("paymentMethod", ["manual", "bank_transfer", "card", "online", "wallet", "other"]).default("manual").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "partially_refunded", "refunded", "cancelled"]).default("unpaid").notNull(),
  refundAmount: decimal("refundAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  paidAt: timestamp("paidAt"),
  refundedAt: timestamp("refundedAt"),
  invoicePrintStatus: mysqlEnum("invoicePrintStatus", ["not_printed", "queued", "printed", "failed"]).default("not_printed").notNull(),
  invoicePrintedAt: timestamp("invoicePrintedAt"),
  invoicePrintError: varchar("invoicePrintError", { length: 500 }),
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
export const contentPurchaseEntitlements = mysqlTable("contentPurchaseEntitlements", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull().references(() => contentPurchaseOrders.id),
  listingId: int("listingId").notNull().references(() => contentListings.id),
  sourceMediaFileId: int("sourceMediaFileId").notNull().references(() => mediaFiles.id),
  buyerUserId: int("buyerUserId").notNull().references(() => users.id),
  deliveredAt: timestamp("deliveredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  buyerDeliveredIdx: index("content_entitlements_buyer_delivered_idx").on(table.buyerUserId, table.deliveredAt),
  purchaseListingUnique: uniqueIndex("content_entitlements_purchase_listing_uidx").on(table.purchaseOrderId, table.listingId),
}));

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
  copyBackground: varchar("copyBackground", { length: 20 }).default("#07111fcc").notNull(),
  adBackground: varchar("adBackground", { length: 20 }).default("#111c2ee6").notNull(),
  displayLayout: mysqlEnum("displayLayout", ["single", "double", "triple", "quad", "split"]).default("single").notNull(),
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
  externalImageUrl: varchar("externalImageUrl", { length: 500 }),
  externalVideoUrl: varchar("externalVideoUrl", { length: 700 }),
  videoLoop: boolean("videoLoop").default(true).notNull(),
  campaignId: int("campaignId").references(() => campaigns.id),
  title: varchar("title", { length: 180 }),
  subtitle: text("subtitle"),
  titleEn: varchar("titleEn", { length: 180 }),
  subtitleEn: text("subtitleEn"),
  sortOrder: int("sortOrder").default(0).notNull(),
  durationSeconds: int("durationSeconds").default(8).notNull(),
  transitionEffect: mysqlEnum("transitionEffect", ["fade", "zoom", "slide", "kenburns"]).default("fade").notNull(),
  badgeText: varchar("badgeText", { length: 64 }),
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


export const financialLedgerEntries = mysqlTable("financialLedgerEntries", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  branchId: int("branchId").references(() => branches.id),
  userId: int("userId").references(() => users.id),
  createdByUserId: int("createdByUserId").references(() => users.id),
  section: varchar("section", { length: 80 }).notNull(),
  entryType: mysqlEnum("entryType", ["payment", "refund", "cancellation", "deposit", "withdrawal", "adjustment"]).notNull(),
  direction: mysqlEnum("direction", ["credit", "debit"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["posted", "voided"]).default("posted").notNull(),
  referenceType: varchar("referenceType", { length: 60 }),
  referenceId: int("referenceId"),
  fundingAccountId: int("fundingAccountId").references(() => commerceFundingAccounts.id),
  idempotencyKey: varchar("idempotencyKey", { length: 120 }),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  scopeDateIdx: index("financial_ledger_scope_date_idx").on(table.restaurantId, table.branchId, table.createdAt),
  referenceIdx: index("financial_ledger_reference_idx").on(table.referenceType, table.referenceId),
  fundingAccountIdx: index("financial_ledger_funding_account_idx").on(table.fundingAccountId, table.createdAt),
  idempotencyUnique: uniqueIndex("financial_ledger_idempotency_unique").on(table.idempotencyKey),
}));

export const driverSecurityDeposits = mysqlTable("driverSecurityDeposits", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  driverUserId: int("driverUserId").notNull().references(() => users.id),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  openingBalance: decimal("openingBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  currentBalance: decimal("currentBalance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["active", "closed"]).default("active").notNull(),
  note: varchar("note", { length: 500 }),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  driverRestaurantUnique: uniqueIndex("driver_security_deposits_driver_restaurant_unique").on(table.restaurantId, table.driverUserId),
}));

export const driverSecurityDepositTransactions = mysqlTable("driverSecurityDepositTransactions", {
  id: int("id").autoincrement().primaryKey(),
  depositAccountId: int("depositAccountId").notNull().references(() => driverSecurityDeposits.id),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  driverUserId: int("driverUserId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["deposit", "withdrawal", "hold", "release", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balanceAfter", { precision: 12, scale: 2 }).notNull(),
  referenceType: varchar("referenceType", { length: 60 }),
  referenceId: int("referenceId"),
  note: varchar("note", { length: 500 }),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  depositDateIdx: index("driver_deposit_transactions_date_idx").on(table.depositAccountId, table.createdAt),
}));


export const trustedDevices = mysqlTable("trustedDevices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fingerprintHash: varchar("fingerprintHash", { length: 128 }).notNull(),
  deviceLabel: varchar("deviceLabel", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["pending", "active", "revoked", "blocked"]).default("pending").notNull(),
  firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  approvedByUserId: int("approvedByUserId").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const customerCardRequests = mysqlTable("customerCardRequests", {
  id: int("id").autoincrement().primaryKey(),
  requesterUserId: int("requesterUserId").notNull().references(() => users.id),
  customerProfileId: int("customerProfileId").references(() => customerProfiles.id),
  bindingId: int("bindingId").references(() => vcardCardBindings.id),
  requestType: mysqlEnum("requestType", ["print", "replace_key", "bind_key", "update_key"]).default("print").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "fulfilled", "cancelled"]).default("pending").notNull(),
  reason: text("reason"),
  adminNote: text("adminNote"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("SAR").notNull(),
  resolvedByUserId: int("resolvedByUserId").references(() => users.id),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const whiteLabelWorkspaces = mysqlTable("whiteLabelWorkspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerUserId: int("ownerUserId").notNull().references(() => users.id),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 16 }).default("#E76F3C").notNull(),
  accentColor: varchar("accentColor", { length: 16 }).default("#172033").notNull(),
  customDomain: varchar("customDomain", { length: 255 }),
  defaultLocale: varchar("defaultLocale", { length: 10 }).default("ar").notNull(),
  enabledModulesJson: text("enabledModulesJson").notNull(),
  status: mysqlEnum("status", ["draft", "active", "suspended"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugUnique: uniqueIndex("white_label_workspace_slug_uq").on(table.slug),
  ownerStatusIdx: index("white_label_workspace_owner_status_idx").on(table.ownerUserId, table.status),
  domainIdx: index("white_label_workspace_domain_idx").on(table.customDomain),
}));

export const restaurantMenuLayoutTemplates = mysqlTable("restaurantMenuLayoutTemplates", {
  id: int("id").autoincrement().primaryKey(),
  restaurantId: int("restaurantId").notNull().references(() => restaurants.id),
  name: varchar("name", { length: 120 }).notNull(),
  settingsJson: text("settingsJson").notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  restaurantUpdatedIdx: index("restaurant_menu_layout_templates_restaurant_updated_idx").on(table.restaurantId, table.updatedAt),
  restaurantNameIdx: index("restaurant_menu_layout_templates_restaurant_name_idx").on(table.restaurantId, table.name),
}));

export const uiTranslationHistory = mysqlTable("uiTranslationHistory", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entryId").notNull().references(() => uiTranslationEntries.id),
  translationKey: varchar("translationKey", { length: 220 }).notNull(),
  sourceTextBefore: text("sourceTextBefore"),
  sourceTextAfter: text("sourceTextAfter"),
  translatedTextBefore: text("translatedTextBefore"),
  translatedTextAfter: text("translatedTextAfter"),
  statusBefore: varchar("statusBefore", { length: 20 }),
  statusAfter: varchar("statusAfter", { length: 20 }),
  action: mysqlEnum("action", ["manual_edit", "auto_draft", "bulk_publish", "csv_import"]).notNull(),
  changedByUserId: int("changedByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uiTranslationHistoryEntry: index("ui_translation_history_entry_idx").on(table.entryId, table.createdAt),
  uiTranslationHistoryAction: index("ui_translation_history_action_idx").on(table.action, table.createdAt),
}));

export const PLATFORM_SECTOR_KEYS = [
  "restaurant",
  "vegetables",
  "grocery",
  "laundry",
  "automotive",
  "beauty_salon",
  "public_works",
  "fashion",
  "sweets",
] as const;
export type PlatformSectorKey = (typeof PLATFORM_SECTOR_KEYS)[number];

export const PLAN_TIERS = ["Basic", "Pro", "Enterprise"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const platformEntities = mysqlTable("platform_entities", {
  id: varchar("id", { length: 30 }).primaryKey(),
  customerName: text("customer_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  // Global tenant boundary: every marketplace business belongs to exactly one country.
  countryCode: varchar("country_code", { length: 2 }).default("SA").notNull(),
  city: varchar("city", { length: 120 }),
  timezone: varchar("timezone", { length: 64 }).default("Asia/Riyadh").notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).default("SAR").notNull(),
  primaryLanguage: varchar("primary_language", { length: 10 }).default("ar").notNull(),
  sector: varchar("sector", { length: 80 }).default("restaurant").notNull(),
  status: boolean("status").default(true).notNull(),
  plan: mysqlEnum("plan", PLAN_TIERS).default("Basic").notNull(),
  taxId: varchar("tax_id", { length: 50 }).notNull(),
  licensingFee: decimal("licensing_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  platformEntitiesSectorIdx: index("platform_entities_sector_idx").on(table.sector, table.status),
  platformEntitiesCountryIdx: index("platform_entities_country_idx").on(table.countryCode, table.status),
  platformEntitiesCountrySectorIdx: index("platform_entities_country_sector_idx").on(table.countryCode, table.sector, table.status),
  platformEntitiesEmailIdx: index("platform_entities_email_idx").on(table.email),
}));

export const digitalCatalogs = mysqlTable("digital_catalogs", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  catalogUrl: text("catalog_url").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  totalItems: int("total_items").default(0).notNull(),
  catalogEnabled: boolean("catalog_enabled").default(true).notNull(),
  isFreelancer: boolean("is_freelancer").default(false).notNull(),
  isPhotographer: boolean("is_photographer").default(false).notNull(),
  storageUsed: int("storage_used").default(0).notNull(),
  storageLimit: int("storage_limit").default(1024).notNull(),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
}, (table) => ({
  digitalCatalogsEntityIdx: index("digital_catalogs_entity_idx").on(table.entityId),
  digitalCatalogsStorageIdx: index("digital_catalogs_storage_idx").on(table.isFreelancer, table.isPhotographer),
}));

export const governanceAuditLogs = mysqlTable("governance_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: varchar("admin_id", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 30 }).references(() => platformEntities.id, { onDelete: "set null" }),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  previousState: text("previous_state"),
  nextState: text("next_state"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
}, (table) => ({
  governanceAuditLogsEntityIdx: index("governance_audit_logs_entity_idx").on(table.entityId, table.performedAt),
  governanceAuditLogsActionIdx: index("governance_audit_logs_action_idx").on(table.actionType, table.performedAt),
}));

// ── Marketplace Sectors (dynamic catalog, not hard-coded enum) ────────────
export const marketplaceSectors = mysqlTable("marketplace_sectors", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  labelAr: varchar("labelAr", { length: 120 }).notNull(),
  labelEn: varchar("labelEn", { length: 120 }).notNull(),
  labelFr: varchar("labelFr", { length: 120 }).notNull(),
  icon: varchar("icon", { length: 40 }).default("store").notNull(),
  color: varchar("color", { length: 16 }).default("#E76F3C").notNull(),
  descriptionAr: varchar("descriptionAr", { length: 500 }),
  descriptionEn: varchar("descriptionEn", { length: 500 }),
  descriptionFr: varchar("descriptionFr", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  marketplaceSectorsSlugIdx: index("marketplace_sectors_slug_idx").on(table.slug),
  marketplaceSectorsActiveIdx: index("marketplace_sectors_active_idx").on(table.isActive, table.sortOrder),
}));

// ── Marketplace Listings (products / services from providers) ─────────────
export const marketplaceListings = mysqlTable("marketplace_listings", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  sectorId: int("sector_id").notNull().references(() => marketplaceSectors.id),
  restaurantId: int("restaurantId").references(() => restaurants.id),
  title: varchar("title", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  unit: varchar("unit", { length: 40 }).default("piece").notNull(),
  stockQuantity: int("stockQuantity"),
  status: mysqlEnum("status", ["draft", "active", "paused", "sold_out"]).default("draft").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  tagsJson: text("tagsJson"),
  metadataJson: text("metadataJson"),
  actionType: mysqlEnum("actionType", ["buy", "book", "order", "service", "contact", "visit"]).default("visit").notNull(),
  actionUrl: varchar("actionUrl", { length: 1000 }),
  actionLabelAr: varchar("actionLabelAr", { length: 120 }),
  actionLabelEn: varchar("actionLabelEn", { length: 120 }),
  actionLabelFr: varchar("actionLabelFr", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  marketplaceListingsEntityIdx: index("marketplace_listings_entity_idx").on(table.entityId),
  marketplaceListingsSectorIdx: index("marketplace_listings_sector_idx").on(table.sectorId, table.status),
  marketplaceListingsRestaurantIdx: index("marketplace_listings_restaurant_idx").on(table.restaurantId),
  marketplaceListingsFeaturedIdx: index("marketplace_listings_featured_idx").on(table.isFeatured, table.sortOrder),
}));

// ── Universal storefront extensions ───────────────────────────────────────
export const marketplaceListingVariants = mysqlTable("marketplace_listing_variants", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listing_id").notNull().references(() => marketplaceListings.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 120 }),
  barcode: varchar("barcode", { length: 120 }),
  option1Name: varchar("option1_name", { length: 80 }),
  option1Value: varchar("option1_value", { length: 120 }),
  option2Name: varchar("option2_name", { length: 80 }),
  option2Value: varchar("option2_value", { length: 120 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  stockQuantity: int("stock_quantity").default(0).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  metadataJson: text("metadata_json"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listingIdx: index("marketplace_variants_listing_idx").on(table.listingId, table.isActive),
  skuIdx: index("marketplace_variants_sku_idx").on(table.sku),
}));

export const marketplaceStorefrontSettings = mysqlTable("marketplace_storefront_settings", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().unique().references(() => platformEntities.id, { onDelete: "cascade" }),
  templateKey: varchar("template_key", { length: 80 }).default("auto").notNull(),
  heroTitle: varchar("hero_title", { length: 220 }),
  heroSubtitle: varchar("hero_subtitle", { length: 500 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  coverUrl: varchar("cover_url", { length: 500 }),
  primaryColor: varchar("primary_color", { length: 16 }).default("#E76F3C").notNull(),
  accentColor: varchar("accent_color", { length: 16 }).default("#F59E0B").notNull(),
  languagesJson: text("languages_json").default('["ar","en","fr"]'),
  contactJson: text("contact_json"),
  socialJson: text("social_json"),
  shippingJson: text("shipping_json"),
  checkoutJson: text("checkout_json"),
  sectorConfigJson: text("sector_config_json"),
  seoJson: text("seo_json"),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  publishedIdx: index("marketplace_storefront_published_idx").on(table.entityId, table.isPublished),
}));

export const marketplaceQrCodes = mysqlTable("marketplace_qr_codes", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  listingId: int("listing_id").references(() => marketplaceListings.id, { onDelete: "cascade" }),
  purpose: mysqlEnum("purpose", ["store", "listing", "catalog", "booking", "contact", "location"]).default("store").notNull(),
  code: varchar("code", { length: 96 }).notNull().unique(),
  targetPath: varchar("target_path", { length: 500 }).notNull(),
  label: varchar("label", { length: 180 }),
  styleJson: text("style_json"),
  scanCount: int("scan_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  entityIdx: index("marketplace_qr_entity_idx").on(table.entityId, table.purpose),
  listingIdx: index("marketplace_qr_listing_idx").on(table.listingId),
}));

export const marketplaceTransferJobs = mysqlTable("marketplace_transfer_jobs", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  direction: mysqlEnum("direction", ["import", "export"]).notNull(),
  format: mysqlEnum("format", ["csv", "xlsx", "json", "xml", "pdf"]).notNull(),
  scope: mysqlEnum("scope", ["products", "inventory", "prices", "full_catalog"]).default("products").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  totalRows: int("total_rows").default(0).notNull(),
  processedRows: int("processed_rows").default(0).notNull(),
  errorReportJson: text("error_report_json"),
  requestedByUserId: int("requested_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  entityStatusIdx: index("marketplace_transfer_entity_status_idx").on(table.entityId, table.status),
}));

export const businessStoragePolicies = mysqlTable("business_storage_policies", {
  id: int("id").autoincrement().primaryKey(),
  plan: mysqlEnum("plan", PLAN_TIERS).notNull().unique(),
  quotaBytes: decimal("quota_bytes", { precision: 20, scale: 0 }).notNull(),
  maxFileSizeBytes: decimal("max_file_size_bytes", { precision: 20, scale: 0 }).notNull(),
  allowedMimePrefixesJson: text("allowed_mime_prefixes_json").default('["image/","video/","application/pdf"]').notNull(),
  warningPercent: int("warning_percent").default(80).notNull(),
  criticalPercent: int("critical_percent").default(90).notNull(),
  updatedByUserId: int("updated_by_user_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const entityStorageUsage = mysqlTable("entity_storage_usage", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().unique().references(() => platformEntities.id, { onDelete: "cascade" }),
  usedBytes: decimal("used_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  overrideQuotaBytes: decimal("override_quota_bytes", { precision: 20, scale: 0 }),
  imageBytes: decimal("image_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  videoBytes: decimal("video_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  documentBytes: decimal("document_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  purchasedContentBytes: decimal("purchased_content_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const developerApiKeys = mysqlTable("developer_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  keyPrefix: varchar("key_prefix", { length: 24 }).notNull(),
  secretHash: varchar("secret_hash", { length: 220 }).notNull(),
  scopesJson: text("scopes_json").notNull(),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdByUserId: int("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
}, (table) => ({
  entityStatusIdx: index("developer_api_keys_entity_status_idx").on(table.entityId, table.status),
}));

// ── Store Referral Links ─────────────────────────────────────────────────
export const storeReferralLinks = mysqlTable("store_referral_links", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 80 }).notNull().unique(),
  rewardType: mysqlEnum("rewardType", ["percent", "fixed", "points"]).default("percent").notNull(),
  rewardValue: decimal("rewardValue", { precision: 10, scale: 2 }).default("0").notNull(),
  maxUses: int("maxUses"),
  useCount: int("useCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeReferralLinksCodeIdx: index("store_referral_links_code_idx").on(table.code),
  storeReferralLinksEntityIdx: index("store_referral_links_entity_idx").on(table.entityId),
}));

// ── Store Referral Records (click / conversion tracking) ─────────────────
export const storeReferralRecords = mysqlTable("store_referral_records", {
  id: int("id").autoincrement().primaryKey(),
  linkId: int("linkId").notNull().references(() => storeReferralLinks.id),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id),
  referredUserId: int("referredUserId").references(() => users.id),
  orderId: int("orderId").references(() => orders.id),
  status: mysqlEnum("status", ["pending", "converted", "expired"]).default("pending").notNull(),
  rewardIssued: boolean("rewardIssued").default(false).notNull(),
  ipHash: varchar("ipHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  convertedAt: timestamp("convertedAt"),
}, (table) => ({
  storeReferralRecordsLinkIdx: index("store_referral_records_link_idx").on(table.linkId),
  storeReferralRecordsEntityIdx: index("store_referral_records_entity_idx").on(table.entityId),
  storeReferralRecordsStatusIdx: index("store_referral_records_status_idx").on(table.status),
}));

// ── Store Coupons ────────────────────────────────────────────────────────
export const storeCoupons = mysqlTable("store_coupons", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 64 }).notNull(),
  description: varchar("description", { length: 300 }),
  discountType: mysqlEnum("discountType", ["percent", "fixed"]).default("percent").notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  maxDiscountAmount: decimal("maxDiscountAmount", { precision: 10, scale: 2 }),
  usageLimit: int("usageLimit"),
  perUserLimit: int("perUserLimit").default(1).notNull(),
  useCount: int("useCount").default(0).notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeCouponsCodeIdx: index("store_coupons_code_idx").on(table.code),
  storeCouponsEntityIdx: index("store_coupons_entity_idx").on(table.entityId),
  storeCouponsActiveIdx: index("store_coupons_active_idx").on(table.entityId, table.isActive),
}));

// ── Store Coupon Redemptions ─────────────────────────────────────────────
export const storeCouponRedemptions = mysqlTable("store_coupon_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull().references(() => storeCoupons.id),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id),
  userId: int("userId").notNull().references(() => users.id),
  orderId: int("orderId").references(() => orders.id),
  discountApplied: decimal("discountApplied", { precision: 10, scale: 2 }).notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
}, (table) => ({
  storeCouponRedemptionsCouponIdx: index("store_coupon_redemptions_coupon_idx").on(table.couponId),
  storeCouponRedemptionsUserIdx: index("store_coupon_redemptions_user_idx").on(table.userId, table.couponId),
}));

// ── Store Campaigns ──────────────────────────────────────────────────────
export const storeCampaigns = mysqlTable("store_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["general", "seasonal", "referral_boost", "loyalty_boost", "flash_sale"]).default("general").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "ended"]).default("draft").notNull(),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  bonusPoints: int("bonusPoints").default(0),
  bonusPercent: decimal("bonusPercent", { precision: 5, scale: 2 }).default("0"),
  targetCouponId: int("targetCouponId").references(() => storeCoupons.id),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeCampaignsEntityIdx: index("store_campaigns_entity_idx").on(table.entityId, table.status),
}));

// ── Store Loyalty Settings (per-provider) ────────────────────────────────
export const storeLoyaltySettings = mysqlTable("store_loyalty_settings", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id, { onDelete: "cascade" }),
  pointsPerCurrency: decimal("pointsPerCurrency", { precision: 5, scale: 2 }).default("1.00").notNull(),
  redeemRate: decimal("redeemRate", { precision: 5, scale: 2 }).default("0.01").notNull(),
  minPointsToRedeem: int("minPointsToRedeem").default(100).notNull(),
  welcomeBonusPoints: int("welcomeBonusPoints").default(0).notNull(),
  tierThresholdsJson: text("tierThresholdsJson"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeLoyaltySettingsEntityIdx: index("store_loyalty_settings_entity_idx").on(table.entityId),
}));

// ── Store Reward Transactions ────────────────────────────────────────────
export const storeRewardTransactions = mysqlTable("store_reward_transactions", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["earn", "redeem", "adjust", "expire", "welcome"]).notNull(),
  points: int("points").notNull(),
  balanceAfter: int("balanceAfter").default(0).notNull(),
  referenceType: varchar("referenceType", { length: 60 }),
  referenceId: int("referenceId"),
  note: varchar("note", { length: 300 }),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  storeRewardTxEntityUserIdx: index("store_reward_tx_entity_user_idx").on(table.entityId, table.userId),
  storeRewardTxTypeIdx: index("store_reward_tx_type_idx").on(table.type, table.createdAt),
}));

// ── Store Loyalty Accounts (per-provider per-customer) ───────────────────
export const storeLoyaltyAccounts = mysqlTable("store_loyalty_accounts", {
  id: int("id").autoincrement().primaryKey(),
  entityId: varchar("entity_id", { length: 30 }).notNull().references(() => platformEntities.id),
  userId: int("userId").notNull().references(() => users.id),
  pointsBalance: int("pointsBalance").default(0).notNull(),
  tier: varchar("tier", { length: 40 }).default("standard").notNull(),
  totalEarned: int("totalEarned").default(0).notNull(),
  totalRedeemed: int("totalRedeemed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeLoyaltyAccountEntityUserUnique: uniqueIndex("store_loyalty_accounts_entity_user_unique").on(table.entityId, table.userId),
}));

// ── Affiliate Accounts ───────────────────────────────────────────────────
export const affiliateAccounts = mysqlTable("affiliate_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  code: varchar("code", { length: 80 }).notNull().unique(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("5.00").notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0.00").notNull(),
  paidEarnings: decimal("paidEarnings", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "active", "suspended", "rejected"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateAccountsUserIdx: index("affiliate_accounts_user_idx").on(table.userId),
  affiliateAccountsCodeIdx: index("affiliate_accounts_code_idx").on(table.code),
}));

// ── Affiliate Links ──────────────────────────────────────────────────────
export const affiliateLinks = mysqlTable("affiliate_links", {
  id: int("id").autoincrement().primaryKey(),
  affiliateUserId: int("affiliateUserId").notNull().references(() => affiliateAccounts.id),
  entityId: varchar("entity_id", { length: 30 }).references(() => platformEntities.id),
  code: varchar("code", { length: 80 }).notNull().unique(),
  targetPath: varchar("targetPath", { length: 300 }).default("/").notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  conversionCount: int("conversionCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateLinksCodeIdx: index("affiliate_links_code_idx").on(table.code),
  affiliateLinksAffiliateIdx: index("affiliate_links_affiliate_idx").on(table.affiliateUserId),
  affiliateLinksEntityIdx: index("affiliate_links_entity_idx").on(table.entityId),
}));

// ── Affiliate Commissions ────────────────────────────────────────────────
export const affiliateCommissions = mysqlTable("affiliate_commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateUserId: int("affiliateUserId").notNull().references(() => affiliateAccounts.id),
  linkId: int("linkId").references(() => affiliateLinks.id),
  entityId: varchar("entity_id", { length: 30 }).references(() => platformEntities.id),
  orderId: int("orderId").references(() => orders.id),
  orderAmount: decimal("orderAmount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
}, (table) => ({
  affiliateCommissionsAffiliateIdx: index("affiliate_commissions_affiliate_idx").on(table.affiliateUserId),
  affiliateCommissionsStatusIdx: index("affiliate_commissions_status_idx").on(table.status),
}));

// ── Affiliate Payout Requests ────────────────────────────────────────────
export const affiliatePayoutRequests = mysqlTable("affiliate_payout_requests", {
  id: int("id").autoincrement().primaryKey(),
  affiliateUserId: int("affiliateUserId").notNull().references(() => affiliateAccounts.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currencyCode: varchar("currencyCode", { length: 3 }).default("SAR").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 40 }).default("bank_transfer").notNull(),
  paymentDetailsJson: text("paymentDetailsJson"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  reviewNote: varchar("reviewNote", { length: 500 }),
  reviewedByUserId: int("reviewedByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
}, (table) => ({
  affiliatePayoutsAffiliateIdx: index("affiliate_payouts_affiliate_idx").on(table.affiliateUserId),
  affiliatePayoutsStatusIdx: index("affiliate_payouts_status_idx").on(table.status),
}));
