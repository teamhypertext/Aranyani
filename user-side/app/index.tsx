import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { View, ActivityIndicator } from "react-native";
import { checkUserExists } from "@/api/user.service";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function initialize() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== "granted") {
          alert("Location permission is required to use this app");
          return;
        }

        const userExists = await checkUserExists();

        if (userExists) {
          router.replace("/(tabs)" as any);
        } else {
          router.replace("/(auth)/signup" as any);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        router.replace("/(auth)/signup" as any);
      }
    }

    initialize();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#4a7c59" />
    </View>
  );
}
