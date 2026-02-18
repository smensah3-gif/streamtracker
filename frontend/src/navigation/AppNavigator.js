import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text } from "react-native";

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
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
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
