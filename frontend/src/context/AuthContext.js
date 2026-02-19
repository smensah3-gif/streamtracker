import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { tokenStore } from "../services/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("access_token").then((t) => {
      if (t) {
        tokenStore.set(t);
        setToken(t);
      }
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (accessToken, refreshToken) => {
    await AsyncStorage.setItem("access_token", accessToken);
    await AsyncStorage.setItem("refresh_token", refreshToken);
    tokenStore.set(accessToken);
    setToken(accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    tokenStore.clear();
    setToken(null);
  }, []);

  // Wire up the global 401 handler so api.js can trigger signOut
  useEffect(() => {
    tokenStore.setOnUnauthorized(signOut);
    return () => tokenStore.setOnUnauthorized(null);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
