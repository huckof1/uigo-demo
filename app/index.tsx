import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { HeroPropertyCarousel } from "@/components/property/HeroPropertyCarousel";
import {
  availabilityColors,
  formatTenge,
  getAvailabilityText,
  mockProperties,
  propertyTypeLabels,
} from "@/lib/mock/properties";
import type { MockProperty } from "@/lib/types/property";

type PropertyDockProps = {
  bottomSafe: number;
  onOpen: () => void;
  property: MockProperty;
};

const MORPH_CARD_HEIGHT = 270;

function PropertyDock({ bottomSafe, onOpen, property }: PropertyDockProps) {
  const reveal = useSharedValue(1);
  const colors = availabilityColors[property.availabilityStatus];

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withTiming(1, {
      duration: 780,
      easing: Easing.out(Easing.quad),
    });
  }, [property.id, reveal]);

  const revealAreaStyle = useAnimatedStyle(() => ({
    height: interpolate(reveal.value, [0, 0.12, 0.72, 1], [0, 0, 238, MORPH_CARD_HEIGHT]),
    opacity: interpolate(reveal.value, [0, 0.2, 1], [0, 0.46, 1]),
  }));

  const contentRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 0.38, 1], [0, 0.38, 1]),
    transform: [
      {
        translateY: interpolate(reveal.value, [0, 1], [72, 0]),
      },
    ],
  }));

  const shellStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 1], [0.94, 0.98]),
    transform: [{ scale: interpolate(reveal.value, [0, 1], [0.985, 1]) }],
  }));

  return (
    <View
      style={[
        styles.dock,
        {
          paddingBottom: bottomSafe,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onOpen();
        }}
        style={({ pressed }) => [
          styles.morphPressable,
          pressed && styles.morphPressablePressed,
        ]}
      >
        <Animated.View style={[styles.morphShell, shellStyle]}>
          <BlurView intensity={78} tint="dark" style={styles.dockGlass}>
            <View pointerEvents="none" style={styles.dockTint} />
            <Animated.View style={[styles.revealArea, revealAreaStyle]}>
              <Animated.View style={[styles.dockContent, contentRevealStyle]}>
                <View style={styles.metaRow}>
                  <Text style={styles.type}>{propertyTypeLabels[property.type]}</Text>
                  <View
                    style={[
                      styles.status,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: colors.text }]} />
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {getAvailabilityText(property)}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={2} style={styles.propertyTitle}>
                  {property.title}
                </Text>
                <Text style={styles.location}>
                  {property.city}, {property.district}
                </Text>

                <View style={styles.ownerRow}>
                  <View style={styles.ownerAvatar}>
                    {property.ownerAvatarUrl ? (
                      <Image
                        resizeMode="cover"
                        source={{ uri: property.ownerAvatarUrl }}
                        style={styles.ownerAvatarImage}
                      />
                    ) : (
                      <Text style={styles.ownerAvatarText}>
                        {property.ownerAvatarInitials}
                      </Text>
                    )}
                  </View>
                  <View style={styles.ownerCopy}>
                    <Text style={styles.ownerName}>{property.ownerName}</Text>
                    <Text style={styles.ownerResponse}>
                      отвечает ~{property.ownerResponseTimeMinutes} мин
                    </Text>
                  </View>
                  <View style={styles.ownerRate}>
                    <Feather color="#BFEAD3" name="check-circle" size={13} />
                    <Text style={styles.ownerRateText}>{property.ownerResponseRate}%</Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <View style={styles.priceBox}>
                    <Text style={styles.price}>{formatTenge(property.hourlyPrice)} ₸</Text>
                    <Text style={styles.priceLabel}>/ час</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.price}>{formatTenge(property.dailyPrice)} ₸</Text>
                    <Text style={styles.priceLabel}>/ сутки</Text>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>

            <View style={styles.watchButton}>
              <Feather color="#FFFFFF" name="arrow-up-right" size={18} />
              <Text style={styles.watchButtonText}>Смотреть</Text>
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>

    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomSafe = Math.max(insets.bottom, 20);
  const featuredProperties = useMemo(
    () =>
      mockProperties.filter(
        (property) =>
          property.availabilityStatus === "available_now" ||
          property.availabilityStatus === "available_soon" ||
          property.availabilityStatus === "available_later",
      ),
    [],
  );
  const [selectedProperty, setSelectedProperty] = useState<MockProperty>(
    featuredProperties[0],
  );

  const openProperty = useCallback((property: MockProperty) => {
    router.push(`/property/${property.id}` as never);
  }, []);

  return (
    <View style={styles.screen}>
      <HeroPropertyCarousel
        onPressProperty={openProperty}
        onSelectedPropertyChange={setSelectedProperty}
        properties={featuredProperties}
      />

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View
          pointerEvents="box-none"
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 12),
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.logo}>UiGo</Text>
              <Text style={styles.slogan}>Свободные апартаменты рядом</Text>
            </View>

            <Pressable
              accessibilityLabel="Открыть радар"
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/map" as never);
              }}
              style={({ pressed }) => [
                styles.topRadarButton,
                pressed && styles.topRadarButtonPressed,
              ]}
            >
              <BlurView intensity={74} tint="dark" style={StyleSheet.absoluteFill} />
              <View pointerEvents="none" style={styles.topRadarTint} />
              <Feather color="#FFFFFF" name="radio" size={18} />
              <Text style={styles.topRadarText}>Радар</Text>
            </Pressable>
          </View>
        </View>

        <PropertyDock
          bottomSafe={bottomSafe}
          onOpen={() => {
            openProperty(selectedProperty);
          }}
          property={selectedProperty}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#11100E",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 20,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
  },
  slogan: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  topRadarButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 46,
    overflow: "hidden",
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.24,
    shadowRadius: 22,
  },
  topRadarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 10, 8, 0.56)",
  },
  topRadarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  topRadarButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  dock: {
    paddingHorizontal: 16,
  },
  morphShell: {
    zIndex: 2,
  },
  morphPressable: {
    borderRadius: 30,
  },
  morphPressablePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  dockGlass: {
    borderRadius: 30,
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.24,
    shadowRadius: 30,
  },
  dockTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 9, 8, 0.66)",
  },
  revealArea: {
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  dockContent: {
    gap: 9,
    minHeight: MORPH_CARD_HEIGHT,
    padding: 14,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  type: {
    color: "#F9F4EC",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  status: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 28,
    paddingHorizontal: 9,
  },
  statusDot: {
    borderRadius: 4,
    height: 7,
    opacity: 0.92,
    width: 7,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
  propertyTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 28,
  },
  location: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  ownerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    minHeight: 40,
  },
  ownerAvatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    overflow: "hidden",
  },
  ownerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  ownerAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  ownerCopy: {
    flex: 1,
  },
  ownerName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  ownerResponse: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  ownerRate: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "rgba(17,166,101,0.16)",
    borderColor: "rgba(191,234,211,0.22)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  ownerRateText: {
    color: "#BFEAD3",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  priceRow: {
    flexDirection: "row",
    gap: 10,
  },
  priceBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  price: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  priceLabel: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  watchButton: {
    alignItems: "center",
    backgroundColor: "rgba(13, 11, 9, 0.9)",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
  },
  watchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
