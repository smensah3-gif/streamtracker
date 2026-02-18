import React from "react";
import { StyleSheet, Text, View } from "react-native";

function StatPill({ label, value, color }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, total, color }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

/**
 * Props:
 *   stats — WatchlistStats from DiscoveryOut
 */
export default function StatsCard({ stats }) {
  const completionPct =
    stats.total_items > 0
      ? Math.round((stats.watched / stats.total_items) * 100)
      : 0;

  const hrs = stats.estimated_hours_remaining;
  const hoursLabel =
    hrs >= 1 ? `${hrs.toFixed(0)}h` : `${Math.round(hrs * 60)}m`;

  return (
    <View style={styles.card}>
      {/* Top row: pills */}
      <View style={styles.pillRow}>
        <StatPill label="Watched"  value={stats.watched}       color="#10b981" />
        <StatPill label="Watching" value={stats.watching}      color="#f59e0b" />
        <StatPill label="Up Next"  value={stats.want_to_watch} color="#6366f1" />
        <StatPill label="Platforms" value={`${stats.subscribed_platforms}/${stats.total_platforms}`} color="#cba6f7" />
      </View>

      {/* Completion bar */}
      <View style={styles.completionRow}>
        <Text style={styles.completionLabel}>
          Overall completion · {completionPct}%
        </Text>
        <Text style={styles.hoursLabel}>{hoursLabel} remaining</Text>
      </View>
      <ProgressBar value={stats.watched} total={stats.total_items} color="#10b981" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  pill: { alignItems: "center" },
  pillValue: { fontSize: 20, fontWeight: "800" },
  pillLabel: { color: "#6c7086", fontSize: 11, marginTop: 2 },
  completionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  completionLabel: { color: "#a6adc8", fontSize: 12 },
  hoursLabel: { color: "#6c7086", fontSize: 12 },
  barTrack: {
    height: 6,
    backgroundColor: "#313244",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: 3 },
});
