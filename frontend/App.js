import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";
import OnboardingNavigator from "./src/navigation/OnboardingNavigator";

function RootNavigator() {
  const { token, loading, onboardingComplete } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#cba6f7" size="large" />
      </View>
    );
  }

  if (!token) return <AuthNavigator />;
  if (!onboardingComplete) return <OnboardingNavigator />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#11111b",
    justifyContent: "center",
    alignItems: "center",
  },
});
