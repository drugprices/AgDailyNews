"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { supabase } from "./supabaseClient";

export type Plan = "free" | "no_ads";

export interface UserPreferences {
  location: {
    country: string;
    state_region: string;
    nearest_town: string;
  };
  selected_markets: string[];
  news_preferences: {
    markets_prices: boolean;
    weather_impacts: boolean;
    policy_usda: boolean;
    tech_inputs: boolean;
  };
}

export interface User {
  id: string | null;
  email: string | null;
  plan: Plan;
  plan_valid_until?: string | null;
  preferences: UserPreferences;
}

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  isGuest: boolean;
  loading: boolean;
  completeOnboarding: (prefs: Partial<UserPreferences>) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const defaultPreferences: UserPreferences = {
  location: {
    country: "USA",
    state_region: "Iowa",
    nearest_town: "Des Moines"
  },
  selected_markets: [
    "CORN",
    "SOYBEANS",
    "WHEAT",
    "LIVE_CATTLE",
    "FEEDER_CATTLE",
    "LEAN_HOGS"
  ],
  news_preferences: {
    markets_prices: true,
    weather_impacts: true,
    policy_usda: true,
    tech_inputs: false
  }
};

const STORAGE_KEY = "ag-daily-user";

const UserContext = createContext<UserContextValue | undefined>(undefined);

function createGuestUser(): User {
  return {
    id: null,
    email: null,
    plan: "free",
    plan_valid_until: null,
    preferences: defaultPreferences
  };
}

// Map a row from public.profiles to our User type
function userFromProfileRow(row: any): User {
  return {
    id: row.id,
    email: row.email,
    plan: (row.plan as Plan) ?? "free",
    plan_valid_until: row.plan_valid_until ?? null,
    preferences: {
      location: {
        country: row.location_country ?? defaultPreferences.location.country,
        state_region:
          row.location_state_region ?? defaultPreferences.location.state_region,
        nearest_town:
          row.location_nearest_town ?? defaultPreferences.location.nearest_town
      },
      selected_markets:
        row.selected_markets && row.selected_markets.length > 0
          ? row.selected_markets
          : defaultPreferences.selected_markets,
      news_preferences: {
        markets_prices:
          row.news_markets_prices ??
          defaultPreferences.news_preferences.markets_prices,
        weather_impacts:
          row.news_weather_impacts ??
          defaultPreferences.news_preferences.weather_impacts,
        policy_usda:
          row.news_policy_usda ??
          defaultPreferences.news_preferences.policy_usda,
        tech_inputs:
          row.news_tech_inputs ??
          defaultPreferences.news_preferences.tech_inputs
      }
    }
  };
}

// Convert our User into a row for public.profiles
function profileRowFromUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    plan: u.plan,
    plan_valid_until: u.plan_valid_until,
    location_country: u.preferences.location.country,
    location_state_region: u.preferences.location.state_region,
    location_nearest_town: u.preferences.location.nearest_town,
    selected_markets: u.preferences.selected_markets,
    news_markets_prices: u.preferences.news_preferences.markets_prices,
    news_weather_impacts: u.preferences.news_preferences.weather_impacts,
    news_policy_usda: u.preferences.news_preferences.policy_usda,
    news_tech_inputs: u.preferences.news_preferences.tech_inputs
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Save user to localStorage
  const saveToStorage = (u: User | null) => {
    if (typeof window === "undefined") return;
    if (u) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    saveToStorage(u);
  };

  // Load or create profile in Supabase for an authenticated user
  const fetchOrCreateProfile = async (
    authUserId: string,
    email: string | null
  ): Promise<User> => {
    // Try to load profile row
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading profile:", error);
    }

    if (data) {
      return userFromProfileRow(data);
    }

    // No row yet → create one with defaults
    const newUser: User = {
      id: authUserId,
      email,
      plan: "free",
      plan_valid_until: null,
      preferences: defaultPreferences
    };

    const row = profileRowFromUser(newUser);
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(row, { onConflict: "id" });
    if (upsertError) {
      console.error("Error creating profile:", upsertError);
    }

    return newUser;
  };

  // On first load, check Supabase auth and profiles
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      setLoading(true);

      // 1) Check authenticated Supabase user
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user) {
        const authUser = data.user;
        // Load or create profile row
        const loadedUser = await fetchOrCreateProfile(
          authUser.id,
          authUser.email ?? null
        );
        setUser(loadedUser);
        setLoading(false);
        return;
      }

      // 2) No Supabase user → guest mode (storage or default)
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User;
          setUserState(parsed);
          setLoading(false);
          return;
        } catch {
          // ignore parse error
        }
      }

      const guest = createGuestUser();
      setUser(guest);
      setLoading(false);
    };

    void init();
  }, []);

  const completeOnboarding = (prefs: Partial<UserPreferences>) => {
    setUserState((prev) => {
      const base = prev ?? createGuestUser();
      const merged: User = {
        ...base,
        preferences: {
          ...base.preferences,
          ...prefs,
          location: {
            ...base.preferences.location,
            ...(prefs.location || {})
          },
          news_preferences: {
            ...base.preferences.news_preferences,
            ...(prefs.news_preferences || {})
          },
          selected_markets:
            prefs.selected_markets ?? base.preferences.selected_markets
        }
      };

      // If logged in, also update Supabase profile in background
      if (merged.id) {
        const row = profileRowFromUser(merged);
        void supabase.from("profiles").upsert(row, { onConflict: "id" });
      }

      saveToStorage(merged);
      return merged;
    });
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) {
      throw error;
    }
    const authUser = data.user;
    if (!authUser) return;

    const loadedUser = await fetchOrCreateProfile(
      authUser.id,
      authUser.email ?? email
    );
    setUser(loadedUser);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      throw error;
    }
    const authUser = data.user;
    if (!authUser) return;

    const loadedUser = await fetchOrCreateProfile(
      authUser.id,
      authUser.email ?? email
    );
    setUser(loadedUser);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    const guest = createGuestUser();
    setUser(guest);
  };

  const value: UserContextValue = {
    user,
    setUser,
    isGuest: !user?.id,
    loading,
    completeOnboarding,
    signUp,
    signIn,
    signOut
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
