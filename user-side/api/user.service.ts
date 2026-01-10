import api from "./axios";
import { getDeviceId } from "@/utils/deviceInfo";

export const createUser = async (username: string, mobileNumber: string) => {
  const deviceId = await getDeviceId();
  const response = await api.post("/users/create", {
    deviceId,
    username,
    mobileNumber,
  });
  return response.data;
};

export const updateUserLocation = async (lat: number, lng: number) => {
  const deviceId = await getDeviceId();
  const response = await api.patch(
    "/users/location",
    {
      lat,
      lng,
    },
    {
      headers: {
        "device-id": deviceId,
      },
    }
  );
  return response.data;
};

export const checkUserExists = async (): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();
    const response = await api.get("/animal-records/nearby", {
      params: { lat: 0, lng: 0 },
      headers: {
        "device-id": deviceId,
      },
    });
    return response.data.success;
  } catch (error: any) {
    if (error.response?.status === 403) {
      return false;
    }
    throw error;
  }
};
