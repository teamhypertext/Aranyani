import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface BatteryWarningBannerProps {
  onOpenSettings: () => void;
}

export function BatteryWarningBanner({ onOpenSettings }: BatteryWarningBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚡ Battery Saver Off</Text>
        <Text style={styles.subtitle}>Enable for better 24/7 operation</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onOpenSettings}>
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(234,179,8,0.2)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eab308",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: "500",
    color: "#a16207",
  },
  subtitle: {
    fontSize: 14,
    color: "#ca8a04",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#eab308",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
  },
});
