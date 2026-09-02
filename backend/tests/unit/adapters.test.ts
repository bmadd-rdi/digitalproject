import { expect, test } from "bun:test";
import { FakeClock, FakeEmailService, FakePdfCompressor } from "../setup/fakes";

test("fake email adapter records recipient, type, token, and timestamp", async () => {
  const email = new FakeEmailService();
  const sent = await email.sendVerificationEmail("person@example.test", "verify-token", "Person");

  expect(sent.success).toBe(true);
  expect(email.sent).toHaveLength(1);
  expect(email.sent[0]).toMatchObject({
    recipient: "person@example.test",
    type: "verification",
    token: "verify-token",
  });
  expect(email.sent[0].sentAt).toBeInstanceOf(Date);
});

test("fake adapters expose controllable failure modes", async () => {
  const email = new FakeEmailService();
  email.shouldFail = true;
  const emailResult = await email.sendPasswordResetEmail("person@example.test", "reset-token");
  expect(emailResult.success).toBe(false);
  expect(email.sent).toHaveLength(0);
  expect(email.attempts).toHaveLength(1);

  const compressor = new FakePdfCompressor();
  compressor.shouldFail = true;
  await expect(compressor.compressPdf(new ArrayBuffer(3))).rejects.toThrow("Fake PDF compression failed");
  expect(compressor.calls).toHaveLength(1);
});

test("fake clock supports deterministic expiry tests", () => {
  const clock = new FakeClock(new Date("2027-01-01T00:00:00.000Z"));
  expect(clock.now().toISOString()).toBe("2027-01-01T00:00:00.000Z");
  clock.advance(90_000);
  expect(clock.now().toISOString()).toBe("2027-01-01T00:01:30.000Z");
});
