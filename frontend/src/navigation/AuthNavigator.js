import React, { useState } from "react";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

export default function AuthNavigator() {
  const [screen, setScreen] = useState("login");

  if (screen === "register") {
    return <RegisterScreen onNavigateToLogin={() => setScreen("login")} />;
  }
  return <LoginScreen onNavigateToRegister={() => setScreen("register")} />;
}
