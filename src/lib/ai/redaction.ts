const SECRET_PATTERNS = [
  /DEEPSEEK_API_KEY\s*=\s*["']?[^"'\s]+/gi,
  /AUTH_SECRET\s*=\s*["']?[^"'\s]+/gi,
  /DATABASE_URL\s*=\s*["']?[^"'\s]+/gi,
  /cookie\s*[:=]\s*[^,\n]+/gi,
  /token\s*[:=]\s*[^,\n]+/gi,
  /[A-Za-z]:\\[^\s`"'<>]+/g,
  /\/Users\/[^\s`"'<>]+/g,
];

export function redactAiText(value: string): string {
  return SECRET_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "[redacted]"),
    value
  );
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
