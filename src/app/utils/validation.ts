export const MAX_AMOUNT_XOF = 5_000_000;
export const MIN_AMOUNT_XOF = 100;

export function sanitizeAmount(input: string): string {
  return input.replace(/\D/g, "").slice(0, 9);
}

export function validateAmount(value: string): { ok: true; amount: number } | { ok: false; error: string } {
  const cleaned = sanitizeAmount(value);
  if (!cleaned) return { ok: false, error: "Le montant est requis" };
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Montant invalide" };
  if (amount < MIN_AMOUNT_XOF) return { ok: false, error: `Le montant minimum est ${MIN_AMOUNT_XOF} F CFA` };
  if (amount > MAX_AMOUNT_XOF) return { ok: false, error: `Le montant maximum est ${MAX_AMOUNT_XOF.toLocaleString("fr-FR")} F CFA` };
  return { ok: true, amount };
}

export function sanitizeText(input: string, maxLength = 140): string {
  return input.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, "").slice(0, 10);
}

export function isValidPhone(phone: string): boolean {
  return /^\d{8,10}$/.test(phone);
}
