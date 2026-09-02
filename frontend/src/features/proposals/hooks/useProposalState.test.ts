import { expect, test } from "bun:test";
import { chooseProposalState } from "./proposal-state";

test("editable draft wins over submitted history when the Backend permits editing", () => {
  const state = chooseProposalState({
    draft: { projectName: "ฉบับร่าง" },
    submitted: { projectName: "ฉบับที่ส่งแล้ว" },
    preferEditableDraft: true,
  });
  expect(state.status).toBe("draft");
  if (state.status !== "draft") throw new Error("Expected an editable draft state");
  expect(state.data.projectName).toBe("ฉบับร่าง");
});

test("submitted history remains the workspace when editing is not permitted", () => {
  const state = chooseProposalState({
    draft: { projectName: "ข้อมูลค้าง" },
    submitted: { projectName: "ฉบับที่ส่งแล้ว" },
    preferEditableDraft: false,
  });
  expect(state.status).toBe("submitted");
  if (state.status !== "submitted") throw new Error("Expected a submitted proposal state");
  expect(state.data.projectName).toBe("ฉบับที่ส่งแล้ว");
});
