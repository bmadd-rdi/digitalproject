import { expect, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { sumProposalBudgets } from "../../src/modules/proposals/proposal-budget.util";

test("sums numeric strings without floating point loss", () => {
  expect(sumProposalBudgets([{ amount: "100.10" }, { amount: 0.2 }])).toBe("100.30");
});

test("preserves zero-valued cost rows in independent calculations", () => {
  expect(sumProposalBudgets([{ amount: "0.00" }, { amount: "1.00" }])).toBe("1.00");
});

test("rejects invalid budget values", () => {
  expect(() => sumProposalBudgets([{ amount: "-1" }])).toThrow(HTTPException);
  expect(() => sumProposalBudgets([{ amount: "NaN" }])).toThrow(HTTPException);
});
