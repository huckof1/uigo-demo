import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  type TenantPurpose,
  useDemoSession,
} from "@/features/auth/DemoSessionProvider";

const purposeLabels: Record<TenantPurpose, string> = {
  daily: "на сутки",
  hours: "на несколько часов",
  urgent: "срочно сейчас",
};

export default function ProfileScreen() {
  const {
    bookingPropertyIds,
    email,
    isAuthenticated,
    selectedMode,
    startAuthIntent,
    tenantProfile,
    tenantProfileComplete,
  } = useDemoSession();

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    startAuthIntent({ intent: "profile" });
    router.replace({
      pathname: "/auth",
      params: {
        intent: "profile",
      },
    } as never);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || selectedMode) {
      return;
    }

    router.replace("/onboarding" as never);
  }, [isAuthenticated, selectedMode]);

  if (!isAuthenticated) {
    return <View style={styles.screen} />;
  }

  if (selectedMode === "owner") {
    router.replace("/owner" as never);
    return <View style={styles.screen} />;
  }

  const hasProfile = tenantProfileComplete && tenantProfile;

  return (
    <View style={styles.screen}>
      <AppHeader title="Кабинет" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.hero}>
          <Text style={styles.eyebrow}>Арендатор</Text>
          <Text style={styles.title}>
            {hasProfile ? "Ваш UiGo кабинет" : "Профиль пока пустой"}
          </Text>
          <Text style={styles.subtitle}>
            {hasProfile
              ? "Здесь будет ваш быстрый центр поиска, броней и заявок."
              : "Заполните короткую анкету, чтобы UiGo понимал, что вы ищете и мог отправлять заявки владельцам."}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(560).springify()}>
          <GlassPanel glow variant="floating">
            <View style={styles.profileCard}>
              <View style={styles.identityRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {hasProfile ? tenantProfile.name.trim()[0]?.toUpperCase() : "U"}
                  </Text>
                </View>
                <View style={styles.identityCopy}>
                  <Text style={styles.identityName}>
                    {hasProfile ? tenantProfile.name : "Новый пользователь"}
                  </Text>
                  <Text style={styles.identityMeta}>{email ?? "demo вход активен"}</Text>
                </View>
              </View>

              {hasProfile ? (
                <View style={styles.profileFacts}>
                  <View style={styles.factRow}>
                    <Feather color="rgba(255,247,235,0.7)" name="phone" size={15} />
                    <Text style={styles.factText}>{tenantProfile.phone}</Text>
                  </View>
                  <View style={styles.factRow}>
                    <Feather color="rgba(255,247,235,0.7)" name="map-pin" size={15} />
                    <Text style={styles.factText}>{tenantProfile.city}</Text>
                  </View>
                  <View style={styles.factRow}>
                    <Feather color="rgba(255,247,235,0.7)" name="clock" size={15} />
                    <Text style={styles.factText}>{purposeLabels[tenantProfile.purpose]}</Text>
                  </View>
                </View>
              ) : (
                <PremiumButton
                  iconName="edit-3"
                  label="Заполнить профиль"
                  onPress={() => router.push("/profile/setup" as never)}
                />
              )}
            </View>
          </GlassPanel>
        </Animated.View>

        {hasProfile ? (
          <>
            <View style={styles.actionGrid}>
              <PremiumButton
                iconName="radio"
                label="Открыть радар"
                onPress={() => router.push("/map" as never)}
              />
              <PremiumButton
                iconName="inbox"
                label="Мои заявки"
                onPress={() => router.push("/requests" as never)}
                variant="glass"
              />
            </View>

            <GlassPanel variant="strong">
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyTitle}>
                  {bookingPropertyIds.length > 0
                    ? `Активных заявок: ${bookingPropertyIds.length}`
                    : "Заявок пока нет"}
                </Text>
                <Text style={styles.emptyText}>
                  {bookingPropertyIds.length > 0
                    ? "Откройте заявки, чтобы посмотреть отправленные брони и статусы владельцев."
                    : "Как только вы нажмете «Бронь» на объекте, заявка появится здесь без старой demo-истории."}
                </Text>
              </View>
            </GlassPanel>
          </>
        ) : (
          <GlassPanel variant="strong">
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>Сначала анкета</Text>
              <Text style={styles.emptyText}>
                Новый аккаунт не должен выглядеть заполненным. После анкеты здесь появятся только ваши реальные demo-действия.
              </Text>
            </View>
          </GlassPanel>
        )}
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
  profileCard: {
    gap: 16,
    padding: 16,
  },
  identityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 27,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  avatarText: {
    color: "#171512",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  identityName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  identityMeta: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  profileFacts: {
    gap: 9,
  },
  factRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  factText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actionGrid: {
    gap: 10,
  },
  emptyBlock: {
    gap: 7,
    padding: 16,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  emptyText: {
    color: "rgba(255,247,235,0.64)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
