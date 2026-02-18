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
import PlatformCard from "../components/platforms/PlatformCard";
import { platformsApi } from "../services/api";

const PRESET_COLORS = [
  "#e50914", // Netflix red
  "#1ce783", // Hulu green
  "#113ccf", // Disney+ blue
  "#002be7", // Prime blue
  "#fc3c44", // Apple TV pink
  "#6366f1", // HBO purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
];

const EMPTY_FORM = { name: "", color: "#6366f1", monthly_cost: "" };

export default function PlatformsScreen() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformsApi.list();
      setPlatforms(data);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (platform) => {
    try {
      const updated = await platformsApi.update(platform.id, {
        is_subscribed: !platform.is_subscribed,
      });
      setPlatforms((prev) => prev.map((p) => (p.id === platform.id ? updated : p)));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Remove this platform?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await platformsApi.remove(id);
            setPlatforms((prev) => prev.filter((p) => p.id !== id));
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        color: form.color,
        monthly_cost: parseFloat(form.monthly_cost) || 0,
        is_subscribed: false,
      };
      const created = await platformsApi.create(payload);
      setPlatforms((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const totalMonthly = platforms
    .filter((p) => p.is_subscribed)
    .reduce((sum, p) => sum + p.monthly_cost, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Platforms</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {totalMonthly > 0 && (
        <View style={styles.costBanner}>
          <Text style={styles.costLabel}>Monthly spend</Text>
          <Text style={styles.costValue}>${totalMonthly.toFixed(2)}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#cba6f7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={platforms}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => (
            <PlatformCard
              platform={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No platforms yet. Tap "+ Add" to add one.
            </Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Platform</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Netflix"
              placeholderTextColor="#6c7086"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <Text style={styles.label}>Monthly Cost ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#6c7086"
              keyboardType="decimal-pad"
              value={form.monthly_cost}
              onChangeText={(v) => setForm((f) => ({ ...f, monthly_cost: v }))}
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    form.color === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </View>

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
  costBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e1e2e",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
  },
  costLabel: { color: "#a6adc8", fontSize: 14 },
  costValue: { color: "#a6e3a1", fontSize: 16, fontWeight: "800" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { color: "#6c7086", textAlign: "center", marginTop: 60, fontSize: 15 },
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
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#cdd6f4" },
  modalActions: { flexDirection: "row", gap: 12 },
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
