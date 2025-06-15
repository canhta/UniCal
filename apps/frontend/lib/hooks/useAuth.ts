import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-export the main useAuth from AuthContext
export { useAuth, type AuthState } from "@/lib/auth/AuthContext";

export function useRequireAuth(redirectTo: string = '/login') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session && redirectTo) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user,
  };
}
