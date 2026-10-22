import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

export default function BarIndex() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return (
    <Pressable onPress={() => router.setParams({ q: "2" })}>
      <Text>bar index, q={q ?? "none"} (press to set q=2)</Text>
    </Pressable>
  );
}
