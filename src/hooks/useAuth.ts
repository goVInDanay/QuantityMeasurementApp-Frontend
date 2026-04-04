import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api";
import type { User } from "../types";

export function useAuth(redirectIfUnauthenticated = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile()
      .then((u) => {
        if (!u && redirectIfUnauthenticated) {
          navigate("/dashboard", { replace: true });
        } else {
          setUser(u);
        }
      })
      .catch(() => {
        if (redirectIfUnauthenticated)
          navigate("/dashboard", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate, redirectIfUnauthenticated]);

  return { user, loading };
}
