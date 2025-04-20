import { PinataSDK } from "pinata";

// Make sure the JWT is properly configured
export const pinata = new PinataSDK({
  pinataJwt: `${import.meta.env.VITE_PINATA_JWT}`,
  pinataGateway: `${import.meta.env.VITE_GATEWAY_URL}`
});

// Optionally add console log to confirm it's loaded correctly
console.log("Pinata SDK initialized with gateway:", import.meta.env.VITE_GATEWAY_URL);