export function formatFileSize(bytes: number | null | undefined) {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) {
    return "ไม่ทราบขนาด";
  }

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;

  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.includes("*/*")) return true;

  const extensionTokens = tokens.filter((token) => token.startsWith("."));
  const mimeTokens = tokens.filter((token) => !token.startsWith("."));
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  if (
    extensionTokens.length > 0 &&
    !extensionTokens.some((token) => fileName.endsWith(token))
  ) {
    return false;
  }

  if (mimeTokens.length === 0 || !fileType) return true;
  return mimeTokens.some((token) => {
    if (token.endsWith("/*")) return fileType.startsWith(token.slice(0, -1));
    return fileType === token;
  });
}
