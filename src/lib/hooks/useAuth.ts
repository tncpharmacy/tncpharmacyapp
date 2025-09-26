import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAccessToken, getUser } from "@/lib/auth/auth"; // tumhara auth helpers

export const useAuth = () => {
  const [user, setUser] = useState(getUser());
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login"); // token nahi → login page
    } else {
      setUser(getUser()); // token hai → user set karo
    }
  }, [router]);

  return { user };
};
