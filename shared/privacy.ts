export function maskEmail(email: string | null | undefined) {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return "••••";
  return `${local.slice(0, 1)}•••@${domain}`;
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  const normalized = phone.trim();
  if (normalized.length < 5) return "••••";
  return `${normalized.slice(0, 3)}••••${normalized.slice(-2)}`;
}

export function redactDeliveryContact(input: { name?: string | null; phone?: string | null; address?: string | null }) {
  return { name: input.name ?? "عميل", phone: maskPhone(input.phone), address: input.address ? "يظهر ضمن نافذة التوصيل فقط" : null };
}
