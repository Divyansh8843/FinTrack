'use client';
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import ToastProvider from "@/components/ToastProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Protected route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // List of public routes that don't require authentication
  const publicRoutes = ['/', '/api/auth/signin', '/api/auth/signout'];

  useEffect(() => {
    // If not loading and not authenticated, redirect to home page
    if (status === 'unauthenticated' && !publicRoutes.includes(pathname)) {
      router.push('/');
    }
  }, [session, status, router, pathname]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 dark:text-indigo-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, don't render anything
  if (status === 'unauthenticated' && !publicRoutes.includes(pathname)) {
    return null;
  }

  // If authenticated or accessing public route, render normally
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-screen mx-auto">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </SessionProvider>
  );
}