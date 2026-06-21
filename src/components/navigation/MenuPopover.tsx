import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDemoSession } from "@/features/auth/DemoSessionProvider";

type MenuRoute = "/" | "/map" | "/profile" | "/requests" | "/owner";

type MenuItem = {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  route: MenuRoute;
};

const PANEL_WIDTH = 252;
const PANEL_HEIGHT = 386;
const MENU_BUTTON_SIZE = 62;
const CLOSED_SCALE_X = MENU_BUTTON_SIZE / PANEL_WIDTH;
const CLOSED_SCALE_Y = MENU_BUTTON_SIZE / PANEL_HEIGHT;

const menuItems: MenuItem[] = [
  { icon: "radio", label: "Радар", route: "/map" },
  { icon: "user", label: "Кабинет", route: "/profile" },
  { icon: "inbox", label: "Мои заявки", route: "/requests" },
  { icon: "home", label: "Для владельца", route: "/owner" },
  { icon: "compass", label: "Витрина", route: "/" },
];

export function MenuPopover() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { closeMenu, email, isMenuOpen, logout, menuProgress, setMenuProgress } =
    useDemoSession();

  const panelStyle = useAnimatedStyle(() => {
    const progress = menuProgress.value;
    const scaleX = CLOSED_SCALE_X + (1 - CLOSED_SCALE_X) * progress;
    const scaleY = CLOSED_SCALE_Y + (1 - CLOSED_SCALE_Y) * progress;

    return {
      borderRadius: interpolate(progress, [0, 1], [31, 34]),
      opacity: interpolate(progress, [0, 0.14, 1], [0, 1, 1]),
      transform: [
        {
          translateY: ((PANEL_HEIGHT - MENU_BUTTON_SIZE) / 2) * (1 - progress),
        },
        { scaleX },
        { scaleY },
      ],
    };
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 0.75,
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 0.75,
    onPanResponderMove: (_, gesture) => {
      const nextProgress = Math.max(0, Math.min(1, 1 - Math.max(gesture.dy, 0) / 150));
      setMenuProgress(nextProgress);
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 48 || gesture.vy > 0.45) {
        void Haptics.selectionAsync();
        closeMenu();
        return;
      }

      menuProgress.value = withSpring(1, { damping: 22, stiffness: 210 });
    },
    onPanResponderTerminate: () => {
      menuProgress.value = withSpring(1, { damping: 22, stiffness: 210 });
    },
  });

  const goTo = (route: MenuRoute) => {
    void Haptics.selectionAsync();
    closeMenu();
    router.push(route as never);
  };

  return (
    <Animated.View
      pointerEvents={isMenuOpen ? "auto" : "none"}
      style={[
        styles.panel,
        {
          bottom: Math.max(insets.bottom, 10) + 12,
          left: Math.max(12, (width - PANEL_WIDTH) / 2),
        },
        panelStyle,
      ]}
      {...panResponder.panHandlers}
    >
      <BlurView intensity={86} tint="dark" style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={styles.innerGlow} />

      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>UiGo меню</Text>
          <Text numberOfLines={1} style={styles.email}>
            {email ?? "demo активен"}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Закрыть меню"
          hitSlop={8}
          onPress={closeMenu}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        >
          <Feather color="#FFFFFF" name="x" size={17} />
        </Pressable>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => goTo(item.route)}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
          >
            <View style={styles.menuIcon}>
              <Feather color="#FFFFFF" name={item.icon} size={16} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          logout();
          router.replace("/");
        }}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
      >
        <Feather color="rgba(255,255,255,0.72)" name="log-out" size={15} />
        <Text style={styles.logoutText}>Выйти</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: PANEL_HEIGHT,
    overflow: "hidden",
    padding: 14,
    position: "absolute",
    width: PANEL_WIDTH,
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.36,
    shadowRadius: 36,
    zIndex: 120,
    elevation: 120,
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.32)",
    borderRadius: 2,
    height: 4,
    marginBottom: 12,
    width: 42,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    color: "#171512",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  email: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 45,
    paddingHorizontal: 10,
  },
  menuItemPressed: {
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ scale: 0.985 }],
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 13,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  menuLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  logoutButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 36,
    marginTop: 10,
  },
  logoutText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
