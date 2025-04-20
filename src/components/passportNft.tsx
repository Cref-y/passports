import ConnectButton from "./connectButton";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from 'wagmi/chains';
import passport from "../abi/passport.json"

const PassportNFT = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();
  
  const { abi, address } = subdomain
  // Get the connected wallet address
  const { address: userAddress, isConnected } = useAccount();

  // Set up the contract write
  const { writePassport, data: hash, isPending, isError, error } = useWriteContract();

  // Set up transaction monitoring
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Watch for transaction success
  React.useEffect(() => {
    if (isConfirmed && hash) {
      setWalletAddress(userAddress || "");
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      toast({
        title: "Success!",
        description: `Your ${name}.crefy.eth passport is now ready!`,
      });
    }
  }, [isConfirmed, hash, name, toast, userAddress]);

  // Watch for transaction errors
  React.useEffect(() => {
    if (isError && error) {
      console.error("Transaction error:", error);
      setIsSubmitting(false);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Update txHash when hash changes
  React.useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a name for your passport",
        variant: "destructive",
      });
      return;
    }
  
    if (!isConnected || !userAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      // Execute the contract write
      writePassport({
        address: passportContractAddress as `0x${string}`,
        abi: abi,
        functionName: 'safeMint',
        args: [userAddress, tokenURI],
        chain: sepolia,
      });
      
      return passportHash;
    } catch (err) {
        console.error('Error minting NFT passport:', err);
        toast({
          title: "Minting Failed",
          description: "Failed to mint NFT passport. Trying to continue with domain registration.",
          variant: "destructive",
        });
        return null;
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

  // Determine if button should be disabled
  const isButtonDisabled = isSubmitting || isPending || isConfirming;

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
                    <CardTitle className="text-2xl tracking-wider">PASSPORT</CardTitle>
                    <CardDescription className="text-white/80">CREFY DIGITAL IDENTITY</CardDescription>
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
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        disabled={isButtonDisabled}
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
                  
                  <div className="px-4 py-3 bg-passport-lightBlue/70 rounded-lg border border-passport-blue/20">
                    <p className="text-sm text-passport-darkBlue flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>You will receive:</span>
                    </p>
                    <ul className="ml-6 mt-2 text-sm list-disc text-passport-blue space-y-1">
                      <li>NFT Passport (Verifiable Credential)</li>
                      <li>Personal {name || "yourname"}.crefy.eth subdomain</li>
                      <li>Access to Crefy verified services</li>
                      <li>Access to Crefy partner networks</li>
                    </ul>
                  </div>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t border-passport-blue/20 bg-passport-lightBlue/30">
                <div className="h-8 w-12 bg-gradient-to-r from-passport-darkBlue/50 to-passport-blue/50 rounded-md border border-white/30"></div>
                {isConnected ? (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                  >
                    {isButtonDisabled ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Get Your Passport"
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-passport-blue">Connect wallet first:</p>
                    <ConnectButton />
                  </div>
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
                    className="bg-passport-blue text-white hover:bg-passport-darkBlue"
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
    
  );
};

export default PassportNft;