export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/artikel/:path*",
    "/admin/kategorien/:path*",
    "/admin/news-quellen/:path*",
    "/admin/redakteure/:path*",
  ],
};
