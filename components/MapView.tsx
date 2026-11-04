import { StyleSheet, Text, View } from 'react-native';

// This fallback helps TypeScript resolve the platform-specific MapView files.
// Android/iOS use MapView.native.tsx, and web uses MapView.web.tsx at runtime.
export default function MapView() {
  return (
    <View style={styles.container}>
      <Text>Map preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
