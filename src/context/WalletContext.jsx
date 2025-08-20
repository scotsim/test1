import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const WalletContext = createContext();

// Initial crypto data
const initialCryptos = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.5,
    price: 65000,
    icon: "bitcoin",
    color: "#F7931A",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    balance: 5.2,
    price: 3500,
    icon: "ethereum",
    color: "#627EEA",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    balance: 25,
    price: 150,
    icon: "solana",
    color: "#14F195",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    balance: 1000,
    price: 0.5,
    icon: "cardano",
    color: "#0033AD",
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "Ripple",
    balance: 2500,
    price: 0.6,
    icon: "ripple",
    color: "#23292F",
  },
];

export const WalletProvider = ({ children }) => {
  const { toast } = useToast();
  const [cryptos, setCryptos] = useState(() => {
    const savedCryptos = localStorage.getItem("cryptoWallet");
    return savedCryptos ? JSON.parse(savedCryptos) : initialCryptos;
  });
  
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem("cryptoTransactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("cryptoWallet", JSON.stringify(cryptos));
  }, [cryptos]);

  useEffect(() => {
    localStorage.setItem("cryptoTransactions", JSON.stringify(transactions));
  }, [transactions]);

  // Get total portfolio value
  const getTotalBalance = () => {
    return cryptos.reduce((total, crypto) => {
      return total + crypto.balance * crypto.price;
    }, 0);
  };

  // Send crypto
  const sendCrypto = (cryptoId, amount, address) => {
    if (!address || address.length < 10) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const crypto = cryptos.find((c) => c.id === cryptoId);
    
    if (!crypto) {
      toast({
        title: "Crypto Not Found",
        description: "Selected cryptocurrency not found",
        variant: "destructive",
      });
      return false;
    }

    if (crypto.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${crypto.symbol}`,
        variant: "destructive",
      });
      return false;
    }

    // Update crypto balance
    setCryptos(
      cryptos.map((c) =>
        c.id === cryptoId ? { ...c, balance: c.balance - amount } : c
      )
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "send",
      cryptoId,
      symbol: crypto.symbol,
      amount,
      address,
      timestamp: new Date().toISOString(),
      value: amount * crypto.price,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Transaction Successful",
      description: `Sent ${amount} ${crypto.symbol} to ${address.substring(0, 8)}...`,
    });

    return true;
  };

  // Receive crypto (simulate)
  const receiveCrypto = (cryptoId, amount, fromAddress) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const crypto = cryptos.find((c) => c.id === cryptoId);
    
    if (!crypto) {
      toast({
        title: "Crypto Not Found",
        description: "Selected cryptocurrency not found",
        variant: "destructive",
      });
      return false;
    }

    // Update crypto balance
    setCryptos(
      cryptos.map((c) =>
        c.id === cryptoId ? { ...c, balance: c.balance + amount } : c
      )
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "receive",
      cryptoId,
      symbol: crypto.symbol,
      amount,
      address: fromAddress || "External Wallet",
      timestamp: new Date().toISOString(),
      value: amount * crypto.price,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Funds Received",
      description: `Received ${amount} ${crypto.symbol}`,
    });

    return true;
  };

  // Convert crypto
  const convertCrypto = (fromCryptoId, toCryptoId, amount) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const fromCrypto = cryptos.find((c) => c.id === fromCryptoId);
    const toCrypto = cryptos.find((c) => c.id === toCryptoId);
    
    if (!fromCrypto || !toCrypto) {
      toast({
        title: "Crypto Not Found",
        description: "One or both selected cryptocurrencies not found",
        variant: "destructive",
      });
      return false;
    }

    if (fromCrypto.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCrypto.symbol}`,
        variant: "destructive",
      });
      return false;
    }

    // Calculate conversion (with a small fee)
    const fee = 0.01; // 1% fee
    const fromValue = amount * fromCrypto.price;
    const feeAmount = fromValue * fee;
    const toValue = fromValue - feeAmount;
    const toAmount = toValue / toCrypto.price;

    // Update crypto balances
    setCryptos(
      cryptos.map((c) => {
        if (c.id === fromCryptoId) {
          return { ...c, balance: c.balance - amount };
        } else if (c.id === toCryptoId) {
          return { ...c, balance: c.balance + toAmount };
        }
        return c;
      })
    );

    // Add transaction
    const newTransaction = {
      id: Date.now(),
      type: "convert",
      fromCryptoId,
      toCryptoId,
      fromSymbol: fromCrypto.symbol,
      toSymbol: toCrypto.symbol,
      fromAmount: amount,
      toAmount,
      timestamp: new Date().toISOString(),
      value: fromValue,
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Conversion Successful",
      description: `Converted ${amount} ${fromCrypto.symbol} to ${toAmount.toFixed(6)} ${toCrypto.symbol}`,
    });

    return true;
  };

  // Get wallet address for a crypto
  const getWalletAddress = (cryptoId) => {
    // In a real app, these would be actual wallet addresses
    const addresses = {
      bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      ethereum: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      solana: "5DvTCFuRwp1y3m3sXaxjf2SC1vasUuCh4vnwRZnMqmEG",
      cardano: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      ripple: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    };
    
    return addresses[cryptoId] || "Address not available";
  };

  return (
    <WalletContext.Provider
      value={{
        cryptos,
        transactions,
        getTotalBalance,
        sendCrypto,
        receiveCrypto,
        convertCrypto,
        getWalletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);