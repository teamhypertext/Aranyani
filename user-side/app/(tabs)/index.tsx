import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { getNearbyAnimals } from "@/api/animal.service";
import { updateUserLocation } from "@/api/user.service";
import { Toast } from "toastify-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AnimalRecord {
  _id: string;
  animalType: string;
  nodeId: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  detectedAt: string;
  img_url?: string;
}

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
  const slideAnim = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      StatusBar.setHidden(true, 'slide');
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      StatusBar.setHidden(false, 'slide');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const initializeLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);

      const lat = currentLocation.coords.latitude;
      const lng = currentLocation.coords.longitude;

      await updateUserLocation(lat, lng);

      const response = await getNearbyAnimals(lat, lng);
      
      setAnimals(response.data || []);
    } catch (error: any) {
      console.error("Location error:", error);
      Toast.error("Failed to fetch location");
    } finally {
      setLoading(false);
    }
  };

  const getDaysSinceDetection = (detectedAt: string): number => {
    const now = new Date();
    const detected = new Date(detectedAt);
    const diffTime = Math.abs(now.getTime() - detected.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeBasedColor = (detectedAt: string): string => {
    const days = getDaysSinceDetection(detectedAt);
    if (days < 1) {
      return "rgba(244, 67, 54, 0.7)";
    } else if (days < 2) {
      return "rgba(255, 87, 34, 0.65)";
    } else if (days < 4) {
      return "rgba(255, 152, 0, 0.6)";
    } else if (days < 5) {
      return "rgba(255, 193, 7, 0.55)";
    } else {
      return "rgba(255, 235, 59, 0.5)";
    }
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (result && result.length > 0) {
        const place = result[0];
        const locationDetails = [];
        
        if (place.street) locationDetails.push(place.street);
        if (place.district || place.subregion) locationDetails.push(place.district || place.subregion);
        if (place.city) locationDetails.push(place.city);
        
        if (locationDetails.length === 0) {
          locationDetails.push(place.region || "nearby area");
        }
        
        return locationDetails.join(", ");
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleCirclePress = async (animal: AnimalRecord) => {
    setSelectedAnimal(animal);
    const name = await getLocationName(
      animal.location.coordinates[1],
      animal.location.coordinates[0]
    );
    setLocationName(name);
    setModalVisible(true);
  };

  const getTimeAgo = (detectedAt: string): string => {
    const days = getDaysSinceDetection(detectedAt);
    
    if (days === 0) {
      const hours = Math.floor((new Date().getTime() - new Date(detectedAt).getTime()) / (1000 * 60 * 60));
      if (hours < 1) {
        const minutes = Math.floor((new Date().getTime() - new Date(detectedAt).getTime()) / (1000 * 60));
        return minutes < 1 ? 'Just now' : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return `${days} days ago`;
    }
  };

  if (loading || !location) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4a7c59" />
        <Text className="mt-4 text-muted-foreground">
          Loading nearby wildlife...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoorLevelPicker={false}
        toolbarEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {animals.map((animal) => {
          const lat = animal.location.coordinates[1];
          const lng = animal.location.coordinates[0];

          return (
            <View key={animal._id}>
              <Circle
                center={{ latitude: lat, longitude: lng }}
                radius={1000} 
                fillColor={getTimeBasedColor(animal.detectedAt)}
                strokeColor="transparent"
                strokeWidth={0}
              />
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => handleCirclePress(animal)}
                opacity={0}
                tracksViewChanges={false}
              />
            </View>
          );
        })}
      </MapView>

      <View className="absolute top-12 left-6 right-6 rounded-2xl bg-card p-4 shadow-lg">
        <Text className="text-lg font-bold text-foreground">
          Wildlife Near You
        </Text>
        <Text className="text-sm text-muted-foreground mt-1">
          {animals.length} {animals.length === 1 ? "sighting" : "sightings"}{" "}
          (Last 7 days)
        </Text>
      </View>

      {/* Legend */}
      <View className="absolute bottom-3 right-3 rounded-xl bg-card p-3 shadow-md">
        <Text className="text-[11px] font-semibold mb-2 text-foreground">Time Since Sighting</Text>
        <View className="flex-col gap-1">
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(244, 67, 54, 0.7)' }} />
            <Text className="text-[11px] text-muted-foreground">{"< 1 day"}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 87, 34, 0.65)' }} />
            <Text className="text-[11px] text-muted-foreground">1-2 days</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 152, 0, 0.6)' }} />
            <Text className="text-[11px] text-muted-foreground">2-4 days</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 193, 7, 0.55)' }} />
            <Text className="text-[11px] text-muted-foreground">4-5 days</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 235, 59, 0.5)' }} />
            <Text className="text-[11px] text-muted-foreground">5-7 days</Text>
          </View>
        </View>
      </View>

      {/* Dark overlay when modal is open */}
      {modalVisible && (
        <View style={StyleSheet.absoluteFillObject} className="bg-black/50" pointerEvents="none" />
      )}

      {/* Animal Detail Bottom Drawer */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={{ flex: 1, justifyContent: 'flex-end' }}
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            className="bg-card rounded-t-3xl max-h-[80%] shadow-2xl"
            style={{
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                }),
              }],
              paddingBottom: insets.bottom,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <ScrollView className="p-0" showsVerticalScrollIndicator={false}>
                <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-3 mb-2" />

                <Pressable
                  className="absolute top-4 right-4 z-10 bg-card rounded-full p-1"
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close-circle" size={32} color="#4a7c59" />
                </Pressable>

                {selectedAnimal?.img_url && (
                  <Image
                    source={{ uri: selectedAnimal.img_url }}
                    className="w-full h-[300px] mt-5"
                    resizeMode="cover"
                  />
                )}

                {/* Animal Details */}
                <View className="p-6 bg-card">
                  <View className="flex-row items-center gap-3 mb-5">
                    <Ionicons name="paw" size={24} color="#4a7c59" />
                    <Text className="text-3xl font-bold text-foreground">
                      {selectedAnimal?.animalType 
                        ? selectedAnimal.animalType.charAt(0).toUpperCase() + selectedAnimal.animalType.slice(1)
                        : 'Unknown'}
                    </Text>
                  </View>

                  <View className="flex-row items-start gap-3 mb-4">
                    <Ionicons name="time-outline" size={20} color="#6c8574" />
                    <Text className="text-base text-muted-foreground flex-1 leading-6">
                      {selectedAnimal && getTimeAgo(selectedAnimal.detectedAt)}
                    </Text>
                  </View>

                  <View className="flex-row items-start gap-3 mb-4">
                    <Ionicons name="location-outline" size={20} color="#6c8574" />
                    <Text className="text-base text-muted-foreground flex-1 leading-6">{locationName}</Text>
                  </View>

                  <View className="flex-row items-start gap-3 mb-4">
                    <Ionicons name="calendar-outline" size={20} color="#6c8574" />
                    <Text className="text-base text-muted-foreground flex-1 leading-6">
                      {selectedAnimal && 
                       new Date(selectedAnimal.detectedAt).toLocaleDateString('en-US', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit',
                       })}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
