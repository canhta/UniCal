# Auth Feature Plan (Frontend)

## Overview
This plan details the integration of authentication using next-auth v5 in the Next.js frontend, supporting username/password, Google, and Microsoft providers.

## Steps
1. **Install next-auth v5**
   - `npm install next-auth@beta`
   - Reference: [Installation Guide](https://authjs.dev/getting-started/installation)
2. **Configure Providers**
   - Username/password (CredentialsProvider)
   - Google ([Google Provider Docs](https://authjs.dev/getting-started/providers/google))
   - Microsoft ([Microsoft Provider Docs](https://authjs.dev/getting-started/providers/microsoft))
3. **Set Environment Variables**
   - `NEXTAUTH_SECRET` (generate with `openssl rand -hex 32`)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
4. **Create Auth Config**
   - Create `/auth.ts` (or `/src/auth.ts`) exporting next-auth handlers and provider configs.
5. **Create API Route**
   - Create `app/api/auth/[...nextauth]/route.ts` and export handlers from `/auth.ts`.
6. **Wrap App in SessionProvider**
   - Use `SessionProvider` from `next-auth/react` in `app/layout.tsx`.
7. **Update Login/Logout UI**
   - Use `signIn`/`signOut` from `next-auth/react` for authentication actions.
8. **Access User Info**
   - Use `useSession` in client components, `auth()` in server components.
9. **Protect Routes**
   - Check session in server/client components to restrict access to protected pages.
10. **Migration**
   - If upgrading from previous next-auth versions, follow the [migration guide](https://authjs.dev/getting-started/migrating-to-v5).

## References
- [NextAuth.js Installation](https://authjs.dev/getting-started/installation)
- [Google Provider](https://authjs.dev/getting-started/providers/google)
- [Microsoft Provider](https://authjs.dev/getting-started/providers/microsoft)
- [Next.js Auth Guide](https://nextjs.org/learn/dashboard-app/adding-authentication) 