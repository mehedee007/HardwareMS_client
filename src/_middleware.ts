// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import { constents } from "./constents"

// // Define routes that need auth
// const protectedRoutes = ["/dashboard", "/profile", "/forms/create", "/settings"]

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get(constents.AUTH_KEY)?.value 
//   const { pathname } = req.nextUrl

//   // If route is protected and no token → redirect to login
//   if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
//     return NextResponse.redirect(new URL("/login", req.url))
//   }

//   return NextResponse.next()
// }

// // Apply middleware only to certain routes
// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
// }
