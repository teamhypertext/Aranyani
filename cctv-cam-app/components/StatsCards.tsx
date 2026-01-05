import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface LiveStatsCardProps {
  framesProcessed: number;
  detectionsToday: number;
  processingRate?: string;
}

/**
 * Card showing live monitoring statistics
 */
export function LiveStatsCard({
  framesProcessed,
  detectionsToday,
  processingRate = "1 FPS",
}: LiveStatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Live Stats</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Frames Processed</Text>
        <Text style={styles.value}>{framesProcessed}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Detections</Text>
        <Text style={styles.value}>{detectionsToday}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Processing Rate</Text>
        <Text style={styles.value}>{processingRate}</Text>
      </View>
    </View>
  );
}

interface LastDetectionCardProps {
  imageUri: string;
  detectionTime: string;
}

/**
 * Card showing the last detected motion with thumbnail
 */
export function LastDetectionCard({ imageUri, detectionTime }: LastDetectionCardProps) {
  return (
    <View style={styles.detectionContainer}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View>
        <Text style={styles.detectionTitle}>Last Detection</Text>
        <Text style={styles.detectionTime}>{detectionTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontWeight: "500",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
  },
  value: {
    color: "#fff",
    fontWeight: "500",
  },
  detectionContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  detectionTitle: {
    color: "#fff",
    fontWeight: "500",
  },
  detectionTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
});
