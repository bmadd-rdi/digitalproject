const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const CLIENT_API_BASE = (() => {
  if (configuredApiUrl) {
    return trimTrailingSlash(configuredApiUrl);
  }
  return "/api/v1";
})();
