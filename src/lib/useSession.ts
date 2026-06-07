"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./store";
import type { User } from "./types";

// 로그인 필요한 페이지에서 사용. 세션 없으면 /login 으로.
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setUser(s);
    setReady(true);
  }, [router]);

  return { user, ready, setUser };
}
