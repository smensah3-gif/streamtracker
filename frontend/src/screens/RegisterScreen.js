import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

export default function RegisterScreen({ onNavigateToLogin }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Validation", "Email and password are required.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Validation", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Validation", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        email: email.trim().toLowerCase(),
        password,
      });
      // Auto-login after registration
      const { access_token, refresh_token } = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      await signIn(access_token, refresh_token, email.trim().toLowerCase());
    } catch (e) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.logo}>StreamTracker</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#6c7086"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 8 characters"
          placeholderTextColor="#6c7086"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat password"
          placeholderTextColor="#6c7086"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          onSubmitEditing={handleRegister}
          returnKeyType="go"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#11111b" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={onNavigateToLogin}>
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  logo: {
    color: "#cba6f7",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#6c7086",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 36,
  },
  label: { color: "#a6adc8", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#1e1e2e",
    color: "#cdd6f4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#313244",
  },
  btn: {
    backgroundColor: "#cba6f7",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#11111b", fontSize: 16, fontWeight: "800" },
  link: { alignItems: "center", marginTop: 20 },
  linkText: { color: "#6c7086", fontSize: 14 },
  linkAccent: { color: "#cba6f7", fontWeight: "700" },
});
