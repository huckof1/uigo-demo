import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type PremiumButtonVariant = "primary" | "glass" | "ghost";

type PremiumButtonProps = {
  disabled?: boolean;
  iconName?: ComponentProps<typeof Feather>["name"];
  label: string;
  loading?: boolean;
  onPress?: () => void;
  rightSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: PremiumButtonVariant;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PremiumButton({
  disabled = false,
  iconName,
  label,
  loading = false,
  onPress,
  rightSlot,
  style,
  variant = "primary",
}: PremiumButtonProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * 0.04,
    shadowOpacity: 0.16 + pressed.value * 0.1,
    shadowRadius: 24 - pressed.value * 8,
    transform: [{ scale: scale.value }],
  }));

  const pressedOverlayStyle = useAnimatedStyle(() => ({
    opacity: pressed.value,
  }));

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPress={() => {
        onPress?.();
      }}
      onPressIn={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        pressed.value = withTiming(1, { duration: 90 });
        scale.value = withSpring(0.94, { damping: 12, stiffness: 320 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160 });
        scale.value = withSpring(1, { damping: 13, stiffness: 260 });
      }}
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pressedOverlay,
          {
            backgroundColor:
              variant === "primary"
                ? "rgba(255,255,255,0.16)"
                : "rgba(23, 18, 12, 0.09)",
          },
          pressedOverlayStyle,
        ]}
      />
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#171512"} />
      ) : iconName ? (
        <Feather
          color={variant === "primary" ? "#FFFFFF" : "#171512"}
          name={iconName}
          size={18}
        />
      ) : null}
      <Text style={[styles.label, variant === "primary" && styles.primaryLabel]}>
        {label}
      </Text>
      {rightSlot}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#241B12",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    backgroundColor: "#15120F",
    borderColor: "rgba(255,255,255,0.34)",
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.52)",
    borderColor: "rgba(255,255,255,0.78)",
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderColor: "rgba(255,255,255,0.58)",
    shadowOpacity: 0.08,
  },
  disabled: {
    opacity: 0.45,
  },
  pressedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    color: "#171512",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
});
