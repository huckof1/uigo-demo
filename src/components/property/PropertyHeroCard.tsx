import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  availabilityColors,
  formatTenge,
  getAvailabilityText,
  propertyTypeLabels,
} from "@/lib/mock/properties";
import type { MockProperty } from "@/lib/types/property";

type PropertyHeroCardProps = {
  bottomOffset?: number;
  imageSource: ImageSourcePropType;
  isActive?: boolean;
  onPress: () => void;
  property: MockProperty;
  showInfoPanel?: boolean;
};

export function PropertyHeroCard({
  bottomOffset = 0,
  imageSource,
  isActive = false,
  onPress,
  property,
  showInfoPanel = true,
}: PropertyHeroCardProps) {
  const colors = availabilityColors[property.availabilityStatus];
  const reveal = useSharedValue(isActive ? 1 : 0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    reveal.value = withTiming(isActive ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isActive, reveal]);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration:
          property.availabilityStatus === "available_now"
            ? 900
            : property.availabilityStatus === "available_soon"
              ? 1250
              : 1900,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [property.availabilityStatus, pulse]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.value, [0, 1], [0.76, 0.96]),
    transform: [
      {
        translateY: interpolate(reveal.value, [0, 1], [18, 0]),
      },
      {
        scale: interpolate(reveal.value, [0, 1], [0.985, 1]),
      },
    ],
  }));

  const statusPulseStyle = useAnimatedStyle(() => ({
    opacity:
      property.availabilityStatus === "occupied" ||
      property.availabilityStatus === "unknown_time"
        ? 0
        : 0.28 + pulse.value * 0.42,
    transform: [{ scale: 0.86 + pulse.value * 0.26 }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View pointerEvents="none" style={styles.imageFallback} />
      <ImageBackground
        imageStyle={styles.image}
        resizeMode="cover"
        source={imageSource}
        style={styles.imageBackground}
      >
        {showInfoPanel ? (
          <Animated.View
            style={[
              styles.infoPanel,
              {
                paddingBottom: bottomOffset,
              },
              panelAnimatedStyle,
            ]}
          >
            <BlurView intensity={76} tint="dark" style={styles.glass}>
              <View pointerEvents="none" style={styles.cardTint} />
              <View pointerEvents="none" style={styles.cardGlow} />
              <View pointerEvents="none" style={styles.cardSheen} />
              <View style={styles.content}>
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
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.statusPulse,
                        { backgroundColor: colors.background },
                        statusPulseStyle,
                      ]}
                    />
                    <View style={[styles.statusDot, { backgroundColor: colors.text }]} />
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {getAvailabilityText(property)}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={2} style={styles.title}>
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
                    <Text style={styles.ownerRateText}>
                      {property.ownerResponseRate}%
                    </Text>
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

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Feather color="#F8F3EA" name="star" size={14} />
                    <Text style={styles.statText}>{property.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Feather color="#F8F3EA" name="eye" size={14} />
                    <Text style={styles.statText}>{property.viewsCount} просмотров</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        ) : null}
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#090806",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#090806",
  },
  image: {
    backgroundColor: "#090806",
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#090806",
  },
  infoPanel: {
    paddingHorizontal: 16,
  },
  glass: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: "rgba(255,255,255,0.38)",
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.28,
    shadowRadius: 34,
  },
  cardTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 10, 8, 0.46)",
  },
  cardGlow: {
    position: "absolute",
    right: -44,
    top: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(226,176,92,0.2)",
  },
  cardSheen: {
    position: "absolute",
    top: -70,
    right: 34,
    width: 54,
    height: 260,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ rotate: "23deg" }],
  },
  content: {
    gap: 9,
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
    overflow: "hidden",
  },
  statusPulse: {
    position: "absolute",
    left: -4,
    right: -4,
    top: -4,
    bottom: -4,
    borderRadius: 999,
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
  title: {
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
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
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
    backgroundColor: "rgba(17,166,101,0.18)",
    borderColor: "rgba(191,234,211,0.24)",
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
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.24)",
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
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 28,
    paddingHorizontal: 9,
  },
  statText: {
    color: "#F8F3EA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
