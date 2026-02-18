import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RecommendationCard from "../components/insights/RecommendationCard";
import { insightsApi } from "../services/api";

function SummaryChip({ label, value, color }) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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
  const cancelCount = recs.filter((r) => r.action === "cancel").length;
  const reviewCount = recs.filter((r) => r.action === "review").length;
  const keepCount   = recs.filter((r) => r.action === "keep").length;

  const potentialSavings = recs
    .filter((r) => r.action === "cancel")
    .reduce((sum, r) => sum + r.monthly_cost, 0);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recs}
        keyExtractor={(r) => String(r.platform_id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#cba6f7"
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.heading}>Insights</Text>
              {insights?.generated_at && (
                <Text style={styles.subheading}>
                  Updated {new Date(insights.generated_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>

            {/* Summary strip */}
            <View style={styles.summaryStrip}>
              <SummaryChip
                label="Monthly"
                value={`$${(insights?.total_monthly_spend ?? 0).toFixed(2)}`}
                color="#cba6f7"
              />
              <View style={styles.divider} />
              <SummaryChip label="Keep"   value={keepCount}   color="#a6e3a1" />
              <SummaryChip label="Review" value={reviewCount} color="#f9e2af" />
              <SummaryChip label="Cancel" value={cancelCount} color="#f38ba8" />
            </View>

            {/* Savings banner */}
            {potentialSavings > 0 && (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsLabel}>Potential savings</Text>
                <View>
                  <Text style={styles.savingsMonthly}>
                    ${potentialSavings.toFixed(2)}/mo
                  </Text>
                  <Text style={styles.savingsAnnual}>
                    ${(potentialSavings * 12).toFixed(2)}/year
                  </Text>
                </View>
              </View>
            )}

            {/* Data coverage note */}
            {insights?.data_coverage_note && (
              <Text style={styles.coverageNote}>{insights.data_coverage_note}</Text>
            )}

            {recs.length === 0 && (
              <Text style={styles.empty}>
                No subscribed platforms yet.{"\n"}Add platforms and mark them as subscribed to see recommendations.
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <RecommendationCard
            recommendation={item}
            expanded={expandedId === item.platform_id}
            onPress={() =>
              setExpandedId((prev) =>
                prev === item.platform_id ? null : item.platform_id
              )
            }
          />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#11111b" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  heading: { color: "#cdd6f4", fontSize: 26, fontWeight: "800" },
  subheading: { color: "#6c7086", fontSize: 12, marginTop: 2 },
  summaryStrip: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "space-around",
  },
  chip: { alignItems: "center" },
  chipValue: { fontSize: 18, fontWeight: "800" },
  chipLabel: { color: "#6c7086", fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 36, backgroundColor: "#313244" },
  savingsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#1e1e2e",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#a6e3a1",
  },
  savingsLabel: { color: "#a6adc8", fontSize: 13 },
  savingsMonthly: { color: "#a6e3a1", fontSize: 16, fontWeight: "800", textAlign: "right" },
  savingsAnnual: { color: "#6c7086", fontSize: 11, textAlign: "right" },
  coverageNote: {
    color: "#6c7086",
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    fontStyle: "italic",
  },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  empty: {
    color: "#6c7086",
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
    lineHeight: 24,
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
