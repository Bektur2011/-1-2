import { useEffect } from "react";
import Router from "./router/router";
import { supabase } from "./lib/supabase";
import { useAuth } from "./store/authStore";
import API from "./api/axios";

export default function App() {
  const setAuth = useAuth((state) => state.setAuth);
  const clearAuth = useAuth((state) => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    const createProfileIfMissing = async (user) => {
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (existing) return existing;
      const fallbackName = user.user_metadata?.username || user.email?.split("@")[0] || "User";
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: user.id, username: fallbackName, role: "Student" })
        .select()
        .single();
      return created;
    };

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        if (isMounted) clearAuth();
        return;
      }
      const user = session.user;
      const profile = await createProfileIfMissing(user);
      if (isMounted) setAuth(user, profile || null);
      if (profile) {
        API.post("/api/attendance/log", {
          user_id: user.id,
          username: profile.username,
          role: profile.role
        }).catch(() => {});
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        if (isMounted) clearAuth();
        return;
      }
      const user = session.user;
      const profile = await createProfileIfMissing(user);
      if (isMounted) setAuth(user, profile || null);
      if (profile) {
        API.post("/api/attendance/log", {
          user_id: user.id,
          username: profile.username,
          role: profile.role
        }).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  return <Router />;
}
