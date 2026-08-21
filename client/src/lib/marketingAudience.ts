export type AudienceCustomer = {
  id: number;
  birthDate?: Date | string | null;
  lastOrderAt?: Date | string | null;
};

export type AudienceOptions = {
  now?: Date;
  reengagementDays?: number;
};

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameMonthAndDay(date: Date, reference: Date): boolean {
  return date.getUTCMonth() === reference.getUTCMonth() && date.getUTCDate() === reference.getUTCDate();
}

export function selectBirthdayAudience(customers: AudienceCustomer[], now = new Date()): number[] {
  return customers
    .filter((customer) => {
      const birthDate = asDate(customer.birthDate);
      return birthDate !== null && sameMonthAndDay(birthDate, now);
    })
    .map((customer) => customer.id);
}

export function selectReengagementAudience(
  customers: AudienceCustomer[],
  options: AudienceOptions = {},
): number[] {
  const now = options.now ?? new Date();
  const days = options.reengagementDays ?? 30;
  if (!Number.isInteger(days) || days < 1 || days > 365) return [];
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;

  return customers
    .filter((customer) => {
      const lastOrderAt = asDate(customer.lastOrderAt);
      return lastOrderAt !== null && lastOrderAt.getTime() <= cutoff;
    })
    .map((customer) => customer.id);
}

export function selectCampaignAudience(
  kind: "birthday" | "reengagement" | "general",
  customers: AudienceCustomer[],
  options: AudienceOptions = {},
): number[] {
  if (kind === "birthday") return selectBirthdayAudience(customers, options.now ?? new Date());
  if (kind === "reengagement") return selectReengagementAudience(customers, options);
  return customers.map((customer) => customer.id);
}
