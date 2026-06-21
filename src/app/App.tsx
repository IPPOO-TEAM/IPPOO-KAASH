import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { MotionConfig } from "motion/react";
import { router } from "./routes";
import { AuthProvider } from "./auth/auth-context";
import { AppErrorBoundary } from "./components/error-boundary";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider } from "./i18n/language-context";
import { setupPWA } from "./pwa/pwa";

export default function App() {
  useEffect(() => { setupPWA(); }, []);
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <LanguageProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </LanguageProvider>
      </MotionConfig>
    </AppErrorBoundary>
  );
}
