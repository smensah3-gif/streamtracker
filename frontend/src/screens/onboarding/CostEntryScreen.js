import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function StepIndicator({ current }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3].map((n) => (
        <View key={n} style={[styles.stepDot, n === current && styles.stepActive]} />
      ))}
    </View>
  );
}

export default function CostEntryScreen({ selectedPlatforms, costs, onNext, onBack }) {
  const [localCosts, setLocalCosts] = useState(
    Object.fromEntries(
      selectedPlatforms.map((p) => [p.name, String(costs[p.name] ?? p.suggestedPrice)])
    )
  );

  const setCost = (name, value) => {
    setLocalCosts((prev) => ({ ...prev, [name]: value }));
  };

  const totalMonthly = selectedPlatforms.reduce((sum, p) => {
    return sum + (parseFloat(localCosts[p.name]) || 0);
  }, 0);

  const handleNext = () => {
    const parsed = {};
    selectedPlatforms.forEach((p) => {
      parsed[p.name] = parseFloat(localCosts[p.name]) || 0;
    });
    onNext(parsed);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StepIndicator current={2} />

        <Text style={styles.title}>What do you pay{"\n"}for each?</Text>
        <Text style={styles.subtitle}>
          Pre-filled with common prices — update if yours differ.
        </Text>

        <ScrollView contentContainerStyle={styles.list}>
          {selectedPlatforms.map((p) => (
            <View key={p.name} style={[styles.platformRow, { borderLeftColor: p.color }]}>
              <Text style={styles.platformName}>{p.name}</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.dollar}>$</Text>
                <TextInput
                  style={styles.input}
                  value={localCosts[p.name] ?? ""}
                  onChangeText={(v) => setCost(p.name, v)}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  placeholder="0.00"
                  placeholderTextColor="#45475a"
                />
                <Text style={styles.perMo}>/mo</Text>
              </View>
            </View>
          ))}

          {/* Total summary */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total monthly</Text>
            <Text style={styles.totalValue}>${totalMonthly.toFixed(2)}</Text>
          </View>
          <Text style={styles.annualNote}>
            ≈ ${(totalMonthly * 12).toFixed(2)} per year
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 20,
    marginBottom: 28,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#313244",
  },
  stepActive: { backgroundColor: "#cba6f7", width: 24 },
  title: {
    color: "#cdd6f4",
    fontSize: 28,
    fontWeight: "900",
    paddingHorizontal: 20,
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: {
    color: "#6c7086",
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#313244",
  },
  platformName: { color: "#cdd6f4", fontSize: 15, fontWeight: "700", flex: 1 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11111b",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#313244",
  },
  dollar: { color: "#6c7086", fontSize: 15, marginRight: 2 },
  input: {
    color: "#cdd6f4",
    fontSize: 16,
    fontWeight: "700",
    width: 60,
    textAlign: "right",
  },
  perMo: { color: "#6c7086", fontSize: 12, marginLeft: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#313244",
  },
  totalLabel: { color: "#a6adc8", fontSize: 14, fontWeight: "600" },
  totalValue: { color: "#cba6f7", fontSize: 22, fontWeight: "900" },
  annualNote: {
    color: "#6c7086",
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e1e2e",
  },
  backBtn: { paddingVertical: 15, paddingHorizontal: 4 },
  backText: { color: "#6c7086", fontSize: 15 },
  btn: {
    flex: 1,
    backgroundColor: "#cba6f7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  btnText: { color: "#11111b", fontSize: 16, fontWeight: "800" },
});
