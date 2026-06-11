import { useLocalSearchParams } from "expo-router";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      title="Chat"
      description={`Placeholder chat screen for booking or chat ${id ?? ""}.`}
    />
  );
}
