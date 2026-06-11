import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassPanel } from "@/components/ui/GlassPanel";

type AppHeaderProps = {
  canGoBack?: boolean;
  title: string;
};

export function AppHeader({ canGoBack = true, title }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12) }]}>
      <GlassPanel variant="strong">
        <View style={styles.inner}>
          {canGoBack ? (
            <Pressable
              accessibilityLabel="Назад"
              hitSlop={10}
              onPress={() => {
                void Haptics.selectionAsync();

                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Feather color="#171512" name="chevron-left" size={26} />
            </Pressable>
          ) : (
            <View style={styles.backSpace} />
          )}

          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <View style={styles.backSpace} />
        </View>
      </GlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 8,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 4,
    height: 44,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#241B12",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    width: 44,
  },
  pressed: {
    opacity: 0.64,
    transform: [{ scale: 0.96 }],
  },
  title: {
    color: "#171512",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  backSpace: {
    height: 44,
    width: 44,
  },
});
