import React from "react";
import { StyleSheet, Text, View } from "react-native";

const STATUS_COLORS = {
  want_to_watch: "#6366f1",
  watching: "#f59e0b",
  watched: "#10b981",
};

const STATUS_LABELS = {
  want_to_watch: "Up Next",
  watching: "Watching",
  watched: "Watched",
};

/**
 * Props:
 *   item  — WatchlistItemSlim from DiscoveryOut
 *   index — position in the list (for zebra tinting)
 */
export default function ContentCard({ item, index }) {
  const statusColor = STATUS_COLORS[item.status] ?? "#6366f1";

  return (
    <View style={[styles.card, index % 2 === 1 && styles.cardAlt]}>
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {item.type === "show" ? "TV Show" : "Movie"}
          </Text>
          {item.platform_name ? (
            <Text style={styles.metaText}> · {item.platform_name}</Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
        <Text style={[styles.badgeText, { color: statusColor }]}>
          {STATUS_LABELS[item.status]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  cardAlt: {
    backgroundColor: "#181825",
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  title: {
    color: "#cdd6f4",
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    marginTop: 3,
  },
  metaText: {
    color: "#6c7086",
    fontSize: 12,
  },
  badge: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
