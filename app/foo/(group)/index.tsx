import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

export default function FooIndex() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return (
    <Pressable onPress={() => router.setParams({ q: "2" })}>
      <Text>foo index, q={q ?? "none"} (press to set q=2)</Text>
    </Pressable>
  );
}
