import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";
import {
  formatTenge,
  getAvailabilityText,
  getPropertyById,
  propertyTypeLabels,
} from "@/lib/mock/properties";

export default function RequestsScreen() {
  const params = useLocalSearchParams<{
    created?: string;
    propertyId?: string;
  }>();
  const {
    addBookingRequest,
    bookingPropertyIds,
    isAuthenticated,
    startAuthIntent,
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
    if (params.created === "1" && params.propertyId) {
      addBookingRequest(params.propertyId);
    }
  }, [params.created, params.propertyId]);

  const requestPropertyIds = useMemo(() => {
    const ids = [...bookingPropertyIds];

    if (params.created === "1" && params.propertyId && !ids.includes(params.propertyId)) {
      ids.unshift(params.propertyId);
    }

    return ids;
  }, [bookingPropertyIds, params.created, params.propertyId]);

  if (!isAuthenticated) {
    return <View style={styles.screen} />;
  }

  const hasRequests = requestPropertyIds.length > 0;

  return (
    <View style={styles.screen}>
      <AppHeader title="Мои заявки" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.hero}>
          <Text style={styles.eyebrow}>Бронирование</Text>
          <Text style={styles.title}>
            {hasRequests ? "Текущие заявки" : "Заявок пока нет"}
          </Text>
          <Text style={styles.subtitle}>
            {hasRequests
              ? "Здесь отображаются только ваши demo-заявки, созданные через кнопку «Бронь»."
              : "Новый пользователь начинает с чистого кабинета. Найдите объект на радаре и отправьте первую бронь."}
          </Text>
        </Animated.View>

        {params.created === "1" && params.propertyId ? (
          <GlassPanel glow variant="floating">
            <View style={styles.createdNotice}>
              <View style={styles.createdIcon}>
                <Feather color="#FFFFFF" name="send" size={18} />
              </View>
              <View style={styles.createdCopy}>
                <Text style={styles.createdTitle}>Заявка отправлена владельцу</Text>
                <Text style={styles.createdDescription}>
                  Владелец увидит запрос в demo-кабинете. В настоящей версии здесь будет быстрый ответ и push-уведомление.
                </Text>
              </View>
            </View>
          </GlassPanel>
        ) : null}

        {hasRequests ? (
          requestPropertyIds.map((propertyId, index) => {
            const property = getPropertyById(propertyId);

            return (
              <Animated.View
                entering={FadeInDown.delay(100 + index * 70).duration(520).springify()}
                key={propertyId}
              >
                <GlassPanel glow={index === 0} variant="strong">
                  <View style={styles.requestCard}>
                    <Image
                      resizeMode="cover"
                      source={{ uri: property.photos[0].url }}
                      style={styles.requestImage}
                    />
                    <View style={styles.requestCopy}>
                      <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Ожидает</Text>
                        <Text style={styles.createdText}>
                          {index === 0 ? "новая" : "demo"}
                        </Text>
                      </View>
                      <Text numberOfLines={1} style={styles.requestTitle}>
                        {propertyTypeLabels[property.type]} · {property.district}
                      </Text>
                      <Text numberOfLines={1} style={styles.requestMeta}>
                        {property.city}, {property.address}
                      </Text>
                      <Text style={styles.requestAvailability}>{getAvailabilityText(property)}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.price}>
                          {formatTenge(property.hourlyPrice)} ₸ / час
                        </Text>
                        <Text style={styles.daily}>
                          {formatTenge(property.dailyPrice)} ₸ / сутки
                        </Text>
                      </View>
                      <View style={styles.ownerRow}>
                        <Feather color="rgba(255,247,235,0.6)" name="user" size={13} />
                        <Text style={styles.ownerText}>
                          {property.ownerName} · отвечает ~{property.ownerResponseTimeMinutes} мин
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <PremiumButton
                      iconName="arrow-up-right"
                      label="Объект"
                      onPress={() => router.push(`/property/${property.id}` as never)}
                      style={styles.actionButton}
                      variant="glass"
                    />
                    <PremiumButton
                      iconName="message-circle"
                      label="Чат"
                      onPress={() => router.push(`/chat/${property.id}` as never)}
                      style={styles.actionButton}
                      variant="ghost"
                    />
                  </View>
                </GlassPanel>
              </Animated.View>
            );
          })
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(520).springify()}>
            <GlassPanel glow variant="floating">
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Feather color="#FFFFFF" name="inbox" size={24} />
                </View>
                <Text style={styles.emptyTitle}>Заявок пока нет</Text>
                <Text style={styles.emptyText}>
                  Откройте радар, выберите свободный объект и нажмите «Бронь».
                </Text>
                <PremiumButton
                  iconName="radio"
                  label="Открыть радар"
                  onPress={() => router.push("/map" as never)}
                />
              </View>
            </GlassPanel>
          </Animated.View>
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
  createdNotice: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  createdIcon: {
    alignItems: "center",
    backgroundColor: "#11A665",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  createdCopy: {
    flex: 1,
    gap: 4,
  },
  createdTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  createdDescription: {
    color: "rgba(255,247,235,0.66)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
  },
  requestCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  requestImage: {
    width: 92,
    height: 126,
    borderRadius: 24,
    backgroundColor: "#BFAF9A",
  },
  requestCopy: {
    flex: 1,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFC22E",
  },
  statusText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  createdText: {
    color: "rgba(255,247,235,0.5)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
  },
  requestTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 8,
  },
  requestMeta: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  requestAvailability: {
    color: "rgba(181,255,219,0.88)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 7,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  daily: {
    color: "rgba(255,247,235,0.64)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
  },
  ownerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 9,
  },
  ownerText: {
    color: "rgba(255,247,235,0.58)",
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 26,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  emptyText: {
    color: "rgba(255,247,235,0.66)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: "center",
  },
});
