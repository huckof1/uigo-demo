import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";

export function MenuButton() {
  const { isAuthenticated, openMenu, startAuthIntent } = useDemoSession();

  return (
    <Pressable
      accessibilityLabel="Открыть меню"
      hitSlop={14}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!isAuthenticated) {
          startAuthIntent({ intent: "open_menu" });
          router.push({
            pathname: "/auth",
            params: {
              intent: "open_menu",
            },
          } as never);
          return;
        }

        openMenu();
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <BlurView intensity={78} tint="dark" style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.outerGlow} />
      <View pointerEvents="none" style={styles.innerRing}>
        <View style={styles.coreDot} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "rgba(12, 10, 8, 0.62)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.32,
    shadowRadius: 26,
    width: 62,
  },
  outerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 31,
    borderWidth: 1,
  },
  innerRing: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  coreDot: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 16,
    shadowColor: "#FFFFFF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.64,
    shadowRadius: 12,
    width: 16,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.92 }],
  },
});
