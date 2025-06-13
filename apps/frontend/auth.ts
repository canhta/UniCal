import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { apiClient } from './lib/api/client';
import { LoginDto } from '@unical/core';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  debug: true, // Enable debug mode to see more logs
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Credentials authorize called');
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const loginData: LoginDto = {
            email: credentials.email as string,
            password: credentials.password as string,
          };
          const response = await apiClient.login(loginData);
          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            image: response.user.avatarUrl,
          };
        } catch {
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
      console.log('🔐 SignIn callback triggered:', { 
        userEmail: user.email, 
        userName: user.name,
        provider: account?.provider,
        accountType: account?.type 
      });
      
      // Simply allow sign-in - user creation will happen in session callback
      console.log('✅ SignIn callback completed - deferring user creation to session');
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
      // Handle OAuth user creation in session callback
      if (token.provider === 'google' || token.provider === 'github') {
        console.log('🌐 OAuth session detected, ensuring user exists in database...');
        
        try {
          console.log('🚀 Creating/updating OAuth user via API...');
          console.log('🔗 Environment check - API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
          
          // Create or update user in our database
          const result = await apiClient.createOAuthUser({
            email: token.userEmail as string,
            name: token.userName as string || token.userEmail as string,
            image: token.userImage as string || undefined,
            provider: token.provider as string,
          });
          
          console.log('✅ OAuth user creation/update successful:', result);
        } catch (error) {
          console.error('❌ Error creating/updating OAuth user:', error);
          
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });
          }
          
          // Continue with session even if user creation fails
          console.log('⚠️ Continuing session despite API error');
        }
      }

      // Extend session with additional properties
      const extendedSession = session as typeof session & { accessToken?: string };
      extendedSession.accessToken = token.accessToken as string;
      
      console.log('✅ Session callback completed successfully');
      return extendedSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 