import "react-native-gesture-handler";

import { Stack } from "expo-router";
import { AppShell } from "@/components/AppShell";

export default function RootLayout() {
  return (
    <AppShell>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "#F7F6F2",
          },
          headerShown: false,
        }}
      />
    </AppShell>
  );
}
