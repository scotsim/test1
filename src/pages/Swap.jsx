import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";

const Swap = () => {
  const navigate = useNavigate();
  const { cryptos, convertCrypto } = useWallet();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toCrypto, setToCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
      if (cryptos.length > 1) {
        setToCrypto(cryptos[1].id);
      }
    }
  }, [cryptos]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === fromCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSwapCryptos = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = convertCrypto(
      fromCrypto,
      toCrypto,
      parseFloat(amount)
    );
    
    setIsSubmitting(false);
    
    if (success) {
      setAmount("");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toCryptoData = cryptos.find((c) => c.id === toCrypto);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;
  
  const getConversionRate = () => {
    if (!fromCryptoData || !toCryptoData) return 0;
    return toCryptoData.price > 0 ? fromCryptoData.price / toCryptoData.price : 0;
  };
  
  const getEstimatedAmount = () => {
    if (!amount || !fromCryptoData || !toCryptoData) return 0;
    const fee = 0.01; 
    const fromValue = parseFloat(amount) * fromCryptoData.price;
    const feeAmount = fromValue * fee;
    const toValue = fromValue - feeAmount;
    return toValue / toCryptoData.price;
  };

  const conversionRate = getConversionRate();
  const estimatedAmount = getEstimatedAmount();

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="gap-2 mb-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Swap Crypto</h1>
        <p className="text-muted-foreground">
          Exchange one cryptocurrency for another
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>Swap Cryptocurrency</CardTitle>
            <CardDescription>
              Trade between different cryptocurrencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">From</label>
                  {fromCryptoData && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {maxAmount.toFixed(6)} {fromCryptoData.symbol}
                    </span>
                  )}
                </div>
                <Select 
                  value={fromCrypto} 
                  onValueChange={setFromCrypto}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptos.map((crypto) => (
                      <SelectItem 
                        key={crypto.id} 
                        value={crypto.id}
                        disabled={crypto.id === toCrypto}
                      >
                        <div className="flex items-center gap-2">
                          <CryptoIcon name={crypto.id} color={crypto.color} size={16} />
                          <span>{crypto.name} ({crypto.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-16"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 px-2 text-xs"
                    onClick={handleMaxAmount}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSwapCryptos}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Select 
                  value={toCrypto} 
                  onValueChange={setToCrypto}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptos.map((crypto) => (
                      <SelectItem 
                        key={crypto.id} 
                        value={crypto.id}
                        disabled={crypto.id === fromCrypto}
                      >
                        <div className="flex items-center gap-2">
                          <CryptoIcon name={crypto.id} color={crypto.color} size={16} />
                          <span>{crypto.name} ({crypto.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Input
                    type="text"
                    value={estimatedAmount ? estimatedAmount.toFixed(6) : ""}
                    readOnly
                    placeholder="0.00"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              {fromCryptoData && toCryptoData && (
                <div className="text-sm text-muted-foreground">
                  <p>Exchange Rate: 1 {fromCryptoData.symbol} ≈ {conversionRate.toFixed(6)} {toCryptoData.symbol}</p>
                  <p>Fee: 1% ({amount ? (parseFloat(amount) * fromCryptoData.price * 0.01).toFixed(2) : "0.00"} USD)</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={!fromCrypto || !toCrypto || !amount || isSubmitting || fromCrypto === toCrypto}
              >
                <RefreshCw className="h-4 w-4" /> 
                {isSubmitting ? "Processing..." : "Swap"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Swap;