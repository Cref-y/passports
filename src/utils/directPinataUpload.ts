import { pinata } from "@/utils/config";

export const uploadFileDirectlyToIPFS = async (file: File): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }
    
    console.log("Uploading file directly to IPFS...");
    
    // Make sure file is a valid Blob before uploading
    // This helps prevent "parameter 2 is not of type 'Blob'" errors
    if (!(file instanceof Blob)) {
      throw new Error("Invalid file format: not a Blob");
    }
    
    // Upload file directly using pinata SDK
    const response = await pinata.upload.public.file(file);
    console.log("Pinata file upload response:", response);
    
    if (!response || !response.cid) {
      throw new Error("Failed to get CID from Pinata upload");
    }
    
    const cid = response.cid;
    
    // Convert CID to gateway URL
    const url = await pinata.gateways.public.convert(cid);
    console.log("Gateway URL:", url);
    
    return url;
  } catch (error) {
    console.error("Error uploading file directly:", error);
    throw error;
  }
};

export const uploadJSONDirectlyToIPFS = async (jsonData: any): Promise<string> => {
  try {
    console.log("Uploading JSON directly to IPFS...");
    
    // Upload JSON directly using pinata SDK
    const response = await pinata.upload.public.json(jsonData);
    console.log("Pinata JSON upload response:", response);
    
    if (!response || !response.cid) {
      throw new Error("Failed to get CID from Pinata JSON upload");
    }
    
    const cid = response.cid;
    
    // Convert CID to gateway URL
    const url = await pinata.gateways.public.convert(cid);
    console.log("Gateway URL for JSON:", url);
    
    return url;
  } catch (error) {
    console.error("Error uploading JSON directly:", error);
    throw error;
  }
};