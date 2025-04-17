
import React from "react";
import { motion } from "framer-motion";
import { 
  BadgeCheck, 
  Globe, 
  ShieldCheck, 
  Key, 
  Zap,
  Share2
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    icon: <BadgeCheck className="h-6 w-6" />,
    title: "Verified Identity",
    description: "Prove your identity across web3 applications without revealing personal data"
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Universal Login",
    description: "Use your .crefy.eth domain as a universal login across compatible platforms"
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Privacy Protection",
    description: "Share only the data you want with selective disclosure capabilities"
  },
  {
    icon: <Key className="h-6 w-6" />,
    title: "Credential Storage",
    description: "Securely store and manage all of your digital credentials in one place"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Verification",
    description: "Get verified quickly without repeating KYC processes across different services"
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Cross-Platform Compatibility",
    description: "Works seamlessly across any platform that supports Ethereum Name Service"
  }
];

const FeaturesList = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-12 px-4">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-passport-blue text-center mb-8"
      >
        What You Can Do With Crefy Passports
      </motion.h2>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={item}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-passport-lightBlue rounded-lg text-passport-blue">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeaturesList;
