import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PassportCard from "@/components/PassportCard";
import FeaturesList from "@/components/FeaturesList";
import DirectPinataUpload from "@/components/DirectPinataUpload"; // Make sure to put the component in this path

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-passport-lightBlue to-white">
      <Navbar />
      
      {/* Main content */}
      <div className="container mx-auto pt-24 pb-12">
        <div className="pt-12 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-passport-blue mb-4">
              Your Digital Identity Passport
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              KYC once. Authenticate everywhere.
            </p>
            
            {/* Now properly using the component */}
           
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <PassportCard />
          </div>
          <FeaturesList />
          
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Crefy Passports. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;