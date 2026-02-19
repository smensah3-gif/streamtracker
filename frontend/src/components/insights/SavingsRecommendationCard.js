import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ACTION_CONFIG = {
  keep:   { label: "Keep",   bg: "#a6e3a1", text: "#1e1e2e" },
  review: { label: "Review", bg: "#f9e2af", text: "#1e1e2e" },
  cancel: { label: "Cancel", bg: "#f38ba8", text: "#1e1e2e" },
};

export default function SavingsRecommendationCard({ recommendation: rec }) {
  const cfg = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG.review;
  const monthlySavings = rec.action === "cancel" ? rec.monthly_cost : 0;
  const annualSavings = monthlySavings * 12;

  return (
    <View style={[styles.card, { borderLeftColor: rec.platform_color }]}>
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.platformName}>{rec.platform_name}</Text>
          <Text style={styles.cost}>
            {rec.monthly_cost > 0 ? `$${rec.monthly_cost.toFixed(2)}/mo` : "Free"}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={styles.reason}>{rec.reason}</Text>

      {monthlySavings > 0 && (
        <View style={styles.savingsRow}>
          <Text style={styles.savingsLabel}>Cancel to save</Text>
          <View style={styles.savingsAmounts}>
            <Text style={styles.savingsMonthly}>${monthlySavings.toFixed(2)}/mo</Text>
            <Text style={styles.savingsAnnual}> · ${annualSavings.toFixed(2)}/yr</Text>
          </View>
        </View>
      )}

      {rec.action === "review" && (
        <View style={styles.reviewRow}>
          <Text style={styles.reviewText}>
            Review your usage — a few more watches could make this worth keeping.
          </Text>
        </View>
      )}

      {rec.action === "keep" && (
        <View style={styles.keepRow}>
          <Text style={styles.keepText}>Value score {rec.value_score.toFixed(0)}/100</Text>
          <View style={styles.keepBarTrack}>
            <View style={[styles.keepBarFill, { width: `${rec.value_score}%` }]} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#313244",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nameBlock: { flex: 1 },
  platformName: { color: "#cdd6f4", fontSize: 16, fontWeight: "700" },
  cost: { color: "#6c7086", fontSize: 12, marginTop: 2 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "800" },
  reason: {
    color: "#a6adc8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  savingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#162016",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#2d4a2d",
  },
  savingsLabel: { color: "#a6e3a1", fontSize: 13, fontWeight: "600" },
  savingsAmounts: { flexDirection: "row", alignItems: "baseline" },
  savingsMonthly: { color: "#a6e3a1", fontSize: 15, fontWeight: "800" },
  savingsAnnual: { color: "#6c7086", fontSize: 12 },
  reviewRow: {
    backgroundColor: "#201e12",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#4a421e",
  },
  reviewText: { color: "#f9e2af", fontSize: 12, lineHeight: 16 },
  keepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  keepText: { color: "#6c7086", fontSize: 12, width: 100 },
  keepBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#313244",
    borderRadius: 2,
    overflow: "hidden",
  },
  keepBarFill: {
    height: 4,
    backgroundColor: "#a6e3a1",
    borderRadius: 2,
  },
});
