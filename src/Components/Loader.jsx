"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      className="flex flex-col justify-center items-center h-[80vh] space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="relative flex flex-col gap-2">
        {/* Spinner overlay */}
        <div className="flex justify-center items-center">
          <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Text */}
      <motion.p
        className="text-gray-600 text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Loading your workspace...
      </motion.p>
    </motion.div>
  );
}
