import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  formatTenge,
  getAvailabilityText,
  getPropertyById,
} from "@/lib/mock/properties";

export default function AuthScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const property = getPropertyById(propertyId);
  const cover = [...property.photos].sort(
    (left, right) => left.priority - right.priority,
  )[0];

  return (
    <View style={styles.screen}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
        source={{ uri: cover.url }}
        style={styles.background}
      >
        <View pointerEvents="none" style={styles.shade} />

        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>UiGo</Text>
            <Text style={styles.subtitle}>Быстрая регистрация</Text>
          </View>

          <GlassPanel glow variant="floating">
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Feather color="#FFFFFF" name="unlock" size={22} />
              </View>
              <Text style={styles.title}>Откройте объект</Text>
              <Text style={styles.description}>
                После короткой регистрации вернем вас на выбранный объект.
              </Text>

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

              <PremiumButton
                iconName="arrow-right"
                label="Продолжить"
                onPress={() => {
                  router.replace(`/property/${property.id}` as never);
                }}
              />
            </View>
          </GlassPanel>
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
    backgroundColor: "rgba(10, 9, 8, 0.46)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 10,
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
});
