import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ContentCard from "../components/discovery/ContentCard";
import StatsCard from "../components/discovery/StatsCard";
import { discoveryApi } from "../services/api";

function Section({ title, accent, children, empty }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: accent }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children ?? <Text style={styles.sectionEmpty}>{empty}</Text>}
    </View>
  );
}

function PlatformRow({ platform }) {
  const pct =
    platform.total > 0
      ? Math.round((platform.watched / platform.total) * 100)
      : 0;
  return (
    <View style={styles.platformRow}>
      <View style={[styles.platformDot, { backgroundColor: platform.color }]} />
      <View style={styles.platformInfo}>
        <View style={styles.platformMeta}>
          <Text style={styles.platformName}>{platform.platform_name}</Text>
          <Text style={styles.platformCount}>
            {platform.watched}/{platform.total} watched
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${pct}%`, backgroundColor: platform.color },
            ]}
          />
        </View>
      </View>
      {platform.is_subscribed && (
        <View style={styles.subBadge}>
          <Text style={styles.subBadgeText}>Active</Text>
        </View>
      )}
    </View>
  );
}

export default function DiscoveryScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await discoveryApi.get();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#cba6f7" size="large" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const isEmpty =
    !data ||
    (data.stats.total_items === 0 && data.platform_breakdown.length === 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#cba6f7"
          />
        }
      >
        {/* Heading */}
        <View style={styles.header}>
          <Text style={styles.heading}>Discover</Text>
          <Text style={styles.subheading}>Your streaming overview</Text>
        </View>

        {isEmpty ? (
          <Text style={styles.globalEmpty}>
            Nothing here yet.{"\n"}Add platforms and watchlist items to get started.
          </Text>
        ) : (
          <>
            {/* Stats overview */}
            {data.stats.total_items > 0 && <StatsCard stats={data.stats} />}

            {/* Continue Watching */}
            <Section
              title="Continue Watching"
              accent="#f59e0b"
              empty="Nothing in progress yet."
            >
              {data.continue_watching.length > 0
                ? data.continue_watching.map((item, i) => (
                    <ContentCard key={item.id} item={item} index={i} />
                  ))
                : null}
            </Section>

            {/* Up Next */}
            <Section
              title="Up Next"
              accent="#6366f1"
              empty="Your queue is empty — add items to your watchlist."
            >
              {data.up_next.length > 0
                ? data.up_next.map((item, i) => (
                    <ContentCard key={item.id} item={item} index={i} />
                  ))
                : null}
            </Section>

            {/* Recently Completed */}
            {data.recently_completed.length > 0 && (
              <Section title="Recently Completed" accent="#10b981">
                {data.recently_completed.map((item, i) => (
                  <ContentCard key={item.id} item={item} index={i} />
                ))}
              </Section>
            )}

            {/* Platform Breakdown */}
            {data.platform_breakdown.length > 0 && (
              <Section title="By Platform" accent="#cba6f7">
                {data.platform_breakdown.map((p) => (
                  <PlatformRow key={p.platform_name} platform={p} />
                ))}
              </Section>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { paddingTop: 16, paddingBottom: 12 },
  heading: { color: "#cdd6f4", fontSize: 26, fontWeight: "800" },
  subheading: { color: "#6c7086", fontSize: 13, marginTop: 2 },
  globalEmpty: {
    color: "#6c7086",
    textAlign: "center",
    marginTop: 80,
    fontSize: 15,
    lineHeight: 24,
  },
  errorText: {
    color: "#f38ba8",
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
    paddingHorizontal: 24,
  },
  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, marginRight: 8 },
  sectionTitle: { color: "#cdd6f4", fontSize: 16, fontWeight: "700" },
  sectionEmpty: { color: "#45475a", fontSize: 13, fontStyle: "italic", marginLeft: 11 },
  // Platform rows
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  platformDot: { width: 10, height: 10, borderRadius: 5 },
  platformInfo: { flex: 1 },
  platformMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  platformName: { color: "#cdd6f4", fontSize: 14, fontWeight: "600" },
  platformCount: { color: "#6c7086", fontSize: 12 },
  barTrack: {
    height: 4,
    backgroundColor: "#313244",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2 },
  subBadge: {
    backgroundColor: "#a6e3a122",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  subBadgeText: { color: "#a6e3a1", fontSize: 10, fontWeight: "700" },
});
