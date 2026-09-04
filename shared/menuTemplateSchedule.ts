export type MenuTemplate = "editorial" | "bistro" | "glass" | "customer";

export type MenuTemplateScheduleRule = {
  days: number[];
  start: string;
  end: string;
  template: MenuTemplate;
};

export type MenuTemplateSchedule = {
  enabled: boolean;
  timezone: string;
  fallbackTemplate: MenuTemplate;
  rules: MenuTemplateScheduleRule[];
};

export const DEFAULT_MENU_TEMPLATE_SCHEDULE: MenuTemplateSchedule = {
  enabled: false,
  timezone: "Asia/Riyadh",
  fallbackTemplate: "editorial",
  rules: [],
};

const templateValues: MenuTemplate[] = ["editorial", "bistro", "glass", "customer"];
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const weekdayByShortName: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function isMenuTemplate(value: unknown): value is MenuTemplate {
  return typeof value === "string" && templateValues.includes(value as MenuTemplate);
}

export function isValidTime(value: unknown): value is string {
  return typeof value === "string" && timePattern.test(value);
}

export function normalizeMenuTemplateSchedule(value: unknown): MenuTemplateSchedule {
  if (!value || typeof value !== "object") return DEFAULT_MENU_TEMPLATE_SCHEDULE;
  const input = value as Partial<MenuTemplateSchedule>;
  const rules = Array.isArray(input.rules)
    ? input.rules
        .map((rule) => {
          if (!rule || typeof rule !== "object") return null;
          const candidate = rule as Partial<MenuTemplateScheduleRule>;
          const days = Array.isArray(candidate.days)
            ? Array.from(
                new Set(
                  candidate.days.filter(
                    (day): day is number =>
                      Number.isInteger(day) && day >= 0 && day <= 6
                  )
                )
              ).sort((a, b) => a - b)
            : [];
          if (!days.length || !isValidTime(candidate.start) || !isValidTime(candidate.end) || !isMenuTemplate(candidate.template)) return null;
          return {
            days,
            start: candidate.start,
            end: candidate.end,
            template: candidate.template,
          } satisfies MenuTemplateScheduleRule;
        })
        .filter((rule): rule is MenuTemplateScheduleRule => Boolean(rule))
        .slice(0, 12)
    : [];
  return {
    enabled: input.enabled === true,
    timezone:
      typeof input.timezone === "string" && input.timezone.trim()
        ? input.timezone.trim()
        : DEFAULT_MENU_TEMPLATE_SCHEDULE.timezone,
    fallbackTemplate: isMenuTemplate(input.fallbackTemplate)
      ? input.fallbackTemplate
      : DEFAULT_MENU_TEMPLATE_SCHEDULE.fallbackTemplate,
    rules,
  };
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getLocalDateParts(now: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    const day = weekdayByShortName[values.weekday];
    const hour = Number(values.hour);
    const minute = Number(values.minute);
    if (day === undefined || !Number.isInteger(hour) || !Number.isInteger(minute)) return null;
    return { day, minutes: hour * 60 + minute };
  } catch {
    return null;
  }
}

function matchesRule(rule: MenuTemplateScheduleRule, day: number, minutes: number): boolean {
  const start = timeToMinutes(rule.start);
  const end = timeToMinutes(rule.end);
  if (start <= end) return rule.days.includes(day) && minutes >= start && minutes <= end;
  if (minutes >= start) return rule.days.includes(day);
  const previousDay = (day + 6) % 7;
  return rule.days.includes(previousDay) && minutes <= end;
}

export function resolveActiveMenuTemplate(
  schedule: MenuTemplateSchedule | string | null | undefined,
  now = new Date()
): MenuTemplate | null {
  const normalized = typeof schedule === "string"
    ? (() => {
        try {
          return normalizeMenuTemplateSchedule(JSON.parse(schedule));
        } catch {
          return DEFAULT_MENU_TEMPLATE_SCHEDULE;
        }
      })()
    : normalizeMenuTemplateSchedule(schedule);
  if (!normalized.enabled) return normalized.fallbackTemplate;
  const local = getLocalDateParts(now, normalized.timezone);
  if (!local) return normalized.fallbackTemplate;
  const activeRule = normalized.rules.find((rule) => matchesRule(rule, local.day, local.minutes));
  return activeRule?.template ?? normalized.fallbackTemplate;
}

export function buildMenuTemplateCron(): string {
  return "0 */5 * * * *";
}
