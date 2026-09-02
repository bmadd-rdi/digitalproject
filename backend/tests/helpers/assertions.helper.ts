export function assertStatus(response: Response, expected: number) {
  if (response.status !== expected) {
    throw new Error(`Expected HTTP ${expected}, received HTTP ${response.status}`);
  }
}

export function assertNoSensitiveFields(value: unknown, fields = [
  "password",
  "verificationToken",
  "resetPasswordToken",
]) {
  const serialized = JSON.stringify(value);
  for (const field of fields) {
    if (serialized.includes(field)) throw new Error(`Sensitive field was exposed: ${field}`);
  }
}
