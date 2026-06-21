import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";

export default function OnboardingScreen() {
  const { email, isAuthenticated, selectMode } = useDemoSession();

  if (!isAuthenticated) {
    router.replace("/auth" as never);
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Старт" />

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.hero}>
          <Text style={styles.eyebrow}>{email}</Text>
          <Text style={styles.title}>Что вы хотите сделать?</Text>
          <Text style={styles.subtitle}>
            Выберите сценарий, чтобы UiGo открыл правильный кабинет без лишних экранов.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(90).duration(560).springify()}>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              selectMode("tenant");
              router.push("/profile/setup" as never);
            }}
          >
            <GlassPanel glow variant="floating">
              <View style={styles.choiceCard}>
                <View style={styles.choiceIcon}>
                  <Feather color="#FFFFFF" name="search" size={22} />
                </View>
                <View style={styles.choiceCopy}>
                  <Text style={styles.choiceTitle}>Найти жилье</Text>
                  <Text style={styles.choiceText}>
                    Заполните короткую анкету арендатора и продолжите поиск или бронь.
                  </Text>
                </View>
                <Feather color="rgba(255,255,255,0.7)" name="chevron-right" size={20} />
              </View>
            </GlassPanel>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(560).springify()}>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              selectMode("owner");
              router.replace("/owner" as never);
            }}
          >
            <GlassPanel variant="strong">
              <View style={styles.choiceCard}>
                <View style={styles.choiceIcon}>
                  <Feather color="#FFFFFF" name="home" size={22} />
                </View>
                <View style={styles.choiceCopy}>
                  <Text style={styles.choiceTitle}>Сдать жилье</Text>
                  <Text style={styles.choiceText}>
                    Откройте demo-кабинет владельца и управляйте готовностью объектов.
                  </Text>
                </View>
                <Feather color="rgba(255,255,255,0.7)" name="chevron-right" size={20} />
              </View>
            </GlassPanel>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#11100E",
  },
  content: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  hero: {
    gap: 8,
    marginBottom: 4,
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
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 38,
  },
  subtitle: {
    color: "rgba(255,247,235,0.7)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  choiceCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
    minHeight: 126,
    padding: 16,
  },
  choiceIcon: {
    alignItems: "center",
    backgroundColor: "#171512",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  choiceCopy: {
    flex: 1,
    gap: 5,
  },
  choiceTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
  },
  choiceText: {
    color: "rgba(255,247,235,0.68)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 19,
  },
});
