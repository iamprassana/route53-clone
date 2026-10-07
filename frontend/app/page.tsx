"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getUserData } from "../lib/api/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    getUserData()
      .then(() => {
        if (active) router.replace("/dashboard");
      })
      .catch(() => {
        if (active) router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--background) text-(--muted)">
      Checking your session...
    </main>
  );
}
