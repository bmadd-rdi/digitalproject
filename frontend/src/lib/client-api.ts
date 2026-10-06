const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const CLIENT_API_BASE = (() => {
  if (configuredApiUrl) {
    return trimTrailingSlash(configuredApiUrl);
  }
  // Fallback for local development. This runs in the browser on the host, so it
  // must use localhost (the published port `8081:8081` in docker-compose.yml).
  // The Docker service name `backend` resolves only inside the container network.
  return "http://localhost:8081/api/v1";
})();
