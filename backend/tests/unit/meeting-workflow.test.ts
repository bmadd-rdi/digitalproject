import { describe, expect, test } from "bun:test";
import {
  MEETING_STATUS,
  MEETING_TRANSITIONS,
  MEETING_TYPE,
  resolutionOutcome,
} from "../../src/modules/meeting/meeting.service";
import { PROJECT_STATUS } from "../../src/modules/projects/project-workflow";

describe("meeting status policy", () => {
  test("allows only the approved ordinary transition matrix", () => {
    expect(MEETING_TRANSITIONS[MEETING_STATUS.DRAFT]).toEqual([
      MEETING_STATUS.SCHEDULED,
      MEETING_STATUS.CANCELLED,
    ]);
    expect(MEETING_TRANSITIONS[MEETING_STATUS.SCHEDULED]).toEqual([
      MEETING_STATUS.IN_PROGRESS,
      MEETING_STATUS.CANCELLED,
    ]);
    expect(MEETING_TRANSITIONS[MEETING_STATUS.IN_PROGRESS]).toEqual([
      MEETING_STATUS.COMPLETED,
      MEETING_STATUS.CANCELLED,
    ]);
    expect(MEETING_TRANSITIONS[MEETING_STATUS.COMPLETED]).toBeUndefined();
    expect(MEETING_TRANSITIONS[MEETING_STATUS.CANCELLED]).toBeUndefined();
  });
});

describe("board resolution mapping", () => {
  test("routes successful Small Board outcomes to Big Board", () => {
    for (const type of ["APPROVED", "ACKNOWLEDGED"] as const) {
      expect(resolutionOutcome(MEETING_TYPE.SMALL_BOARD, type)).toEqual({
        statusId: PROJECT_STATUS.PENDING_BIG_BOARD,
        returnStage: null,
        successfulBigBoard: false,
      });
    }
  });

  test("sets the correct return stage", () => {
    expect(resolutionOutcome(MEETING_TYPE.SMALL_BOARD, "RECONSIDER")).toMatchObject({
      statusId: PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD,
      returnStage: "SMALL_BOARD",
    });
    expect(resolutionOutcome(MEETING_TYPE.BIG_BOARD, "CONDITIONAL_APPROVAL")).toMatchObject({
      statusId: PROJECT_STATUS.RETURNED_FROM_BIG_BOARD,
      returnStage: "BIG_BOARD",
    });
  });

  test("treats approved and acknowledged Big Board outcomes as successful", () => {
    expect(resolutionOutcome(MEETING_TYPE.BIG_BOARD, "APPROVED")).toMatchObject({
      statusId: PROJECT_STATUS.APPROVED,
      successfulBigBoard: true,
    });
    expect(resolutionOutcome(MEETING_TYPE.BIG_BOARD, "ACKNOWLEDGED")).toMatchObject({
      statusId: PROJECT_STATUS.ACKNOWLEDGED,
      successfulBigBoard: true,
    });
  });
});
