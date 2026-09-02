import { expect, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { assertValidProjectTransition, PROJECT_STATUS } from "../../src/modules/projects/project-workflow";

test("valid secretary transitions are accepted", () => {
  expect(assertValidProjectTransition(
    PROJECT_STATUS.PENDING_SECRETARY,
    PROJECT_STATUS.PENDING_ASSIGNMENT,
  )).toBeNull();
});

test("negative transitions require a remark", () => {
  expect(() => assertValidProjectTransition(
    PROJECT_STATUS.PENDING_SECRETARY,
    PROJECT_STATUS.REJECTED_SECRETARY,
  )).toThrow(HTTPException);
  expect(assertValidProjectTransition(
    PROJECT_STATUS.PENDING_SECRETARY,
    PROJECT_STATUS.REJECTED_SECRETARY,
    "Needs correction",
  )).toBe("Needs correction");
});

test("cancel submit is not a generic workflow transition", () => {
  expect(() => assertValidProjectTransition(
    PROJECT_STATUS.PENDING_SECRETARY,
    PROJECT_STATUS.DRAFT,
  )).toThrow(HTTPException);
});
