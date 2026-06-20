import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutele API necesita Bearer token
  if (pathname.startsWith("/api/")) {
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
