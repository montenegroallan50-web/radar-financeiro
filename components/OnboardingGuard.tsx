"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/onboarding') {
      setChecking(false);
      return;
    }

    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (!data.onboarding_done) {
          router.replace('/onboarding');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [pathname]);

  if (checking && pathname !== '/onboarding') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#E2E4EC] max-w-[430px] mx-auto">
        <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  return <>{children}</>;
}
