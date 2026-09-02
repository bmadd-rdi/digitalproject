import { HTTPException } from "hono/http-exception";

/**
 * A database-safe decimal representation. PostgreSQL numeric values are
 * returned as strings in this project, so calculations intentionally avoid
 * JavaScript floating-point arithmetic.
 */
export type Decimal = string;

function parseDecimal(value: unknown) {
  const raw = typeof value === "number" ? String(value) : String(value ?? "").trim();
  if (!raw || !/^(?:\+)?\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new HTTPException(400, { message: "Budget amounts must be finite non-negative decimals" });
  }

  const [whole, fraction = ""] = raw.replace(/^\+/, "").split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function sumProposalBudgets(budgets: ReadonlyArray<unknown>): Decimal {
  let total = 0n;
  for (const budget of budgets) {
    if (!budget || typeof budget !== "object") {
      throw new HTTPException(400, { message: "Each budget row must be an object" });
    }
    const amount = (budget as { amount?: unknown }).amount;
    total += parseDecimal(amount);
  }

  const whole = total / 100n;
  const fraction = (total % 100n).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
}
