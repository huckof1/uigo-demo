import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassPanel } from "@/components/ui/GlassPanel";

type EmptyStateProps = {
  description: string;
  iconName?: ComponentProps<typeof Feather>["name"];
  title: string;
};

export function EmptyState({
  description,
  iconName = "circle",
  title,
}: EmptyStateProps) {
  return (
    <Animated.View entering={FadeInDown.duration(520).springify()}>
      <GlassPanel glow variant="strong">
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Feather color="#171512" name={iconName} size={24} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </GlassPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 22,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)",
  },
  title: {
    color: "#171512",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
  },
  description: {
    color: "#5F5A52",
    fontSize: 15,
    lineHeight: 22,
  },
});
