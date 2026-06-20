import type { NextConfig } from "next";

const supabaseHost = "tdcotnvbhlsvojkzhjfw.supabase.co";

const securityHeaders = [
  // Previne incarcarea aplicatiei in iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Browserul nu ghiceste tipul continutului (MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Referrer minimal — nu expune URL-uri interne
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Dezactiveaza functii browser nesolicitate
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HSTS — forteaza HTTPS pentru 1 an
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Aplicatie personala — fara indexare in motoare de cautare
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
