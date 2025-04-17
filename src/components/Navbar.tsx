import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Info, 
  BadgeCheck 
} from "lucide-react";
import ConnectButton from "./connectButton";

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-passport-blue text-white p-4 shadow-md fixed w-full top-0 z-50"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <BadgeCheck className="h-6 w-6" />
          <span className="text-xl font-bold">Crefy Passports</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="flex items-center gap-1 hover:text-white/80 transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Docs</span>
          </a>

          <a href="#" className="flex items-center gap-1 hover:text-white/80 transition-colors">
            <Info className="h-4 w-4" />
            <span>About</span>
          </a>

          <a href="#" className="flex items-center gap-1 hover:text-white/80 transition-colors">
            <BadgeCheck className="h-4 w-4" />
            <span>Passports</span>
          </a>

          

          <ConnectButton />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
