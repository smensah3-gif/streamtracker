import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import WatchlistItem from "../components/watchlist/WatchlistItem";
import { watchlistApi } from "../services/api";

const FILTERS = [
  { label: "All", value: null },
  { label: "Want to Watch", value: "want_to_watch" },
  { label: "Watching", value: "watching" },
  { label: "Watched", value: "watched" },
];

const EMPTY_FORM = {
  title: "",
  type: "movie",
  platform_name: "",
  notes: "",
};

export default function WatchlistScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await watchlistApi.list(filter);
      setItems(data);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await watchlistApi.update(id, { status: newStatus });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Remove", "Remove this from your watchlist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await watchlistApi.remove(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        platform_name: form.platform_name.trim() || null,
        notes: form.notes.trim() || null,
      };
      const created = await watchlistApi.create(payload);
      setItems((prev) => [created, ...prev]);
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Watchlist</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#cba6f7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <WatchlistItem
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No items yet. Tap "+ Add" to get started.</Text>
          }
        />
      )}

      {/* Add modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add to Watchlist</Text>

            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Inception"
              placeholderTextColor="#6c7086"
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {["movie", "show"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, type: t }))}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      form.type === t && styles.typeBtnTextActive,
                    ]}
                  >
                    {t === "movie" ? "Movie" : "TV Show"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Platform</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Netflix"
              placeholderTextColor="#6c7086"
              value={form.platform_name}
              onChangeText={(v) => setForm((f) => ({ ...f, platform_name: v }))}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 72 }]}
              placeholder="Optional notes..."
              placeholderTextColor="#6c7086"
              value={form.notes}
              onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setForm(EMPTY_FORM);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAdd}
                disabled={saving}
              >
                <Text style={styles.saveText}>{saving ? "Saving…" : "Add"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: { color: "#cdd6f4", fontSize: 26, fontWeight: "800" },
  addBtn: {
    backgroundColor: "#cba6f7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#11111b", fontWeight: "700", fontSize: 14 },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1e1e2e",
  },
  chipActive: { backgroundColor: "#cba6f7" },
  chipText: { color: "#6c7086", fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: "#11111b" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: "#6c7086", textAlign: "center", marginTop: 60, fontSize: 15 },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#1e1e2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: "#cdd6f4", fontSize: 20, fontWeight: "800", marginBottom: 16 },
  label: { color: "#a6adc8", fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#313244",
    color: "#cdd6f4",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 15,
  },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  typeBtn: {
    flex: 1,
    backgroundColor: "#313244",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: "#cba6f7" },
  typeBtnText: { color: "#6c7086", fontWeight: "600" },
  typeBtnTextActive: { color: "#11111b" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#313244",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { color: "#cdd6f4", fontWeight: "700" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#cba6f7",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#11111b", fontWeight: "700" },
});
