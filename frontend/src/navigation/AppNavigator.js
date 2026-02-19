import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

import { useAuth } from "../context/AuthContext";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import InsightsScreen from "../screens/InsightsScreen";
import PlatformsScreen from "../screens/PlatformsScreen";
import WatchlistScreen from "../screens/WatchlistScreen";

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppNavigator() {
  const { signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#1e1e2e" },
          headerTintColor: "#cdd6f4",
          headerTitleStyle: { fontWeight: "700" },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: "#f38ba8", fontSize: 13, fontWeight: "600" }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          ),
          tabBarStyle: {
            backgroundColor: "#1e1e2e",
            borderTopColor: "#313244",
          },
          tabBarActiveTintColor: "#cba6f7",
          tabBarInactiveTintColor: "#6c7086",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        }}
      >
        <Tab.Screen
          name="Discover"
          component={DiscoveryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Watchlist"
          component={WatchlistScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎬" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Platforms"
          component={PlatformsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="📺" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
