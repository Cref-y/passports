import React, { useState, useRef, useEffect } from "react";
import { uploadFileDirectlyToIPFS } from "@/utils/directPinataUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAccount, useConfig, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ADDRESS = "0x16f72991C9fd594f7Fe99aEC95a3684B94B598dd";

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "safeMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];


export const DirectPinataUpload: React.FC<{
  onSuccess?: (txHash: string) => void;
}> = ({ onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected } = useAccount();

  // Use Wagmi hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for transaction hash and success
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
      toast.info(`Transaction submitted with hash: ${hash}`);
    }

    if (isConfirmed && hash) {
      toast.success("NFT minted successfully!");
      setIsMinting(false);
      if (onSuccess) onSuccess(hash);
    }
  }, [hash, isConfirmed, onSuccess]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadFileDirectlyToIPFS(file);
      setUploadedUrl(url);
      toast.success("File uploaded successfully to IPFS!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload Passport");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const copyUrlToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl).then(
        () => toast.success("IPFS URL copied to clipboard!"),
        () => toast.error("Failed to copy URL")
      );
    }
  };

  const handleMintNFT = async () => {
    if (!uploadedUrl ) return;

    try {
      setIsMinting(true);
      toast.info("Submitting transaction...");

      console.log("Minting with URI:", uploadedUrl);

      // Use writeContract without awaiting
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "safeMint",
        args: [uploadedUrl]
      });

      // Transaction handling now happens in the useEffect
    } catch (error: any) {
      console.error("Mint failed:", error);
      toast.error(`Mint failed: ${error.message}`);
      setIsMinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="bg-passport-blue hover:bg-blue-700 text-white"
      >
        {isUploading ? "Uploading..." : "Upload Passport"}
      </Button>

      {uploadedUrl && (
        <div className="flex flex-col items-center mt-4 w-full max-w-md">
          <p className="text-sm text-gray-700 mb-2">File uploaded to IPFS:</p>
          <div className="flex w-full">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm truncate"
            />
            <Button
              onClick={copyUrlToClipboard}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-l-none"
            >
              Copy
            </Button>
          </div>

          <Button
            onClick={handleMintNFT}
            disabled={isPending || isConfirming || !uploadedUrl || !isConnected}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full"
          >
            {isPending || isConfirming ? "Minting..." : "Mint Passport"}
          </Button>

          {txHash && (
            <div className="mt-4 p-3 border rounded bg-gray-50 w-full relative">
              <p className="text-sm font-medium">Transaction Hash:</p>
              <div className="text-xs text-gray-600 break-all hover:underline">
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <span className="font-mono font-semibold">
                    {`${txHash.slice(0, 8)}...${txHash.slice(-6)}`}
                  </span>
                  <div className="relative group">
                    <span className="text-gray-400 cursor-pointer">ℹ️</span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:flex bg-white border text-xs text-gray-800 rounded shadow p-2 z-10 whitespace-nowrap font-mono">
                      {txHash}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          )}


        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-red-500 mt-2">
          Please connect your wallet to mint NFTs
        </p>
      )}
    </div>
  );
};

export default DirectPinataUpload;