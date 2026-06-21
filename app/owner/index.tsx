import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  bookingStatusColors,
  bookingStatusLabels,
  mockBookingRequests,
} from "@/features/bookings/mockRequests";
import {
  availabilityColors,
  formatTenge,
  getAvailabilityText,
  getPropertyById,
  mockProperties,
  propertyTypeLabels,
} from "@/lib/mock/properties";
import type { MockProperty, PropertyAvailabilityStatus } from "@/lib/types/property";

const demoOwnerProperties = mockProperties.slice(0, 4);

type AvailabilityAction = {
  label: string;
  status: PropertyAvailabilityStatus;
};

const availabilityActions: AvailabilityAction[] = [
  { label: "Свободно сейчас", status: "available_now" },
  { label: "Скоро", status: "available_soon" },
  { label: "Занято", status: "occupied" },
];

export default function OwnerScreen() {
  const { propertyId, request } = useLocalSearchParams<{
    propertyId?: string;
    request?: string;
  }>();
  const bookingProperty = getPropertyById(propertyId);
  const hasBookingRequest = request === "booking" && Boolean(propertyId);
  const [acceptedRequestIds, setAcceptedRequestIds] = useState<string[]>([]);
  const [availabilityById, setAvailabilityById] = useState<
    Partial<Record<string, PropertyAvailabilityStatus>>
  >({});

  const ownerProperties = useMemo(() => {
    if (!hasBookingRequest) {
      return demoOwnerProperties;
    }

    const exists = demoOwnerProperties.some((property) => property.id === bookingProperty.id);
    return exists ? demoOwnerProperties : [bookingProperty, ...demoOwnerProperties.slice(0, 3)];
  }, [bookingProperty, hasBookingRequest]);

  const incomingRequests = useMemo(() => {
    const baseRequests = mockBookingRequests.slice(0, 3);

    if (!hasBookingRequest) {
      return baseRequests;
    }

    return [
      {
        id: `booking-${bookingProperty.id}`,
        createdLabel: "только что",
        guestName: "Арендатор рядом",
        message: "Нажал «Бронь» и ждет быстрый ответ владельца.",
        propertyId: bookingProperty.id,
        status: "urgent_pending" as const,
      },
      ...baseRequests.filter((item) => item.propertyId !== bookingProperty.id),
    ];
  }, [bookingProperty.id, hasBookingRequest]);

  function getVisualStatus(property: MockProperty) {
    return availabilityById[property.id] ?? property.availabilityStatus;
  }

  return (
    <View style={styles.screen}>
      <AppHeader title="Владелец" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(520).springify()} style={styles.hero}>
          <Text style={styles.eyebrow}>Demo owner mode</Text>
          <Text style={styles.title}>
            {hasBookingRequest ? "Новая бронь" : "Кабинет владельца"}
          </Text>
          <Text style={styles.subtitle}>
            Легкая панель для управления готовностью объектов и ответов на заявки.
            Это не админка, а демо-сценарий владельца.
          </Text>
        </Animated.View>

        {hasBookingRequest ? (
          <Animated.View entering={FadeInDown.delay(80).duration(560).springify()}>
            <GlassPanel glow variant="floating">
              <View style={styles.pushCard}>
                <View style={styles.pushIcon}>
                  <Feather color="#FFFFFF" name="bell" size={20} />
                </View>
                <View style={styles.pushCopy}>
                  <Text style={styles.pushTitle}>Push-уведомление отправлено</Text>
                  <Text style={styles.pushText}>
                    В MVP это мок-состояние: production push пока не подключается.
                  </Text>
                </View>
              </View>
            </GlassPanel>
          </Animated.View>
        ) : null}

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{ownerProperties.length}</Text>
            <Text style={styles.summaryLabel}>объекта</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>~7 мин</Text>
            <Text style={styles.summaryLabel}>ответ</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>92%</Text>
            <Text style={styles.summaryLabel}>ответов</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Входящие заявки</Text>
          <Text style={styles.sectionMeta}>demo</Text>
        </View>

        {incomingRequests.map((incoming, index) => {
          const property = getPropertyById(incoming.propertyId);
          const isAccepted = acceptedRequestIds.includes(incoming.id);
          const statusLabel = isAccepted
            ? "Принято"
            : bookingStatusLabels[incoming.status] ?? "Ожидает";
          const statusColor = isAccepted
            ? "#11A665"
            : bookingStatusColors[incoming.status] ?? "#FFC22E";

          return (
            <Animated.View
              entering={FadeInDown.delay(120 + index * 70).duration(520).springify()}
              key={incoming.id}
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
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={styles.statusText}>{statusLabel}</Text>
                      <Text style={styles.createdText}>{incoming.createdLabel}</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.requestTitle}>
                      {propertyTypeLabels[property.type]} · {property.district}
                    </Text>
                    <Text numberOfLines={2} style={styles.requestMessage}>
                      {incoming.message}
                    </Text>
                    <Text style={styles.requestPrice}>
                      {formatTenge(property.hourlyPrice)} ₸ / час ·{" "}
                      {formatTenge(property.dailyPrice)} ₸ / сутки
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <PremiumButton
                    disabled={isAccepted}
                    iconName="check"
                    label={isAccepted ? "Принято" : "Принять"}
                    onPress={() => {
                      void Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      setAcceptedRequestIds((current) => [...current, incoming.id]);
                    }}
                    style={styles.actionButton}
                  />
                  <PremiumButton
                    iconName="message-circle"
                    label="Написать"
                    onPress={() => router.push(`/chat/${incoming.id}` as never)}
                    style={styles.actionButton}
                    variant="glass"
                  />
                </View>
              </GlassPanel>
            </Animated.View>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Мои объекты</Text>
          <Text style={styles.sectionMeta}>готовность</Text>
        </View>

        {ownerProperties.map((property, index) => {
          const visualStatus = getVisualStatus(property);
          const colors = availabilityColors[visualStatus];

          return (
            <Animated.View
              entering={FadeInDown.delay(180 + index * 60).duration(520).springify()}
              key={property.id}
            >
              <GlassPanel variant="strong">
                <View style={styles.propertyCard}>
                  <Image
                    resizeMode="cover"
                    source={{ uri: property.photos[0].url }}
                    style={styles.propertyImage}
                  />
                  <View style={styles.propertyCopy}>
                    <Text style={styles.propertyType}>{propertyTypeLabels[property.type]}</Text>
                    <Text numberOfLines={1} style={styles.propertyTitle}>
                      {property.district}
                    </Text>
                    <Text numberOfLines={1} style={styles.propertyAddress}>
                      {property.city}, {property.address}
                    </Text>
                    <View style={[styles.availabilityBadge, { borderColor: colors.border }]}>
                      <View
                        style={[
                          styles.availabilityDot,
                          { backgroundColor: colors.background },
                        ]}
                      />
                      <Text style={styles.availabilityText}>
                        {visualStatus === property.availabilityStatus
                          ? getAvailabilityText(property)
                          : availabilityActions.find((item) => item.status === visualStatus)
                              ?.label}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.availabilityActions}>
                  {availabilityActions.map((action) => (
                    <Pressable
                      key={`${property.id}-${action.status}`}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setAvailabilityById((current) => ({
                          ...current,
                          [property.id]: action.status,
                        }));
                      }}
                      style={({ pressed }) => [
                        styles.availabilityAction,
                        visualStatus === action.status && styles.availabilityActionActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.availabilityActionText,
                          visualStatus === action.status && styles.availabilityActionTextActive,
                        ]}
                      >
                        {action.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </GlassPanel>
            </Animated.View>
          );
        })}
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
  pushCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  pushIcon: {
    alignItems: "center",
    backgroundColor: "#11A665",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  pushCopy: {
    flex: 1,
    gap: 4,
  },
  pushTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pushText: {
    color: "rgba(255,247,235,0.66)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  summaryLabel: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 3,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionMeta: {
    color: "rgba(255,247,235,0.52)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
  },
  requestCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  requestImage: {
    width: 90,
    height: 118,
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
  requestMessage: {
    color: "rgba(255,247,235,0.68)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 5,
  },
  requestPrice: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 8,
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
  propertyCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  propertyImage: {
    width: 86,
    height: 102,
    borderRadius: 23,
    backgroundColor: "#BFAF9A",
  },
  propertyCopy: {
    flex: 1,
  },
  propertyType: {
    color: "rgba(255,247,235,0.56)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  propertyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 5,
  },
  propertyAddress: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  availabilityBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
    minHeight: 30,
    paddingHorizontal: 10,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  availabilityActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    paddingTop: 0,
  },
  availabilityAction: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  availabilityActionActive: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "rgba(255,255,255,0.92)",
  },
  availabilityActionText: {
    color: "rgba(255,247,235,0.78)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  availabilityActionTextActive: {
    color: "#171512",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
