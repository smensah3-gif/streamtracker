import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { tokenStore } from "../services/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = await AsyncStorage.multiGet(["access_token", "user_email"]);
      const accessToken = results[0][1];
      const storedEmail = results[1][1];

      if (accessToken) {
        tokenStore.set(accessToken);
        setToken(accessToken);
      }
      if (storedEmail) {
        setUserEmail(storedEmail);
        const onboarded = await AsyncStorage.getItem(
          `@streamtracker:onboarded:${storedEmail}`
        );
        setOnboardingComplete(onboarded === "true");
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (accessToken, refreshToken, email) => {
    const pairs = [
      ["access_token", accessToken],
      ["refresh_token", refreshToken],
    ];
    if (email) pairs.push(["user_email", email]);
    await AsyncStorage.multiSet(pairs);

    tokenStore.set(accessToken);
    setToken(accessToken);

    if (email) {
      setUserEmail(email);
      const onboarded = await AsyncStorage.getItem(
        `@streamtracker:onboarded:${email}`
      );
      setOnboardingComplete(onboarded === "true");
    }
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token", "user_email"]);
    tokenStore.clear();
    setToken(null);
    setUserEmail(null);
    setOnboardingComplete(false);
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (userEmail) {
      await AsyncStorage.setItem(`@streamtracker:onboarded:${userEmail}`, "true");
    }
    setOnboardingComplete(true);
  }, [userEmail]);

  useEffect(() => {
    tokenStore.setOnUnauthorized(signOut);
    return () => tokenStore.setOnUnauthorized(null);
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ token, loading, userEmail, onboardingComplete, signIn, signOut, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
