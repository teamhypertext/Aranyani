import api from "./axios";
import { getDeviceId } from "@/utils/deviceInfo";

export const getNearbyAnimals = async (lat: number, lng: number) => {
  const deviceId = await getDeviceId();
  const response = await api.get("/animal-records/nearby", {
    params: { lat, lng },
    headers: {
      "device-id": deviceId,
    },
  });
  return response.data;
};
