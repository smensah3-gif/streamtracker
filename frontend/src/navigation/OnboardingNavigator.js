import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { platformsApi } from "../services/api";
import CostEntryScreen from "../screens/onboarding/CostEntryScreen";
import PlatformPickerScreen from "../screens/onboarding/PlatformPickerScreen";
import PreferencesScreen from "../screens/onboarding/PreferencesScreen";

export default function OnboardingNavigator() {
  const { completeOnboarding, userEmail } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [costs, setCosts] = useState({});

  const handlePlatformsNext = (platforms) => {
    setSelectedPlatforms(platforms);
    // Pre-fill costs from catalog suggested prices
    const initial = {};
    platforms.forEach((p) => { initial[p.name] = p.suggestedPrice; });
    setCosts(initial);
    setStep(2);
  };

  const handleCostsNext = (updatedCosts) => {
    setCosts(updatedCosts);
    setStep(3);
  };

  const handleFinish = async (preferences) => {
    // Persist viewing preferences locally per user
    if (userEmail) {
      await AsyncStorage.setItem(
        `@streamtracker:preferences:${userEmail}`,
        JSON.stringify(preferences)
      );
    }

    // Create each selected platform in the backend (ignore duplicates)
    if (selectedPlatforms.length > 0) {
      await Promise.all(
        selectedPlatforms.map((p) =>
          platformsApi
            .create({
              name: p.name,
              color: p.color,
              monthly_cost: costs[p.name] ?? p.suggestedPrice,
              is_subscribed: true,
            })
            .catch(() => null)
        )
      );
    }

    await completeOnboarding();
  };

  if (step === 1) {
    return <PlatformPickerScreen onNext={handlePlatformsNext} />;
  }

  if (step === 2) {
    return (
      <CostEntryScreen
        selectedPlatforms={selectedPlatforms}
        costs={costs}
        onNext={handleCostsNext}
        onBack={() => setStep(1)}
      />
    );
  }

  return <PreferencesScreen onFinish={handleFinish} onBack={() => setStep(2)} />;
}
