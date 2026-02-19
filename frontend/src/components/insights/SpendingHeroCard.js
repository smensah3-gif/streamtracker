import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SpendingHeroCard({ totalMonthly, potentialSavings, platformCount }) {
  const annual = totalMonthly * 12;
  const annualSavings = potentialSavings * 12;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>TOTAL MONTHLY SPEND</Text>
      <Text style={styles.heroAmount}>${totalMonthly.toFixed(2)}</Text>
      <Text style={styles.annualLabel}>
        ≈ ${annual.toFixed(2)} per year · {platformCount} platform{platformCount !== 1 ? "s" : ""}
      </Text>

      {potentialSavings > 0 && (
        <View style={styles.savingsStrip}>
          <View style={styles.savingsLeft}>
            <Text style={styles.savingsTitle}>Potential Savings</Text>
            <Text style={styles.savingsNote}>by cancelling underused subscriptions</Text>
          </View>
          <View style={styles.savingsAmounts}>
            <Text style={styles.savingsMonthly}>${potentialSavings.toFixed(2)}/mo</Text>
            <Text style={styles.savingsAnnual}>${annualSavings.toFixed(2)}/yr</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#313244",
  },
  sectionLabel: {
    color: "#6c7086",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroAmount: {
    color: "#cba6f7",
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 58,
  },
  annualLabel: {
    color: "#6c7086",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  savingsStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#162016",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2d4a2d",
  },
  savingsLeft: { flex: 1 },
  savingsTitle: {
    color: "#a6e3a1",
    fontSize: 14,
    fontWeight: "700",
  },
  savingsNote: {
    color: "#6c7086",
    fontSize: 11,
    marginTop: 2,
  },
  savingsAmounts: { alignItems: "flex-end", marginLeft: 8 },
  savingsMonthly: {
    color: "#a6e3a1",
    fontSize: 18,
    fontWeight: "800",
  },
  savingsAnnual: {
    color: "#6c7086",
    fontSize: 12,
    marginTop: 2,
  },
});
