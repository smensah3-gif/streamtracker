import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GENRES = [
  "Action", "Comedy", "Drama", "Thriller", "Horror",
  "Sci-Fi", "Documentary", "Romance", "Animation", "Reality",
  "Fantasy", "Crime", "Mystery", "Sports", "Kids",
];

const CONTENT_TYPES = [
  { key: "both",   label: "Movies & Shows" },
  { key: "movies", label: "Movies" },
  { key: "shows",  label: "TV Shows" },
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

export default function PreferencesScreen({ onFinish, onBack }) {
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [contentType, setContentType] = useState("both");
  const [loading, setLoading] = useState(false);

  const toggleGenre = (g) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await onFinish({ genres: [...selectedGenres], contentType });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator current={3} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What do you{"\n"}like to watch?</Text>
        <Text style={styles.subtitle}>
          We'll use this to personalise your experience.
        </Text>

        <Text style={styles.sectionLabel}>CONTENT TYPE</Text>
        <View style={styles.contentTypeRow}>
          {CONTENT_TYPES.map((ct) => (
            <TouchableOpacity
              key={ct.key}
              style={[styles.ctChip, contentType === ct.key && styles.ctChipActive]}
              onPress={() => setContentType(ct.key)}
            >
              <Text
                style={[
                  styles.ctChipText,
                  contentType === ct.key && styles.ctChipTextActive,
                ]}
              >
                {ct.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>GENRES</Text>
        <Text style={styles.genreHint}>
          {selectedGenres.size === 0 ? "Pick your favourites" : `${selectedGenres.size} selected`}
        </Text>
        <View style={styles.genreGrid}>
          {GENRES.map((g) => {
            const active = selectedGenres.has(g);
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genreChip, active && styles.genreChipActive]}
                onPress={() => toggleGenre(g)}
              >
                <Text style={[styles.genreText, active && styles.genreTextActive]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.skipNote}>
          You can update these preferences anytime in settings.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} disabled={loading}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#11111b" />
          ) : (
            <Text style={styles.btnText}>Get Started</Text>
          )}
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
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#313244" },
  stepActive: { backgroundColor: "#cba6f7", width: 24 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  title: {
    color: "#cdd6f4",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: { color: "#6c7086", fontSize: 14, marginBottom: 28 },
  sectionLabel: {
    color: "#6c7086",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  contentTypeRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  ctChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1e1e2e",
    borderWidth: 1,
    borderColor: "#313244",
  },
  ctChipActive: { borderColor: "#cba6f7", backgroundColor: "#2a1f3d" },
  ctChipText: { color: "#6c7086", fontSize: 13, fontWeight: "600" },
  ctChipTextActive: { color: "#cba6f7" },
  genreHint: { color: "#45475a", fontSize: 12, marginBottom: 12 },
  genreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e1e2e",
    borderWidth: 1,
    borderColor: "#313244",
  },
  genreChipActive: { borderColor: "#cba6f7", backgroundColor: "#2a1f3d" },
  genreText: { color: "#6c7086", fontSize: 13, fontWeight: "600" },
  genreTextActive: { color: "#cba6f7" },
  skipNote: {
    color: "#45475a",
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 8,
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
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#11111b", fontSize: 16, fontWeight: "800" },
});
