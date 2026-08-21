export type RegistrationContact = { name: string; city: string; email: string; phone: string; country?: string };

export function validateRegistrationContact(input: RegistrationContact, requiresCountry = false): boolean {
  const validEmail = /^\S+@\S+\.\S+$/.test(input.email.trim());
  return input.name.trim().length >= 2 && input.city.trim().length >= 2 && validEmail && input.phone.trim().length >= 7 && (!requiresCountry || input.country?.trim().length === undefined || input.country.trim().length >= 2);
}
