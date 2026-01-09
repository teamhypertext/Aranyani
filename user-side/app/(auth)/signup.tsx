import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { createUser } from "@/api/user.service";
import { Toast } from "toastify-react-native";

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim()) {
      Toast.error("Please enter your name");
      return;
    }

    if (!mobileNumber.trim()) {
      Toast.error("Please enter your mobile number");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      Toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await createUser(username.trim(), mobileNumber.trim());
      Toast.success("Account created successfully!");
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      console.error("Signup error:", error);
      Toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-12">
          <Text className="text-4xl font-bold text-foreground mb-2">
            Welcome to Aranyani
          </Text>
          <Text className="text-base text-muted-foreground">
            Get started by creating your account
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">
              Your Name
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your name"
              placeholderTextColor="#6c8574"
              className="bg-card border border-border rounded-2xl px-4 py-4 text-foreground text-base"
              editable={!loading}
            />
          </View>

          <View className="mt-5">
            <Text className="text-sm font-medium text-foreground mb-2">
              Mobile Number (India)
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl overflow-hidden">
              <View className="bg-muted px-4 py-4 border-r border-border">
                <Text className="text-foreground font-semibold text-base">+91</Text>
              </View>
              <TextInput
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter 10-digit number"
                placeholderTextColor="#6c8574"
                className="flex-1 px-4 py-4 text-foreground text-base"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-primary rounded-2xl py-4 mt-6"
            style={{
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-primary-foreground text-center font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
