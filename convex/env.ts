function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  CLERK_ISSUER_URL: () => requireEnv("CLERK_ISSUER_URL"),

  R2_ENDPOINT: () => requireEnv("R2_ENDPOINT"),
  R2_BUCKET: () => requireEnv("R2_BUCKET"),
  R2_ACCESS_KEY_ID: () => requireEnv("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: () => requireEnv("R2_SECRET_ACCESS_KEY"),
  R2_PUBLIC_BASE_URL: () => requireEnv("R2_PUBLIC_BASE_URL"),
} as const;
