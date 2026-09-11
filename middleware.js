import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// This protects EVERYTHING except the login page, API, and Next.js static files (like images/css)
export const config = { 
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"] 
};