import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatusCardProps {
  label: string;
  value: string;
  isActive: boolean;
  isDark?: boolean;
}

export function StatusCard({ label, value, isActive, isDark = false }: StatusCardProps) {
  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.dot, isActive ? styles.dotGreen : styles.dotRed]} />
        <Text style={[styles.value, isDark && styles.valueDark]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8e4",
  },
  cardDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "transparent",
  },
  label: {
    fontSize: 14,
    color: "#6c8574",
  },
  labelDark: {
    color: "rgba(255,255,255,0.7)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: "#22c55e",
  },
  dotRed: {
    backgroundColor: "#ef4444",
  },
  value: {
    fontWeight: "500",
    color: "#1e2b20",
  },
  valueDark: {
    color: "#fff",
  },
});
