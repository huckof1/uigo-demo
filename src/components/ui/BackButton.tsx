import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export function BackButton() {
  return (
    <Pressable
      accessibilityLabel="Назад"
      hitSlop={12}
      onPress={() => {
        void Haptics.selectionAsync();

        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/");
        }
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Feather color="#171512" name="chevron-left" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginLeft: 4,
    width: 44,
  },
  pressed: {
    opacity: 0.55,
  },
});
