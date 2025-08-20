import React from "react";
import { Bitcoin, Coins } from "lucide-react";

export const CryptoIcon = ({ name, color, size = 20 }) => {
  // In a real app, you would use actual crypto icons
  // This is a simplified version using Lucide icons
  switch (name) {
    case "bitcoin":
      return <Bitcoin size={size} color={color} />;
    case "ethereum":
      return <Coins size={size} color={color} />; // Using Coins as a placeholder
    case "usdt":
      return <Coins size={size} color={color} />; // Using Coins as a placeholder for USDT
    case "solana":
      return <Coins size={size} color={color} />; // Placeholder
    case "cardano":
      return <Coins size={size} color={color} />; // Placeholder
    case "dogecoin":
      return <Coins size={size} color={color} />; // Placeholder
    case "shiba-inu":
      return <Coins size={size} color={color} />; // Placeholder
    default:
      return <Coins size={size} color={color} />;
  }
};