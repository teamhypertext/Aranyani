import twilio from "twilio";
import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

let twilioClient = null;
let initialized = false;

const initializeTwilio = () => {
  if (initialized) return;
  initialized = true;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhoneNumber) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (error) {
    }
  }
};

export const sendSMS = async (mobileNumber, message) => {
  initializeTwilio();

  if (!twilioClient) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const countryCode = process.env.COUNTRY_CODE || "+91";
    const formattedNumber = `${countryCode}${mobileNumber}`;

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber,
    });

    return { success: true, sid: messageResponse.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendBulkSMS = async (users, message) => {
  initializeTwilio();

  if (!twilioClient) {
    return { 
      success: false, 
      sent: 0, 
      failed: 0, 
      error: "Twilio not configured" 
    };
  }

  const results = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  const usersWithMobile = users.filter(user => user.mobileNumber);

  const promises = usersWithMobile.map(async (user) => {
    const result = await sendSMS(user.mobileNumber, message);
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({
        mobileNumber: user.mobileNumber,
        error: result.error,
      });
    }
  });

  await Promise.all(promises);

  return results;
};

export const sendAnimalAlert = async (nearbyUsers, animalData) => {
  const { animalType, lat, lng } = animalData;
  
  let locationDetails = [];
  try {
    const geoResult = await geocoder.reverse({ lat, lon: lng });
    if (geoResult && geoResult.length > 0) {
      const place = geoResult[0];
      
      if (place.streetName) locationDetails.push(place.streetName);
      if (place.neighbourhood || place.suburb) locationDetails.push(place.neighbourhood || place.suburb);
      if (place.city || place.village || place.town) locationDetails.push(place.city || place.village || place.town);
      
      if (locationDetails.length === 0) {
        locationDetails.push(place.county || place.state || "nearby area");
      }
    }
  } catch (error) {
  }

  const locationStr = locationDetails.length > 0 
    ? locationDetails.join(", ") 
    : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  const message = `Alert from Aranyani! ${animalType} detected at ${locationStr}. Stay safe.`;

  return await sendBulkSMS(nearbyUsers, message);
};

export default {
  sendSMS,
  sendBulkSMS,
  sendAnimalAlert,
};
