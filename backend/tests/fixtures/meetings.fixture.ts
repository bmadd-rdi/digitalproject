import { v7 as uuidv7 } from "uuid";
import { meetings } from "../../src/db/schema/meetings";

export async function createTestMeeting(db: any, createdBy: string) {
  const [meeting] = await db.insert(meetings).values({
    id: uuidv7(),
    meetingNo: `IT-${Date.now()}`,
    title: "Integration meeting",
    meetingTypeId: 1,
    meetingDate: new Date("2027-01-01T00:00:00.000Z"),
    location: "Integration room",
    meetingStatusId: 1,
    createdBy,
  }).returning();
  return meeting;
}
