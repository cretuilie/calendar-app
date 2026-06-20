import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutele API necesita Bearer token (exceptie: /api/push/send are propria autentificare cu CRON_SECRET)
  if (pathname.startsWith("/api/") && pathname !== "/api/push/send") {
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ") || auth.length < 20) {
      return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
    }
  }

  // Adauga header de securitate suplimentar pe toate raspunsurile
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
