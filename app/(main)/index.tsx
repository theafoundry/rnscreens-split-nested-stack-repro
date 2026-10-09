import { Link } from "expo-router";
import { View } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 40 }}>
      <Link href="/detail">Open detail</Link>
    </View>
  );
}
