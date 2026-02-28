import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRODUCTION_HOST = "diamondstargrp-qr-code-employee.vercel.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!host || host === PRODUCTION_HOST) {
    return NextResponse.next();
  }
  // Redirect any other Vercel URL (preview/deployment) to main app URL so one place for content
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = PRODUCTION_HOST;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/:path*",
};
