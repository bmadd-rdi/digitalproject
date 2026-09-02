import { expect, test } from "bun:test";
import { submitProposalSchema } from "../../src/modules/proposals/proposal.schema";

test("rejects incomplete five-step submissions", () => {
  expect(submitProposalSchema.safeParse({ projectName: "draft" }).success).toBe(false);
});

test("rejects invalid dates and invalid enum codes", () => {
  const result = submitProposalSchema.safeParse({
    projectName: "ระบบบริการประชาชน",
    projectType: "unknown",
    cloudRequests: [{ systemName: "ระบบ", requestedServiceDate: "2027-02-31", recordedRequestDate: "2027-01-01", vms: [] }],
  });
  expect(result.success).toBe(false);
});
