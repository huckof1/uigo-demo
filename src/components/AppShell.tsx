import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { usePathname } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MenuButton } from "@/components/navigation/MenuButton";
import { MenuPopover } from "@/components/navigation/MenuPopover";
import {
  DemoSessionProvider,
  useDemoSession,
} from "@/features/auth/DemoSessionProvider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <DemoSessionProvider>
            <AppShellContent>{children}</AppShellContent>
          </DemoSessionProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { closeMenu, isMenuOpen } = useDemoSession();
  const showGlobalMenuButton = !isMenuOpen && !pathname.startsWith("/auth");

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.contentFrame}>
        <View style={styles.contentClip}>{children}</View>
        {isMenuOpen ? (
          <Pressable
            accessibilityLabel="Закрыть меню"
            onPress={closeMenu}
            style={styles.contentShield}
          />
        ) : null}
      </View>
      {showGlobalMenuButton ? (
        <View
          style={[
            styles.globalMenuButton,
            {
              bottom: Math.max(insets.bottom, 10) + 12,
            },
          ]}
        >
          <MenuButton />
        </View>
      ) : null}
      <MenuPopover />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0A09",
  },
  contentFrame: {
    flex: 1,
    overflow: "hidden",
  },
  contentClip: {
    flex: 1,
    overflow: "hidden",
  },
  contentShield: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
    zIndex: 100,
  },
  globalMenuButton: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 90,
    elevation: 90,
  },
});
