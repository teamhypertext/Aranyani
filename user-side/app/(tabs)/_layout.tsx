import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Animated, StyleSheet } from "react-native";
import React, { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps {
  focused: boolean;
  name: React.ComponentProps<typeof Ionicons>['name'];
  outlineName: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size: number;
  activeColor: string;
}

const TabIcon = ({ focused, name, outlineName, color, size, activeColor }: TabIconProps) => {
  const animatedValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 15,
    }).start();
  }, [focused]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const iconColor = focused ? "white" : color;

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.bgCircle,
          {
            backgroundColor: activeColor,
            transform: [{ scale }],
            opacity: animatedValue,
          },
        ]}
      />
      <Ionicons
        name={focused ? name : outlineName}
        size={size}
        color={iconColor}
        style={{ zIndex: 1 }}
      />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const cardColor = "#ffffff";
  const activeColor = "#4a7c59";
  const inactiveColor = "#6c8574";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: cardColor,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 5,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              name="map"
              outlineName="map-outline"
              color={color}
              size={24}
              activeColor={activeColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  bgCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },
});
