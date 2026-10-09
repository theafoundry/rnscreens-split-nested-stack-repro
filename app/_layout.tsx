import { SplitView } from "expo-router/unstable-split-view";
import { Text } from "react-native";

export default function Root() {
  return (
    <SplitView topColumnForCollapsing="secondary">
      <SplitView.Column>
        <Text style={{ padding: 40 }}>Sidebar</Text>
      </SplitView.Column>
    </SplitView>
  );
}
