import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";

interface BatteryWarningModalProps {
  visible: boolean;
  onOpenSettings: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

/**
 * Modal that warns users about battery saver mode before starting monitoring
 */
export function BatteryWarningModal({
  visible,
  onOpenSettings,
  onContinue,
  onCancel,
}: BatteryWarningModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.icon}>⚡</Text>
          <Text style={styles.title}>Battery Saver Recommended</Text>
          <Text style={styles.text}>
            For optimal 24/7 operation and battery life, we recommend enabling
            Battery Saver mode on your device.
            {"\n\n"}
            Without Battery Saver, the app may consume more battery and could be
            stopped by the system.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onOpenSettings}>
            <Text style={styles.primaryButtonText}>⚙️ Open Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onContinue}>
            <Text style={styles.secondaryButtonText}>Continue Anyway</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8e4",
  },
  icon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e2b20",
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    color: "#6c8574",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#4a7c59",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#e6efe8",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8e4",
    marginBottom: 12,
    width: "100%",
  },
  secondaryButtonText: {
    color: "#1e2b20",
    fontWeight: "600",
    textAlign: "center",
  },
  cancelText: {
    color: "#6c8574",
    textAlign: "center",
    paddingVertical: 12,
  },
});
