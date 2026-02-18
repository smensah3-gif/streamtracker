import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACTION_CONFIG = {
  keep:   { label: "Keep",   bg: "#a6e3a1", text: "#1e1e2e" },
  review: { label: "Review", bg: "#f9e2af", text: "#1e1e2e" },
  cancel: { label: "Cancel", bg: "#f38ba8", text: "#1e1e2e" },
};

const FEATURE_LABELS = {
  completion_rate: "Completion Rate",
  engagement_rate: "Engagement Rate",
  recency_score:   "Recency",
  content_volume:  "Content Volume",
  cost_efficiency: "Cost Efficiency",
};

/**
 * Props:
 *   recommendation — Recommendation object from InsightsOut
 *   expanded       — bool, controlled by parent
 *   onPress        — toggle expand/collapse
 */
export default function RecommendationCard({ recommendation: rec, expanded, onPress }) {
  const cfg = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG.review;
  const churnPct = Math.round(rec.churn_risk * 100);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: rec.platform_color, borderLeftWidth: 4 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.platformName}>{rec.platform_name}</Text>
          <Text style={styles.cost}>
            {rec.monthly_cost > 0 ? `$${rec.monthly_cost.toFixed(2)}/mo` : "Free"}
          </Text>
        </View>
        <View style={[styles.actionBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.actionText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Score bars */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Value Score</Text>
          <Text style={styles.scoreValue}>{rec.value_score.toFixed(0)}/100</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${rec.value_score}%`, backgroundColor: cfg.bg },
              ]}
            />
          </View>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Churn Risk</Text>
          <Text
            style={[
              styles.scoreValue,
              { color: rec.churn_risk >= 0.7 ? "#f38ba8" : "#cdd6f4" },
            ]}
          >
            {churnPct}%
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${churnPct}%`, backgroundColor: "#f38ba8" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Reason */}
      <Text style={styles.reason}>{rec.reason}</Text>

      {/* Expandable feature breakdown */}
      {expanded && (
        <View style={styles.detail}>
          <Text style={styles.detailHeading}>Score Breakdown</Text>
          {Object.entries(rec.feature_contributions).map(([key, val]) => (
            <View key={key} style={styles.featureRow}>
              <Text style={styles.featureLabel}>{FEATURE_LABELS[key] ?? key}</Text>
              <View style={styles.featureRight}>
                <View style={styles.featureBarTrack}>
                  <View
                    style={[
                      styles.featureBarFill,
                      { width: `${Math.min(100, val * 400)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.featureVal}>{(val * 100).toFixed(1)} pts</Text>
              </View>
            </View>
          ))}
          <Text style={styles.expandHint}>Tap to collapse</Text>
        </View>
      )}

      {!expanded && (
        <Text style={styles.expandHint}>Tap to see score breakdown</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameBlock: { flex: 1 },
  platformName: { color: "#cdd6f4", fontSize: 17, fontWeight: "700" },
  cost: { color: "#6c7086", fontSize: 12, marginTop: 2 },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionText: { fontSize: 12, fontWeight: "800" },
  scoreRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  scoreBlock: { flex: 1 },
  scoreLabel: { color: "#6c7086", fontSize: 11, fontWeight: "600", marginBottom: 2 },
  scoreValue: { color: "#cdd6f4", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  barTrack: {
    height: 4,
    backgroundColor: "#313244",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  reason: { color: "#a6adc8", fontSize: 12, fontStyle: "italic", marginBottom: 6 },
  expandHint: { color: "#45475a", fontSize: 11, marginTop: 4 },
  detail: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#313244",
    paddingTop: 10,
  },
  detailHeading: {
    color: "#cdd6f4",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  featureLabel: { color: "#a6adc8", fontSize: 12, width: 120 },
  featureRight: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  featureBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "#313244",
    borderRadius: 2,
    overflow: "hidden",
  },
  featureBarFill: { height: 3, backgroundColor: "#cba6f7", borderRadius: 2 },
  featureVal: { color: "#cdd6f4", fontSize: 11, fontWeight: "600", width: 44, textAlign: "right" },
});
