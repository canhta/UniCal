import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { apiClient } from "./lib/api/client";
import { LoginDto } from "@unical/core";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  debug: true, // Enable debug mode to see more logs
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Credentials authorize called");
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const loginData: LoginDto = {
            email: credentials.email as string,
            password: credentials.password as string,
          };
          
          // Login and get tokens
          const response = await apiClient.login(loginData);
          
          console.log("✅ Credentials login successful, tokens stored");
          
          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            image: response.user.avatarUrl,
          };
        } catch (error) {
          console.error("❌ Credentials login failed:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("🔐 SignIn callback triggered:", {
        userEmail: user.email,
        userName: user.name,
        provider: account?.provider,
        accountType: account?.type,
      });

      // Simply allow sign-in - user creation will happen in session callback
      console.log(
        "✅ SignIn callback completed - deferring user creation to session",
      );
      return true;
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and provider info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      // Persist user info on first sign in
      if (user) {
        token.userEmail = user.email;
        token.userName = user.name;
        token.userImage = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("🔐 Session callback triggered");
      
      // For credentials login, tokens are already handled in authorize
      // For OAuth providers, we need to exchange tokens
      if ((token.provider === "google" || token.provider === "github") && session?.user?.email) {
        try {
          console.log("🔄 Exchanging OAuth session for UniCal tokens...");
          
          // Exchange NextAuth session for UniCal JWT tokens
          await apiClient.exchangeTokens({
            email: session.user.email,
            name: session.user.name || session.user.email,
            image: session.user.image || undefined,
            provider: token.provider as string,
          });

          console.log("✅ OAuth token exchange successful");
        } catch (error) {
          console.error("❌ OAuth token exchange failed:", error);
          // Continue with session even if token exchange fails
        }
      }

      // Extend session with additional properties
      const extendedSession = session as typeof session & {
        accessToken?: string;
        hasUniCalTokens?: boolean;
      };
      
      extendedSession.accessToken = token.accessToken as string;
      extendedSession.hasUniCalTokens = apiClient.hasValidTokens();

      console.log("✅ Session callback completed successfully");
      return extendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
