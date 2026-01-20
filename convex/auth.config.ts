import { env } from "./env";

export default {
  providers: [
    {
      // From Clerk JWT template issuer URL (Convex expects the issuer domain).
      // Example: "https://<your-clerk-issuer>"
      domain: env.CLERK_ISSUER_URL(),
      applicationID: "convex",
    },
  ],
};
