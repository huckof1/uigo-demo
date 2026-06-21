import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";
import {
  availabilityColors,
  formatTenge,
  getAvailabilityText,
  getPropertyById,
  propertyTypeLabels,
} from "@/lib/mock/properties";
import type { MockProperty, PropertyPhoto } from "@/lib/types/property";

type FullscreenPhotoViewerProps = {
  initialIndex: number;
  onClose: () => void;
  photos: PropertyPhoto[];
  property: MockProperty;
  visible: boolean;
};

function FullscreenPhotoViewer({
  initialIndex,
  onClose,
  photos,
  property,
  visible,
}: FullscreenPhotoViewerProps) {
  const { height, width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const reveal = useRef(new Animated.Value(0)).current;
  const startProgressRef = useRef(0);
  const openProgressRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    openProgressRef.current = 0;
    reveal.setValue(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ animated: false, x: initialIndex * width });
    });
  }, [initialIndex, reveal, visible, width]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dy) > 2 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 0.8,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 2 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 0.8,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startProgressRef.current = openProgressRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const nextProgress = Math.max(
          0,
          Math.min(1, startProgressRef.current - gesture.dy / 190),
        );
        reveal.setValue(nextProgress);
      },
      onPanResponderRelease: (_, gesture) => {
        const nextProgress = Math.max(
          0,
          Math.min(1, startProgressRef.current - gesture.dy / 190),
        );
        const velocityAdjustedProgress = Math.max(
          0,
          Math.min(1, nextProgress - gesture.vy * 0.08),
        );
        const settledProgress =
          velocityAdjustedProgress < 0.04 ? 0 : velocityAdjustedProgress;

        openProgressRef.current = settledProgress;
        Animated.spring(reveal, {
          damping: 24,
          mass: 0.8,
          stiffness: 180,
          toValue: settledProgress,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const sheetStyle = {
    opacity: reveal.interpolate({
      inputRange: [0, 0.35, 1],
      outputRange: [0, 0.72, 1],
    }),
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [230, 0],
        }),
      },
    ],
  };

  const pullHintStyle = {
    opacity: reveal.interpolate({
      inputRange: [0, 0.35],
      outputRange: [1, 0],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 32],
        }),
      },
    ],
  };

  const imageStageStyle = {
    transform: [
      {
        scale: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.94],
        }),
      },
      {
        translateY: reveal.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -26],
        }),
      },
    ],
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent={false}
      visible={visible}
    >
      <View style={styles.viewer}>
        <Animated.View style={[styles.viewerPhotoStage, imageStageStyle]}>
          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
          >
            {photos.map((photo) => (
              <Image
                key={photo.id}
                resizeMode="cover"
                source={{ uri: photo.url }}
                style={[styles.viewerImage, { height, width }]}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <View style={styles.dragCaptureZone} {...panResponder.panHandlers} />

        <Animated.View style={styles.pullHintButton} {...panResponder.panHandlers}>
          <Animated.View pointerEvents="none" style={[styles.pullHint, pullHintStyle]}>
            <View style={styles.arrowStack}>
              <Feather color="rgba(255,255,255,0.76)" name="chevron-up" size={18} />
              <Feather
                color="rgba(255,255,255,0.92)"
                name="chevron-up"
                size={18}
                style={styles.secondArrow}
              />
            </View>
            <View style={styles.pullHintHandle} />
            <Text style={styles.pullHintText}>Потяните вверх</Text>
          </Animated.View>
        </Animated.View>

        <Pressable accessibilityLabel="Закрыть" onPress={onClose} style={styles.closeButton}>
          <Feather color="#FFFFFF" name="x" size={24} />
        </Pressable>

        <Animated.View
          style={[styles.viewerSheet, { maxHeight: height * 0.56 }, sheetStyle]}
          {...panResponder.panHandlers}
        >
          <View style={styles.viewerHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.viewerType}>{propertyTypeLabels[property.type]}</Text>
            <Text style={styles.viewerTitle}>{property.title}</Text>
            <Text style={styles.viewerLocation}>
              {property.city}, {property.district} · {property.address}
            </Text>
            <Text style={styles.viewerDescription}>{property.description}</Text>
            <View style={styles.viewerPriceRow}>
              <Text style={styles.viewerPrice}>
                {formatTenge(property.hourlyPrice)} ₸ / час
              </Text>
              <Text style={styles.viewerPriceMuted}>
                {formatTenge(property.dailyPrice)} ₸ / сутки
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    addBookingRequest,
    isAuthenticated,
    startAuthIntent,
    tenantProfileComplete,
  } = useDemoSession();
  const { width } = useWindowDimensions();
  const property = getPropertyById(id);
  const colors = availabilityColors[property.availabilityStatus];
  const photos = [...property.photos].sort(
    (left, right) => left.priority - right.priority,
  );
  const coverWidth = width - 32;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  function openViewer(index: number) {
    setPhotoIndex(index);
    setViewerOpen(true);
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.goldBlob} />
        <View style={styles.greenBlob} />
      </View>

      <AppHeader title="Детали" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          <ScrollView
            horizontal
            onMomentumScrollEnd={(event) => {
              setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / coverWidth));
            }}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {photos.map((photo, index) => (
              <Pressable
                key={photo.id}
                onPress={() => {
                  openViewer(index);
                }}
                style={{ width: coverWidth }}
              >
                <Image
                  resizeMode="cover"
                  source={{ uri: photo.url }}
                  style={[styles.coverImage, { width: coverWidth }]}
                />
              </Pressable>
            ))}
          </ScrollView>
          <View pointerEvents="none" style={styles.coverShade} />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.text }]}>
              {getAvailabilityText(property)}
            </Text>
          </View>
          <View pointerEvents="none" style={styles.coverDots}>
            {photos.map((photo, index) => (
              <View
                key={photo.id}
                style={[styles.coverDot, index === photoIndex && styles.coverDotActive]}
              />
            ))}
          </View>
        </View>

        <GlassPanel glow variant="floating">
          <View style={styles.card}>
            <Text style={styles.type}>{propertyTypeLabels[property.type]}</Text>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.location}>
              {property.city}, {property.district} · {property.address}
            </Text>
            <Text style={styles.description}>{property.description}</Text>

            <View style={styles.priceGrid}>
              <View style={styles.priceBox}>
                <Text style={styles.price}>{formatTenge(property.hourlyPrice)} ₸</Text>
                <Text style={styles.priceLabel}>/ час</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.price}>{formatTenge(property.dailyPrice)} ₸</Text>
                <Text style={styles.priceLabel}>/ сутки</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Feather color="#675F55" name="star" size={15} />
                <Text style={styles.statText}>{property.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.stat}>
                <Feather color="#675F55" name="eye" size={15} />
                <Text style={styles.statText}>{property.viewsCount} просмотров</Text>
              </View>
            </View>

            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                {property.ownerAvatarUrl ? (
                  <Image
                    resizeMode="cover"
                    source={{ uri: property.ownerAvatarUrl }}
                    style={styles.ownerAvatarImage}
                  />
                ) : (
                  <Text style={styles.ownerAvatarText}>{property.ownerAvatarInitials}</Text>
                )}
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>Владелец</Text>
                <Text style={styles.ownerName}>{property.ownerName}</Text>
                <View style={styles.ownerBadges}>
                  <View style={styles.ownerBadge}>
                    <Feather color="#4F7867" name="clock" size={13} />
                    <Text style={styles.ownerBadgeText}>
                      Отвечает ~{property.ownerResponseTimeMinutes} мин
                    </Text>
                  </View>
                  <View style={styles.ownerBadge}>
                    <Feather color="#4F7867" name="check-circle" size={13} />
                    <Text style={styles.ownerBadgeText}>
                      {property.ownerResponseRate}% ответов
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.galleryHeader}>
              <Text style={styles.sectionTitle}>Фото</Text>
              <Text style={styles.galleryCount}>{photos.length} фото</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
            >
              {photos.map((photo, index) => (
                <Pressable
                  key={photo.id}
                  onPress={() => {
                    openViewer(index);
                  }}
                >
                  <Image
                    resizeMode="cover"
                    source={{ uri: photo.url }}
                    style={styles.galleryImage}
                  />
                </Pressable>
              ))}
            </ScrollView>

            <PremiumButton
              iconName="calendar"
              label="Бронь"
              onPress={() => {
                if (!isAuthenticated) {
                  startAuthIntent({
                    intent: "booking",
                    propertyId: property.id,
                  });
                  router.push({
                    pathname: "/auth",
                    params: {
                      intent: "booking",
                      propertyId: property.id,
                    },
                  } as never);
                  return;
                }

                if (!tenantProfileComplete) {
                  startAuthIntent({
                    intent: "booking",
                    propertyId: property.id,
                  });
                  router.push("/profile/setup" as never);
                  return;
                }

                addBookingRequest(property.id);
                router.push({
                  pathname: "/requests",
                  params: {
                    created: "1",
                    propertyId: property.id,
                  },
                } as never);
              }}
            />
            <PremiumButton
              iconName="radio"
              label="Радар"
              onPress={() => {
                router.push({
                  pathname: "/map",
                  params: {
                    propertyId: property.id,
                  },
                } as never);
              }}
              variant="glass"
            />
          </View>
        </GlassPanel>
      </ScrollView>

      <FullscreenPhotoViewer
        initialIndex={photoIndex}
        onClose={() => {
          setViewerOpen(false);
        }}
        photos={photos}
        property={property}
        visible={viewerOpen}
      />
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
    top: 110,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(226, 176, 92, 0.28)",
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
  cover: {
    height: 330,
    overflow: "hidden",
    borderRadius: 34,
  },
  coverImage: {
    height: 330,
    backgroundColor: "#D2C4AE",
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 9, 8, 0.22)",
  },
  statusBadge: {
    position: "absolute",
    left: 16,
    bottom: 16,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  card: {
    gap: 14,
    padding: 18,
  },
  type: {
    color: "#806F5A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#171512",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 32,
  },
  location: {
    color: "#625A50",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
  },
  description: {
    color: "#514A42",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  priceGrid: {
    flexDirection: "row",
    gap: 10,
  },
  priceBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.34)",
    borderColor: "rgba(255,255,255,0.54)",
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  price: {
    color: "#171512",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  priceLabel: {
    color: "#625A50",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.34)",
    borderColor: "rgba(255,255,255,0.48)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 11,
  },
  statText: {
    color: "#5F574F",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  ownerCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.34)",
    borderColor: "rgba(255,255,255,0.52)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 12,
  },
  ownerAvatar: {
    alignItems: "center",
    backgroundColor: "#171512",
    borderColor: "rgba(255,255,255,0.38)",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  ownerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  ownerInfo: {
    flex: 1,
    gap: 5,
  },
  ownerLabel: {
    color: "#806F5A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  ownerName: {
    color: "#171512",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  ownerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  ownerBadge: {
    alignItems: "center",
    backgroundColor: "rgba(79, 120, 103, 0.12)",
    borderColor: "rgba(79, 120, 103, 0.18)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    minHeight: 28,
    paddingHorizontal: 9,
  },
  ownerBadgeText: {
    color: "#4F7867",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  galleryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#171512",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  galleryCount: {
    color: "#675F55",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  gallery: {
    marginHorizontal: -4,
  },
  galleryImage: {
    width: 152,
    height: 116,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#D2C4AE",
  },
  coverDots: {
    position: "absolute",
    right: 18,
    bottom: 22,
    flexDirection: "row",
    gap: 6,
  },
  coverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.46)",
  },
  coverDotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
  viewer: {
    flex: 1,
    backgroundColor: "#050505",
  },
  viewerPhotoStage: {
    flex: 1,
  },
  viewerImage: {
    backgroundColor: "#11100E",
  },
  pullHint: {
    alignItems: "center",
    gap: 7,
  },
  pullHintButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: 0,
    zIndex: 15,
    elevation: 15,
    minWidth: 190,
    minHeight: 156,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 28,
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  dragCaptureZone: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 142,
    zIndex: 10,
    elevation: 10,
    backgroundColor: "rgba(0,0,0,0.01)",
  },
  arrowStack: {
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  secondArrow: {
    marginTop: -13,
  },
  pullHintHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  pullHintText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
  },
  closeButton: {
    position: "absolute",
    top: 54,
    right: 18,
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.34)",
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
  },
  viewerSheet: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 18,
    zIndex: 20,
    elevation: 20,
    borderRadius: 30,
    backgroundColor: "rgba(16, 15, 13, 0.82)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
  },
  viewerHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.36)",
    marginBottom: 14,
  },
  viewerType: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  viewerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 29,
    marginTop: 5,
  },
  viewerLocation: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: 7,
  },
  viewerDescription: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 12,
  },
  viewerPriceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  viewerPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  viewerPriceMuted: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
