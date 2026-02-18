import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PlatformCard({ platform, onToggle, onDelete }) {
  return (
    <View style={[styles.card, { borderLeftColor: platform.color, borderLeftWidth: 4 }]}>
      <View style={styles.info}>
        <Text style={styles.name}>{platform.name}</Text>
        <Text style={styles.cost}>
          {platform.monthly_cost > 0
            ? `$${platform.monthly_cost.toFixed(2)}/mo`
            : "Free"}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            platform.is_subscribed ? styles.subscribed : styles.unsubscribed,
          ]}
          onPress={() => onToggle(platform)}
        >
          <Text style={styles.toggleText}>
            {platform.is_subscribed ? "Subscribed" : "Subscribe"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(platform.id)} style={styles.deleteBtn}>
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
  info: { flex: 1 },
  name: { color: "#cdd6f4", fontSize: 16, fontWeight: "600" },
  cost: { color: "#6c7086", fontSize: 13, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  subscribed: { backgroundColor: "#a6e3a1" },
  unsubscribed: { backgroundColor: "#313244" },
  toggleText: { color: "#1e1e2e", fontSize: 12, fontWeight: "700" },
  deleteBtn: { padding: 6 },
  deleteText: { color: "#f38ba8", fontSize: 16, fontWeight: "700" },
});
