import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UnderutilizedCard({ features, recommendation }) {
  const engagementPct = Math.round((features?.engagement_rate ?? 0) * 100);
  const days = features?.days_since_last_activity ?? 0;

  return (
    <View style={[styles.card, { borderTopColor: recommendation.platform_color }]}>
      <Text style={styles.name} numberOfLines={1}>
        {recommendation.platform_name}
      </Text>
      <Text style={styles.cost}>
        {recommendation.monthly_cost > 0
          ? `$${recommendation.monthly_cost.toFixed(2)}/mo`
          : "Free"}
      </Text>

      <Text style={styles.statLabel}>Engagement</Text>
      <View style={styles.barRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${engagementPct}%` }]} />
        </View>
        <Text style={styles.barValue}>{engagementPct}%</Text>
      </View>

      <Text style={styles.lastActive}>
        {days === 0 ? "Active recently" : `${days}d inactive`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    width: 150,
    marginRight: 10,
    borderWidth: 1,
    borderTopWidth: 3,
    borderColor: "#313244",
  },
  name: {
    color: "#cdd6f4",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  cost: {
    color: "#6c7086",
    fontSize: 12,
    marginBottom: 14,
  },
  statLabel: {
    color: "#6c7086",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "#313244",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: "#f38ba8",
    borderRadius: 2,
  },
  barValue: {
    color: "#f38ba8",
    fontSize: 10,
    fontWeight: "700",
    width: 26,
    textAlign: "right",
  },
  lastActive: {
    color: "#6c7086",
    fontSize: 11,
  },
});
