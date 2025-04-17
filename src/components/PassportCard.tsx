import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, BadgeCheck, Shield, Globe, ExternalLink, Copy, Loader } from "lucide-react";
import ConnectButton from "./connectButton";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from 'wagmi/chains';
import subdomain from "../abi/subdomain.json";
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

const PassportCard = () => {
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const { toast } = useToast();
  
  // Get the connected wallet address
  const { address: userAddress, isConnected } = useAccount();

  // Set up the contract write
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

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
      writeContract({
        address: address as `0x${string}`,
        abi,
        functionName: 'registerSubname',
        args: [name],
        chain: sepolia,
        account: userAddress,
      });
    } catch (error) {
      console.error("Transaction setup error:", error);
      setIsSubmitting(false);
      toast({
        title: "Transaction Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
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
      <div className="perspective-1000">
        <motion.div 
          className="transform-style-3d"
          animate={{ rotateY: isSubmitted ? [0, 15, 0] : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          whileHover={{ rotateY: 5 }}
        >
          {!isSubmitted ? (
            <Card className="relative overflow-hidden passport-pattern border-2 border-passport-blue/30">
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-500/10 z-10 mix-blend-overlay pointer-events-none holographic-animation"></div>
              
              <CardHeader className="border-b border-passport-blue/20 bg-gradient-to-r from-passport-blue to-passport-darkBlue text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl tracking-wider">PASSPORT</CardTitle>
                    <CardDescription className="text-white/80">CREFY DIGITAL IDENTITY</CardDescription>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-full bg-white/10 p-2"
                  >
                    <BadgeCheck className="h-10 w-10 text-white" />
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
            <Card className="relative overflow-hidden passport-pattern border-2 border-passport-blue/30">
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-500/10 z-10 mix-blend-overlay pointer-events-none holographic-animation"></div>
              
              <CardHeader className="border-b border-passport-blue/20 bg-gradient-to-r from-passport-blue to-passport-darkBlue text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl tracking-wider">PASSPORT</CardTitle>
                    <CardDescription className="text-white/80">CREFY DIGITAL IDENTITY</CardDescription>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-full bg-white/10 p-2"
                  >
                    <BadgeCheck className="h-10 w-10 text-white" />
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
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="border-passport-blue text-passport-blue hover:bg-passport-lightBlue"
                >
                  Home 
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PassportCard;