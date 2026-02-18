import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const STATUS_LABELS = {
  want_to_watch: "Want to Watch",
  watching: "Watching",
  watched: "Watched",
};

const STATUS_COLORS = {
  want_to_watch: "#6366f1",
  watching: "#f59e0b",
  watched: "#10b981",
};

export default function WatchlistItem({ item, onStatusChange, onDelete }) {
  const statusColor = STATUS_COLORS[item.status] ?? "#6b7280";

  const cycleStatus = () => {
    const order = ["want_to_watch", "watching", "watched"];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    onStatusChange(item.id, next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.type === "show" ? "TV Show" : "Movie"}</Text>
          {item.platform_name ? (
            <Text style={styles.metaText}> · {item.platform_name}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: statusColor }]}
          onPress={cycleStatus}
        >
          <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1, marginRight: 10 },
  title: { color: "#cdd6f4", fontSize: 16, fontWeight: "600" },
  meta: { flexDirection: "row", marginTop: 4 },
  metaText: { color: "#6c7086", fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  deleteBtn: { padding: 6 },
  deleteText: { color: "#f38ba8", fontSize: 16, fontWeight: "700" },
});
