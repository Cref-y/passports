import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    // Upload file to Pinata using the SDK authenticated with JWT
    const { cid } = await pinata.upload.public.file(file);
    
    // Convert CID to a gateway URL using your configured gateway
    const url = await pinata.gateways.public.convert(cid);
    
    // Return the URL directly
    return NextResponse.json(url, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}