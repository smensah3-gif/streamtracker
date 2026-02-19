import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const PLATFORM_CATALOG = [
  { name: "Netflix",         color: "#E50914", suggestedPrice: 15.49 },
  { name: "Disney+",         color: "#113CCF", suggestedPrice: 13.99 },
  { name: "Hulu",            color: "#1CE783", suggestedPrice: 17.99 },
  { name: "Max",             color: "#002BE7", suggestedPrice: 15.99 },
  { name: "Prime Video",     color: "#00A8E0", suggestedPrice: 8.99  },
  { name: "Apple TV+",       color: "#6e6e6e", suggestedPrice: 9.99  },
  { name: "Peacock",         color: "#F5821E", suggestedPrice: 5.99  },
  { name: "Paramount+",      color: "#0064FF", suggestedPrice: 5.99  },
  { name: "ESPN+",           color: "#E4151A", suggestedPrice: 10.99 },
  { name: "Showtime",        color: "#C41230", suggestedPrice: 10.99 },
  { name: "Starz",           color: "#7b4b9a", suggestedPrice: 8.99  },
  { name: "Discovery+",      color: "#2175D9", suggestedPrice: 4.99  },
  { name: "YouTube Premium", color: "#FF0000", suggestedPrice: 13.99 },
  { name: "Crunchyroll",     color: "#F47521", suggestedPrice: 7.99  },
  { name: "AMC+",            color: "#c4242b", suggestedPrice: 8.99  },
];

function StepIndicator({ current }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3].map((n) => (
        <View key={n} style={[styles.stepDot, n === current && styles.stepActive]} />
      ))}
    </View>
  );
}

export default function PlatformPickerScreen({ onNext }) {
  const [selected, setSelected] = useState(new Set());

  const toggle = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator current={1} />

      <Text style={styles.title}>Which platforms{"\n"}do you subscribe to?</Text>
      <Text style={styles.subtitle}>Select all that apply</Text>

      <FlatList
        data={PLATFORM_CATALOG}
        keyExtractor={(p) => p.name}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.name);
          return (
            <TouchableOpacity
              style={[
                styles.tile,
                { borderTopColor: item.color, borderTopWidth: 3 },
                isSelected && styles.tileSelected,
              ]}
              onPress={() => toggle(item.name)}
              activeOpacity={0.75}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
              <Text style={styles.tileName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.tilePrice}>${item.suggestedPrice}/mo</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, selected.size === 0 && styles.btnMuted]}
          onPress={() => onNext(PLATFORM_CATALOG.filter((p) => selected.has(p.name)))}
          disabled={selected.size === 0}
        >
          <Text style={styles.btnText}>
            Continue{selected.size > 0 ? ` (${selected.size})` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => onNext([])}>
          <Text style={styles.skipText}>Skip setup for now</Text>
        </TouchableOpacity>
      </View>
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
  grid: { paddingHorizontal: 12, paddingBottom: 12 },
  row: { justifyContent: "flex-start", marginBottom: 10, gap: 8 },
  tile: {
    flex: 1,
    maxWidth: "31%",
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#313244",
    minHeight: 72,
    justifyContent: "flex-end",
  },
  tileSelected: { borderColor: "#cba6f7", backgroundColor: "#1e1e2e" },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#cba6f7",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "#11111b", fontSize: 10, fontWeight: "900" },
  tileName: { color: "#cdd6f4", fontSize: 12, fontWeight: "700", marginBottom: 2 },
  tilePrice: { color: "#6c7086", fontSize: 10 },
  footer: {
    padding: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e1e2e",
  },
  btn: {
    backgroundColor: "#cba6f7",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  btnMuted: { opacity: 0.4 },
  btnText: { color: "#11111b", fontSize: 16, fontWeight: "800" },
  skipBtn: { alignItems: "center", paddingVertical: 4 },
  skipText: { color: "#45475a", fontSize: 14 },
});
