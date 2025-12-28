import "./global.css";
import { Stack } from "expo-router";
import ToastManager from 'toastify-react-native';

export default function RootLayout() {
  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      />
      <ToastManager showCloseIcon={false} />
    </>
  );
}
