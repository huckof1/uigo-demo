import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type { TenantPurpose } from "@/features/auth/DemoSessionProvider";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";

const purposeOptions: Array<{
  label: string;
  value: TenantPurpose;
}> = [
  { label: "Срочно сейчас", value: "urgent" },
  { label: "На несколько часов", value: "hours" },
  { label: "На сутки", value: "daily" },
];

export default function TenantProfileSetupScreen() {
  const {
    addBookingRequest,
    clearAuthIntent,
    completeTenantProfile,
    isAuthenticated,
    pendingAuthIntent,
  } = useDemoSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [purpose, setPurpose] = useState<TenantPurpose>("urgent");
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    router.replace("/auth" as never);
    return <View style={styles.screen} />;
  }

  function completeSetup() {
    if (name.trim().length < 2 || phone.trim().length < 5 || city.trim().length < 2) {
      setError("Заполните имя, телефон и город");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    completeTenantProfile({
      city: city.trim(),
      name: name.trim(),
      phone: phone.trim(),
      purpose,
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (pendingAuthIntent?.intent === "booking" && pendingAuthIntent.propertyId) {
      const bookedPropertyId = pendingAuthIntent.propertyId;
      addBookingRequest(bookedPropertyId);
      clearAuthIntent();
      router.replace({
        pathname: "/requests",
        params: {
          created: "1",
          propertyId: bookedPropertyId,
        },
      } as never);
      return;
    }

    clearAuthIntent();
    router.replace("/profile" as never);
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Анкета" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.hero}>
          <Text style={styles.eyebrow}>Найти жилье</Text>
          <Text style={styles.title}>Заполните профиль</Text>
          <Text style={styles.subtitle}>
            Эти данные нужны для demo-заявки владельцу и быстрого подбора вариантов.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(560).springify()}>
          <GlassPanel glow variant="floating">
            <View style={styles.form}>
              <View style={styles.inputBox}>
                <Feather color="rgba(255,255,255,0.62)" name="user" size={18} />
                <TextInput
                  onChangeText={(value) => {
                    setError("");
                    setName(value);
                  }}
                  placeholder="Имя"
                  placeholderTextColor="rgba(255,255,255,0.42)"
                  style={styles.input}
                  value={name}
                />
              </View>

              <View style={styles.inputBox}>
                <Feather color="rgba(255,255,255,0.62)" name="phone" size={18} />
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={(value) => {
                    setError("");
                    setPhone(value);
                  }}
                  placeholder="Телефон"
                  placeholderTextColor="rgba(255,255,255,0.42)"
                  style={styles.input}
                  value={phone}
                />
              </View>

              <View style={styles.inputBox}>
                <Feather color="rgba(255,255,255,0.62)" name="map-pin" size={18} />
                <TextInput
                  onChangeText={(value) => {
                    setError("");
                    setCity(value);
                  }}
                  placeholder="Город"
                  placeholderTextColor="rgba(255,255,255,0.42)"
                  style={styles.input}
                  value={city}
                />
              </View>

              <View style={styles.purposeGroup}>
                <Text style={styles.purposeTitle}>Цель</Text>
                {purposeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setPurpose(option.value);
                    }}
                    style={[
                      styles.purposeOption,
                      purpose === option.value && styles.purposeOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.purposeText,
                        purpose === option.value && styles.purposeTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {purpose === option.value ? (
                      <Feather color="#171512" name="check" size={16} />
                    ) : null}
                  </Pressable>
                ))}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <PremiumButton
                iconName="arrow-right"
                label="Продолжить"
                onPress={completeSetup}
              />
            </View>
          </GlassPanel>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#11100E",
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  hero: {
    gap: 8,
  },
  eyebrow: {
    color: "rgba(255,247,235,0.58)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36,
  },
  subtitle: {
    color: "rgba(255,247,235,0.7)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  form: {
    gap: 12,
    padding: 16,
  },
  inputBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  input: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
  purposeGroup: {
    gap: 8,
    marginTop: 4,
  },
  purposeTitle: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  purposeOption: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
    paddingHorizontal: 13,
  },
  purposeOptionActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(255,255,255,0.94)",
  },
  purposeText: {
    color: "rgba(255,247,235,0.76)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  purposeTextActive: {
    color: "#171512",
  },
  error: {
    color: "#FFD7C9",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
