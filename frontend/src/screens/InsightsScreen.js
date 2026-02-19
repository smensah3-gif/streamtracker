import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SavingsRecommendationCard from "../components/insights/SavingsRecommendationCard";
import SpendingHeroCard from "../components/insights/SpendingHeroCard";
import UnderutilizedCard from "../components/insights/UnderutilizedCard";
import { insightsApi } from "../services/api";

export default function InsightsScreen() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await insightsApi.get();
      setInsights(data);
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
        <Text style={styles.loadingText}>Analyzing subscriptions…</Text>
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

  const recs = insights?.recommendations ?? [];
  const features = insights?.platform_features ?? [];

  // O(1) feature lookup by platform_id
  const featuresMap = {};
  features.forEach((f) => { featuresMap[f.platform_id] = f; });

  const potentialSavings = recs
    .filter((r) => r.action === "cancel")
    .reduce((sum, r) => sum + r.monthly_cost, 0);

  // Underutilized = cancel/review with low engagement or long inactivity
  const underutilized = recs.filter((r) => {
    if (r.action === "keep") return false;
    const f = featuresMap[r.platform_id];
    return f && (f.engagement_rate < 0.25 || f.days_since_last_activity > 14);
  });

  const cancelRecs = recs.filter((r) => r.action === "cancel");
  const reviewRecs = recs.filter((r) => r.action === "review");
  const keepRecs   = recs.filter((r) => r.action === "keep");

  if (recs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#cba6f7"
            />
          }
        >
          <Text style={styles.emptyTitle}>No subscriptions yet</Text>
          <Text style={styles.emptyBody}>
            Add platforms and mark them as subscribed to see your spending dashboard and
            personalized recommendations.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#cba6f7"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {insights?.generated_at && (
          <Text style={styles.timestamp}>
            Updated{" "}
            {new Date(insights.generated_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}

        {/* ── Hero spend card ── */}
        <SpendingHeroCard
          totalMonthly={insights?.total_monthly_spend ?? 0}
          potentialSavings={potentialSavings}
          platformCount={insights?.subscribed_platform_count ?? 0}
        />

        {insights?.data_coverage_note && (
          <Text style={styles.coverageNote}>{insights.data_coverage_note}</Text>
        )}

        {/* ── Underutilized (horizontal scroll) ── */}
        {underutilized.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Underutilized</Text>
              <Text style={styles.sectionSubtitle}>
                Low engagement · consider cancelling
              </Text>
            </View>
            <FlatList
              data={underutilized}
              keyExtractor={(r) => String(r.platform_id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => (
                <UnderutilizedCard
                  features={featuresMap[item.platform_id]}
                  recommendation={item}
                />
              )}
            />
          </View>
        )}

        {/* ── Cancel to save ── */}
        {cancelRecs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cancel to Save</Text>
              <Text style={[styles.sectionSubtitle, styles.savingsSubtitle]}>
                ${potentialSavings.toFixed(2)}/mo · ${(potentialSavings * 12).toFixed(2)}/yr
              </Text>
            </View>
            <View style={styles.cardList}>
              {cancelRecs.map((r) => (
                <SavingsRecommendationCard key={r.platform_id} recommendation={r} />
              ))}
            </View>
          </View>
        )}

        {/* ── Worth reviewing ── */}
        {reviewRecs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Worth Reviewing</Text>
              <Text style={styles.sectionSubtitle}>
                Borderline value — usage could tip either way
              </Text>
            </View>
            <View style={styles.cardList}>
              {reviewRecs.map((r) => (
                <SavingsRecommendationCard key={r.platform_id} recommendation={r} />
              ))}
            </View>
          </View>
        )}

        {/* ── Good value / keep ── */}
        {keepRecs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Good Value</Text>
              <Text style={[styles.sectionSubtitle, styles.keepSubtitle]}>
                These are earning their keep
              </Text>
            </View>
            <View style={styles.cardList}>
              {keepRecs.map((r) => (
                <SavingsRecommendationCard key={r.platform_id} recommendation={r} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  scrollContent: { paddingBottom: 40 },
  timestamp: {
    color: "#45475a",
    fontSize: 11,
    textAlign: "right",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  coverageNote: {
    color: "#6c7086",
    fontSize: 12,
    marginHorizontal: 16,
    marginTop: 10,
    fontStyle: "italic",
  },
  section: { marginTop: 24 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { color: "#cdd6f4", fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { color: "#6c7086", fontSize: 12, marginTop: 2 },
  savingsSubtitle: { color: "#f38ba8" },
  keepSubtitle: { color: "#a6e3a1" },
  horizontalList: { paddingHorizontal: 16, paddingBottom: 4 },
  cardList: { paddingHorizontal: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#cdd6f4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyBody: {
    color: "#6c7086",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingText: {
    color: "#6c7086",
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
  },
  errorText: {
    color: "#f38ba8",
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
    paddingHorizontal: 24,
  },
});
