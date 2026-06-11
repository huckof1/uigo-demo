import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";

type PlaceholderScreenProps = {
  description: string;
  headerTitle?: string;
  title: string;
};

export function PlaceholderScreen({
  description,
  headerTitle,
  title,
}: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={styles.warmGlow} />
        <View style={styles.coolGlow} />
        <View style={styles.roseGlow} />
        <View style={styles.surfaceWash} />
        <View style={styles.floatingMilk} />
      </View>

      {headerTitle ? <AppHeader title={headerTitle} /> : null}

      <View
        style={[
          styles.panel,
          {
            paddingBottom: Math.max(insets.bottom, 22),
            paddingTop: headerTitle ? 24 : Math.max(insets.top, 26),
          },
        ]}
      >
        <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.copy}>
          <Text style={styles.eyebrow}>UiGo Demo</Text>
          <Text style={styles.title}>{title}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(560).springify()}>
          <EmptyState description={description} iconName="inbox" title="Пока пусто" />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F6F2",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  warmGlow: {
    position: "absolute",
    top: 66,
    left: -94,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(236, 191, 120, 0.31)",
  },
  coolGlow: {
    position: "absolute",
    right: -104,
    bottom: 76,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "rgba(123, 178, 170, 0.25)",
  },
  roseGlow: {
    position: "absolute",
    top: 288,
    left: 40,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(226, 160, 145, 0.18)",
  },
  surfaceWash: {
    position: "absolute",
    top: 160,
    right: 10,
    width: 190,
    height: 430,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.42)",
    transform: [{ rotate: "18deg" }],
  },
  floatingMilk: {
    position: "absolute",
    bottom: 72,
    left: 28,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  panel: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 22,
  },
  copy: {
    gap: 8,
  },
  eyebrow: {
    color: "#747069",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#171512",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
