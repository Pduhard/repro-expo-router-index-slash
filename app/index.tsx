import { Link } from "expo-router";
import { View } from "react-native";

export default function Home() {
  return (
    <View>
      <Link href="/foo">open /foo</Link>
      <Link href="/foo?q=1">open /foo?q=1</Link>
      <Link href="/bar?q=1">open /bar?q=1</Link>
    </View>
  );
}
