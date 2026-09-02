const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const CLIENT_API_BASE = (() => {
  if (configuredApiUrl) {
    return trimTrailingSlash(configuredApiUrl);
  }
  // return "/api/v1";
  // 👇 แก้ไขบรรทัดนี้: ใส่ IP และ Port ของ Backend ลงไปตรงๆ
  return "http://172.31.90.79:8081/api/v1";
})();
