import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  formatTenge,
  getAvailabilityText,
  getPropertyById,
  propertyTypeLabels,
} from "@/lib/mock/properties";

export default function OwnerScreen() {
  const { propertyId, request } = useLocalSearchParams<{
    propertyId?: string;
    request?: string;
  }>();
  const property = getPropertyById(propertyId);
  const hasBookingRequest = request === "booking" && Boolean(propertyId);

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.goldBlob} />
        <View style={styles.greenBlob} />
      </View>

      <AppHeader title="Владелец" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Демо владельца</Text>
          <Text style={styles.title}>
            {hasBookingRequest ? "Новая бронь" : "Входящие заявки"}
          </Text>
          <Text style={styles.subtitle}>
            Это легкая панель владельца, не админка. Push-уведомления пока
            показаны как мок-состояние.
          </Text>
        </View>

        {hasBookingRequest ? (
          <GlassPanel glow variant="floating">
            <View style={styles.requestCard}>
              <View style={styles.pushRow}>
                <View style={styles.pushIcon}>
                  <Feather color="#FFFFFF" name="bell" size={18} />
                </View>
                <View style={styles.pushTextWrap}>
                  <Text style={styles.pushTitle}>Push-уведомление отправлено</Text>
                  <Text style={styles.pushSubtitle}>
                    В MVP это демо-состояние без production push.
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.requestHeader}>
                <View>
                  <Text style={styles.requestLabel}>Заявка от арендатора</Text>
                  <Text style={styles.tenantName}>Арендатор рядом</Text>
                </View>
                <View style={styles.urgentBadge}>
                  <Feather color="#4F7867" name="zap" size={13} />
                  <Text style={styles.urgentText}>Бронь</Text>
                </View>
              </View>

              <View style={styles.propertyBox}>
                <Text style={styles.propertyType}>{propertyTypeLabels[property.type]}</Text>
                <Text style={styles.propertyTitle}>{property.title}</Text>
                <Text style={styles.propertyMeta}>
                  {property.city}, {property.district} · {getAvailabilityText(property)}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    {formatTenge(property.hourlyPrice)} ₸ / час
                  </Text>
                  <Text style={styles.priceMuted}>
                    {formatTenge(property.dailyPrice)} ₸ / сутки
                  </Text>
                </View>
              </View>

              <View style={styles.ownerActions}>
                <PremiumButton iconName="check" label="Принять бронь" />
                <PremiumButton iconName="message-circle" label="Написать" variant="glass" />
              </View>
            </View>
          </GlassPanel>
        ) : (
          <GlassPanel glow variant="strong">
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Feather color="#FFFFFF" name="inbox" size={22} />
              </View>
              <Text style={styles.emptyTitle}>Пока нет новых броней</Text>
              <Text style={styles.emptyDescription}>
                Когда арендатор нажмет “Бронь”, здесь появится входящая заявка
                по выбранному объекту.
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
    backgroundColor: "#EAE4D9",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  goldBlob: {
    position: "absolute",
    top: 86,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(226, 176, 92, 0.3)",
  },
  greenBlob: {
    position: "absolute",
    left: -120,
    bottom: 80,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(83, 145, 130, 0.24)",
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  hero: {
    gap: 7,
  },
  kicker: {
    color: "#806F5A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#171512",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 38,
  },
  subtitle: {
    color: "#625A50",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  requestCard: {
    gap: 16,
    padding: 16,
  },
  pushRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  pushIcon: {
    alignItems: "center",
    backgroundColor: "#171512",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pushTextWrap: {
    flex: 1,
    gap: 3,
  },
  pushTitle: {
    color: "#171512",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pushSubtitle: {
    color: "#625A50",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  requestHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  requestLabel: {
    color: "#806F5A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  tenantName: {
    color: "#171512",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3,
  },
  urgentBadge: {
    alignItems: "center",
    backgroundColor: "rgba(79, 120, 103, 0.14)",
    borderColor: "rgba(79, 120, 103, 0.22)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  urgentText: {
    color: "#4F7867",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  propertyBox: {
    backgroundColor: "rgba(255,255,255,0.34)",
    borderColor: "rgba(255,255,255,0.52)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 7,
    padding: 14,
  },
  propertyType: {
    color: "#806F5A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  propertyTitle: {
    color: "#171512",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 25,
  },
  propertyMeta: {
    color: "#625A50",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 3,
  },
  priceText: {
    color: "#171512",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  priceMuted: {
    color: "#625A50",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
  ownerActions: {
    gap: 10,
  },
  emptyCard: {
    alignItems: "center",
    gap: 12,
    padding: 18,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#171512",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyTitle: {
    color: "#171512",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#625A50",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: "center",
  },
});
