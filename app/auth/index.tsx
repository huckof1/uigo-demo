import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  type AuthIntent,
  useDemoSession,
} from "@/features/auth/DemoSessionProvider";
import {
  formatTenge,
  getAvailabilityText,
  getPropertyById,
} from "@/lib/mock/properties";

export default function AuthScreen() {
  const params = useLocalSearchParams<{
    intent?: AuthIntent;
    propertyId?: string;
  }>();
  const property = getPropertyById(params.propertyId);
  const cover = useMemo(
    () => [...property.photos].sort((left, right) => left.priority - right.priority)[0],
    [property.photos],
  );
  const { completeEmailDemoAuth, pendingAuthIntent, startAuthIntent } = useDemoSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const intent = params.intent ?? pendingAuthIntent?.intent;
  const propertyId = params.propertyId ?? pendingAuthIntent?.propertyId;
  const isBooking = intent === "booking";
  const normalizedEmail = email.trim().toLowerCase();

  function completeEmailLogin() {
    if (!normalizedEmail.includes("@") || normalizedEmail.length < 5) {
      setError("Введите почту для demo-регистрации");
      return;
    }

    setError("");
    startAuthIntent({
      intent: intent ?? "profile",
      propertyId,
    });
    completeEmailDemoAuth(normalizedEmail);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    router.replace("/onboarding" as never);
  }

  return (
    <View style={styles.screen}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={{ uri: cover.url }}
        style={styles.background}
      >
        <View pointerEvents="none" style={styles.shade} />

        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.content}
          >
            <View style={styles.header}>
              <Pressable
                accessibilityLabel="Назад"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/");
                  }
                }}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Feather color="#FFFFFF" name="chevron-left" size={22} />
              </Pressable>
              <View>
                <Text style={styles.logo}>UiGo</Text>
                <Text style={styles.subtitle}>
                  {isBooking ? "Бронь после регистрации" : "Быстрая регистрация"}
                </Text>
              </View>
            </View>

            <GlassPanel glow variant="floating">
              <View style={styles.card}>
                <View style={styles.iconWrap}>
                  <Feather color="#FFFFFF" name="mail" size={22} />
                </View>
                <Text style={styles.title}>Введите почту</Text>
                <Text style={styles.description}>
                  Если почта введена, считаем, что demo-аккаунт уже зарегистрирован,
                  и сразу продолжаем действие.
                </Text>

                {propertyId ? (
                  <View style={styles.propertyBox}>
                    <Text numberOfLines={1} style={styles.propertyTitle}>
                      {property.title}
                    </Text>
                    <Text style={styles.propertyMeta}>
                      {property.city}, {property.district}
                    </Text>
                    <Text style={styles.propertyStatus}>{getAvailabilityText(property)}</Text>
                    <Text style={styles.propertyPrice}>
                      {formatTenge(property.hourlyPrice)} ₸ / час
                    </Text>
                  </View>
                ) : null}

                <View style={styles.inputBox}>
                  <Feather color="rgba(255,255,255,0.62)" name="mail" size={18} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    maxLength={80}
                    onChangeText={(value) => {
                      setError("");
                      setEmail(value);
                    }}
                    onSubmitEditing={completeEmailLogin}
                    placeholder="you@email.com"
                    placeholderTextColor="rgba(255,255,255,0.42)"
                    returnKeyType="done"
                    style={styles.input}
                    value={email}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <PremiumButton
                  iconName="arrow-right"
                  label="Продолжить"
                  onPress={completeEmailLogin}
                />
              </View>
            </GlassPanel>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#11100E",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    backgroundColor: "#D2C4AE",
  },
  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 9, 8, 0.52)",
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingTop: 10,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.32)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  card: {
    gap: 14,
    padding: 18,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "#171512",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 32,
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 21,
  },
  propertyBox: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  propertyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  propertyMeta: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  propertyStatus: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 10,
  },
  propertyPrice: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4,
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
  error: {
    color: "#FFD7C9",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
