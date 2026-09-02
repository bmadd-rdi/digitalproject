import { expect, test } from "bun:test";
import { getProjectTableColumnCount } from "./project-table-columns";

test("project tables hide Actions by default and remove Draft progress when requested", () => {
  expect(getProjectTableColumnCount({ activeTab: "all", showActions: false })).toBe(8);
  expect(getProjectTableColumnCount({
    activeTab: "drafts",
    hideAnalystColumn: true,
    showActions: false,
    showDraftProgress: false,
  })).toBe(6);
  expect(getProjectTableColumnCount({
    activeTab: "all",
    hideAnalystColumn: true,
    showActions: true,
  })).toBe(8);
});
