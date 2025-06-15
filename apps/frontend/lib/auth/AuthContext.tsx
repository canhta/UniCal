"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api/client";
import { UserResponseDto } from "@unical/core";

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserResponseDto | null;
  hasUniCalTokens: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession(); // Only ONE useSession call for the entire app
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    hasUniCalTokens: false,
    error: null,
  });
  
  // Use refs to track initialization to prevent loops
  const initializingRef = useRef(false);
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (status === "loading") {
        return;
      }

      const currentEmail = session?.user?.email || null;
      
      // Prevent re-initialization for the same user
      if (initializingRef.current || lastEmailRef.current === currentEmail) {
        return;
      }

      initializingRef.current = true;
      lastEmailRef.current = currentEmail;

      console.log('[AuthProvider] Initializing auth for:', currentEmail);

      if (!session?.user) {
        // Clear tokens if no session
        apiClient.clearTokens();
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          hasUniCalTokens: false,
          error: null,
        });
        initializingRef.current = false;
        return;
      }

      try {
        // Check if we already have valid tokens
        const existingTokens = apiClient.getTokens();
        if (existingTokens) {
          // Try to verify existing tokens
          try {
            console.log('[AuthProvider] Verifying existing tokens...');
            const userStatus = await apiClient.getAuthStatus();
            setAuthState({
              isLoading: false,
              isAuthenticated: true,
              user: userStatus,
              hasUniCalTokens: true,
              error: null,
            });
            initializingRef.current = false;
            return;
          } catch {
            console.log('[AuthProvider] Existing tokens invalid, exchanging new ones...');
            // Continue to token exchange
          }
        }

        // Exchange NextAuth session for UniCal tokens
        console.log('[AuthProvider] Exchanging tokens...');
        await apiClient.exchangeTokens({
          email: session.user.email!,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
        });

        // Verify new tokens work
        const userStatus = await apiClient.getAuthStatus();

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: userStatus,
          hasUniCalTokens: true,
          error: null,
        });
      } catch (error) {
        console.error("[AuthProvider] Auth initialization failed:", error);
        setAuthState({
          isLoading: false,
          isAuthenticated: !!session.user,
          user: null,
          hasUniCalTokens: false,
          error: error instanceof Error ? error.message : "Authentication failed",
        });
      } finally {
        initializingRef.current = false;
      }
    };

    initializeAuth();
  }, [session, status]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
