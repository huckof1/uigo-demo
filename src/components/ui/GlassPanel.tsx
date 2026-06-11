import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import type { ViewStyle } from "react-native";

type GlassPanelVariant = "light" | "strong" | "floating";

type GlassPanelProps = {
  children: ReactNode;
  glow?: boolean;
  style?: ViewStyle;
  variant?: GlassPanelVariant;
};

const variantStyles: Record<
  GlassPanelVariant,
  {
    blur: number;
    overlay: string;
    border: string;
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  }
> = {
  light: {
    blur: 72,
    overlay: "rgba(255,255,255,0.24)",
    border: "rgba(255,255,255,0.58)",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  strong: {
    blur: 82,
    overlay: "rgba(255,255,255,0.3)",
    border: "rgba(255,255,255,0.64)",
    shadowOpacity: 0.16,
    shadowRadius: 34,
    elevation: 11,
  },
  floating: {
    blur: 90,
    overlay: "rgba(255,255,255,0.28)",
    border: "rgba(255,255,255,0.68)",
    shadowOpacity: 0.19,
    shadowRadius: 44,
    elevation: 16,
  },
};

export function GlassPanel({
  children,
  glow = false,
  style,
  variant = "light",
}: GlassPanelProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.shadow,
        {
          elevation: variantStyle.elevation,
          shadowOpacity: variantStyle.shadowOpacity,
          shadowRadius: variantStyle.shadowRadius,
        },
        style,
      ]}
    >
      {glow ? <View pointerEvents="none" style={styles.glow} /> : null}
      <BlurView
        intensity={variantStyle.blur}
        tint="light"
        style={[styles.blur, { borderColor: variantStyle.border }]}
      >
        <View
          pointerEvents="none"
          style={[styles.overlay, { backgroundColor: variantStyle.overlay }]}
        />
        <View pointerEvents="none" style={styles.innerGlow} />
        <View pointerEvents="none" style={styles.diagonalSheen} />
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 32,
    shadowColor: "#241B12",
    shadowOffset: {
      width: 0,
      height: 22,
    },
  },
  glow: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 16,
    bottom: -20,
    borderRadius: 36,
    backgroundColor: "rgba(229, 176, 93, 0.18)",
  },
  blur: {
    borderRadius: 32,
    borderWidth: 1.2,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  innerGlow: {
    position: "absolute",
    top: -60,
    left: -30,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  diagonalSheen: {
    position: "absolute",
    top: -80,
    right: 18,
    width: 86,
    height: 320,
    borderRadius: 43,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "24deg" }],
  },
  content: {
    overflow: "hidden",
  },
});
