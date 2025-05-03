export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/dashboard/mantencion",
    "/api/layer/:path*",
    "/api/layer",
    "/api/movil/:path*",
    "/api/movil",
    "/api/users/:path*",
    "/api/users",
    "/api/reset-password",
    "/api/newuser",

    "/api/mantencion/:path*",
    "/api/mantencion",
    "/api/dataload/:path*",
    "/api/dataload",
  ],
};
