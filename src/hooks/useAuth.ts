import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api";
import type { User } from "../types";

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(requireAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireAuth) return;

    getUserProfile()
      .then((u) => {
        if (!u && requireAuth) navigate("/", { replace: true });
        else setUser(u);
      })
      .catch(() => {
        if (requireAuth) navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [requireAuth, navigate]);

  return { user, loading };
}
