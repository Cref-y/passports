import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Shield, Globe, ExternalLink, Copy, Loader, Download, Camera, ImagePlus, Upload } from "lucide-react";
import ConnectButton from "./connectButton";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from 'wagmi/chains';
import subdomain from "../abi/subdomain.json";
import html2canvas from 'html2canvas';
import { uploadFileDirectlyToIPFS } from "@/utils/directPinataUpload";
import { toast as sonnerToast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const { abi, address } = subdomain

const CONTRACT_ADDRESS = "0xb96aEA9db1ca0a03e4bb2F22b1E74EE65A6D851d";

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "safeMint",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const PassportCard = () => {
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isNftSubmitting, setIsNftSubmitting] = useState(false);
  const [isSubdomainSubmitting, setIsSubdomainSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [nftMinted, setNftMinted] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const cardRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get the connected wallet address
  const { address: userAddress, isConnected } = useAccount();

  // Set up the contract write for subdomain
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

  // Set up contract write for NFT mint
  const { 
    writeContract: writeNFTContract, 
    data: nftHash, 
    isPending: isNftPending 
  } = useWriteContract();

  // Set up transaction monitoring
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Set up NFT transaction monitoring
  const { isLoading: isNftConfirming, isSuccess: isNftConfirmed } = useWaitForTransactionReceipt({
    hash: nftHash,
  });

  // Watch for NFT transaction success
  React.useEffect(() => {
    if (isNftConfirmed && nftHash) {
      setIsNftSubmitting(false);
      setNftMinted(true);
      setTxHash(nftHash);
      
      toast({
        title: "NFT Minted!",
        description: "Your passport NFT has been minted successfully! You can now register your subdomain.",
      });
    }
  }, [isNftConfirmed, nftHash, toast]);

  // Watch for subdomain registration success
  React.useEffect(() => {
    if (isConfirmed && hash) {
      setWalletAddress(userAddress || "");
      setIsSubdomainSubmitting(false);
      setIsSubmitted(true);
      setTxHash(hash);
      
      toast({
        title: "Success!",
        description: `Your ${name}.crefy.eth passport subdomain is registered!`,
      });
    }
  }, [isConfirmed, hash, name, toast, userAddress]);

  // Watch for transaction errors
  React.useEffect(() => {
    if (isError && error) {
      console.error("Transaction error:", error);
      setIsSubdomainSubmitting(false);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const mintNFTPassport = async () => {
    if (!uploadedUrl || !userAddress) {
      toast({
        title: "Error",
        description: "Missing IPFS URL or wallet connection",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsNftSubmitting(true);
      console.log("Minting NFT with address:", userAddress);
      console.log("Minting with URI:", uploadedUrl);
      
      // Use writeContract for NFT minting
      writeNFTContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "safeMint",
        args: [userAddress, uploadedUrl],
        chain: sepolia,
        account: userAddress as `0x${string}`
      });
    } catch (error) {
      console.error("NFT Mint failed:", error);
      setIsNftSubmitting(false);
      toast({
        title: "NFT Minting Failed",
        description: "There was an error minting your passport NFT.",
        variant: "destructive",
      });
    }
  };

  const registerSubdomain = async () => {
    if (!name || !userAddress) {
      toast({
        title: "Error",
        description: "Missing name or wallet connection",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubdomainSubmitting(true);
      
      // Execute the contract write for subdomain
      writeContract({
        address: address as `0x${string}`,
        abi,
        functionName: 'registerSubname',
        args: [name],
        chain: sepolia,
        account: userAddress as `0x${string}`,
      });
    } catch (error) {
      console.error("Subdomain registration failed:", error);
      setIsSubdomainSubmitting(false);
      toast({
        title: "Subdomain Registration Failed",
        description: "There was an error registering your subdomain.",
        variant: "destructive",
      });
    }
  };

  const handleUploadToIPFS = async () => {
    if (!cardRef.current) {
      toast({
        title: "Error",
        description: "Unable to capture passport card",
        variant: "destructive",
      });
      return;
    }

    if (!profilePicture) {
      toast({
        title: "Missing Profile Photo",
        description: "Please add a profile photo before uploading",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      toast({
        title: "Capturing passport",
        description: "Please wait while we prepare your passport image...",
      });

      // Capture the card as an image
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
      });
      
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png', 0.95);
      });
      
      // Create a File object from the Blob
      const file = new File([blob], `${name || "crefy"}-passport.png`, { type: 'image/png' });
      
      // Upload the file to IPFS
      const url = await uploadFileDirectlyToIPFS(file);
      setUploadedUrl(url);
      sonnerToast.success("Passport card uploaded to IPFS!");
    } catch (error) {
      console.error("Error uploading passport card:", error);
      sonnerToast.error("Failed to upload passport card");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  // Function to handle profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2 MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Function to download card as image
  const downloadCardAsImage = async () => {
    if (cardRef.current) {
      try {
        toast({
          title: "Creating image",
          description: "Please wait while we prepare your passport image...",
        });
        
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2, // Higher scale for better quality
          logging: false,
          useCORS: true,
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `${name || "crefy"}-passport.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success!",
          description: "Passport image downloaded successfully",
        });
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Download Failed",
          description: "There was an error creating your passport image.",
          variant: "destructive",
        });
      }
    }
  };

  // Determine if buttons should be disabled
  const isUploadDisabled = isUploading || !name || !profilePicture;
  const isNftButtonDisabled = isNftSubmitting || isNftPending || isNftConfirming || !uploadedUrl;
  const isSubdomainButtonDisabled = isSubdomainSubmitting || isPending || isConfirming || !nftMinted;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Hidden file input for profile picture */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleProfilePictureChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="perspective-1000">
        <motion.div 
          className="transform-style-3d"
          animate={{ rotateY: isSubmitted ? [0, 15, 0] : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          whileHover={{ rotateY: 5 }}
        >
          {!isSubmitted ? (
            <Card ref={cardRef} className="relative overflow-hidden passport-pattern border-2 border-passport-blue/30">
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-500/10 z-10 mix-blend-overlay pointer-events-none holographic-animation"></div>
              
              <CardHeader className="border-b border-passport-blue/20 bg-gradient-to-r from-passport-blue to-passport-darkBlue text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl tracking-wider">PASS.ID</CardTitle>
                    <CardDescription className="text-white/80">24599BB7CAD5C1C5</CardDescription>
                  </div>
                  
                  {/* Profile Picture Upload UI */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={triggerFileInput}
                    className="relative rounded-full w-16 h-16 overflow-hidden cursor-pointer bg-white/10 flex items-center justify-center group border-2 border-white/30"
                  >
                    {profilePicture ? (
                      <>
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <ImagePlus className="h-6 w-6 mb-1" />
                        <span className="text-xs text-center">Add Photo</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="text-center mb-6 space-y-2">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-passport-blue">Congratulations!</h3>
                  <p className="text-gray-600">Your KYC has been approved</p>
                </div>
                
                <form className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name" className="text-passport-blue">
                      Choose your Crefy passport name
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="yourname"
                        className="flex-1"
                        disabled={nftMinted || isSubdomainSubmitting}
                      />
                      <span className="flex items-center text-gray-500 text-sm">.crefy.eth</span>
                    </div>
                    
                    {/* Live preview */}
                    {name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-2 bg-passport-lightBlue/50 rounded-md border border-passport-blue/20"
                      >
                        <p className="text-xs text-gray-500">Preview:</p>
                        <p className="font-mono text-passport-blue font-semibold">{name}.crefy.eth</p>
                      </motion.div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      No more KYC's on randomn services
                    </p>
                  </div>
                  
                  {/* Upload to IPFS section */}
                  <div className="flex flex-col space-y-2">
                    <div className="p-2 bg-passport-lightBlue/30 rounded-md mb-1">
                      <p className="text-xs text-passport-blue text-center">
                        1️⃣ Enter your details to get your passport
                        <br />
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={uploadedUrl ? 
                        () => window.open(uploadedUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'), '_blank') : 
                        handleUploadToIPFS
                      }
                      disabled={(isUploadDisabled || isUploading) && !uploadedUrl}
                      className={`w-full ${uploadedUrl ? 'bg-green-600 hover:bg-green-700' : '#4D3674hover:bg-passport-darkBlue'} text-white`}
                    >
                      {isUploading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Uploading to IPFS...
                        </>
                      ) : uploadedUrl ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View on IPFS Gateway <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Passport to IPFS
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* NFT Minting button */}
                  <Button
                    type="button"
                    onClick={nftMinted ? 
                      () => window.open(`https://sepolia.etherscan.io/tx/${nftHash}`, '_blank') : 
                      mintNFTPassport
                    }
                    disabled={isNftButtonDisabled && !nftMinted}
                    className={`w-full ${nftMinted ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                  >
                    {isNftSubmitting || isNftConfirming ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Minting NFT...
                      </>
                    ) : nftMinted ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Passport Minted: Click to check the tx <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </>
                    ) : (
                      "Mint NFT Passport"
                    )}
                  </Button>
                  
                  {/* Subdomain registration button */}
                  <Button
                    type="button"
                    onClick={registerSubdomain}
                    disabled={isSubdomainButtonDisabled}
                    className="w-full #4D3674text-white hover:bg-passport-darkBlue"
                  >
                    {isSubdomainSubmitting || isConfirming ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Registering Subdomain...
                      </>
                    ) : (
                      "Register Subdomain"
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-passport-blue/20 bg-passport-lightBlue/30">
                <div className="h-8 w-12 bg-gradient-to-r from-passport-darkBlue/50 to-passport-blue/50 rounded-md border border-white/30"></div>
                {!isConnected ? (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-passport-blue">Connect wallet first:</p>
                    <ConnectButton />
                  </div>
                ) : (
                  <p className="text-sm text-passport-blue">Follow the steps above to complete your passport</p>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card ref={cardRef} className="relative overflow-hidden passport-pattern border-2 border-passport-blue/30">
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-500/10 z-10 mix-blend-overlay pointer-events-none holographic-animation"></div>
              
              <CardHeader className="border-b border-passport-blue/20 bg-gradient-to-r from-passport-blue to-passport-darkBlue text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl tracking-wider">PASSPORT</CardTitle>
                    <CardDescription className="text-white/80">CREFY DIGITAL IDENTITY</CardDescription>
                  </div>
                  
                  {/* Display profile picture or allow changing */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={triggerFileInput}
                    className="relative rounded-full w-16 h-16 overflow-hidden cursor-pointer bg-white/10 flex items-center justify-center group border-2 border-white/30"
                  >
                    {profilePicture ? (
                      <>
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <ImagePlus className="h-6 w-6 mb-1" />
                        <span className="text-xs text-center">Add Photo</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <div className="stamp animate-stamp-appear">Verified</div>
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-passport-blue">
                    Welcome, {name}!
                  </h3>
                  <p className="text-gray-600">
                    Your digital passport is now active
                  </p>
                  
                  {/* Passport ID Section */}
                  <div className="bg-passport-lightBlue rounded-md p-3 font-mono text-center mt-4 border border-passport-blue/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-passport-blue/70">Passport ID:</span>
                      <button 
                        onClick={() => copyToClipboard(`${name}.crefy.eth`)}
                        className="text-passport-blue hover:text-passport-darkBlue"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-passport-blue font-bold">{name}.crefy.eth</p>
                  </div>
                  
                  {/* Wallet Address Section */}
                  <div className="bg-passport-lightBlue rounded-md p-3 font-mono text-center mt-2 border border-passport-blue/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-passport-blue/70">Mapped Address:</span>
                      <button 
                        onClick={() => copyToClipboard(walletAddress)}
                        className="text-passport-blue hover:text-passport-darkBlue"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-passport-blue text-sm truncate">{walletAddress}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 flex items-center gap-2 justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    NFT Passport received
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Globe className="h-4 w-4 text-passport-blue" />
                    <span className="text-sm text-passport-blue">{name}.crefy.eth registered</span>
                  </div>
                </div>
                
                {/* Transaction details section */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-passport-blue mb-2">Transaction Details</h4>
                  <div className="bg-white p-3 rounded-md border border-gray-200 flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Transaction Hash:</span>
                      <button 
                        onClick={() => copyToClipboard(txHash)}
                        className="text-gray-500 hover:text-passport-blue transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-700 truncate">
                      {txHash}
                    </p>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm font-medium text-passport-blue hover:underline"
                    >
                      View on Etherscan <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-passport-blue/20 bg-passport-lightBlue/30">
                <div className="h-8 w-12 bg-gradient-to-r from-passport-darkBlue/50 to-passport-blue/50 rounded-md border border-white/30"></div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="border-passport-blue text-passport-blue hover:bg-passport-lightBlue"
                  >
                    Home 
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={downloadCardAsImage}
                    className="#4D3674text-white hover:bg-passport-darkBlue"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </div>
      
      {/* Add a download button outside the card as well */}
      {(isSubmitted || name) && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={downloadCardAsImage}
            className="border-passport-blue text-passport-blue hover:bg-passport-lightBlue"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Passport as Image
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PassportCard;