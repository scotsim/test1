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
import { useToast } from "@/components/ui/use-toast";

const fiatCurrencies = [
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", rate: 1200 }, // Placeholder rate
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", rate: 18.5 },
  { code: "GHC", name: "Ghanaian Cedi", flag: "🇬🇭", rate: 12.5 },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", rate: 130 },
];

const ConvertPage = () => {
  const navigate = useNavigate();
  const { cryptos, getWalletBalance } = useWallet(); // Assuming convertCryptoToFiat would be here
  const { toast } = useToast();
  
  const [fromCrypto, setFromCrypto] = useState("");
  const [toFiat, setToFiat] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setFromCrypto(cryptos[0].id);
    }
    if (fiatCurrencies.length > 0) {
      setToFiat(fiatCurrencies[0].code);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a crypto, fiat currency, and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const cryptoBalance = getWalletBalance(fromCrypto);
    if (parseFloat(amount) > cryptoBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You do not have enough ${fromCryptoData?.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Placeholder for actual conversion logic
    // const success = convertCryptoToFiat(fromCrypto, toFiat, parseFloat(amount));
    // For now, simulate success
    console.log(`Converting ${amount} ${fromCryptoData?.symbol} to ${toFiatData?.code}`);
    
    setTimeout(() => {
      toast({
        title: "Conversion Initiated",
        description: `Your request to convert ${amount} ${fromCryptoData?.symbol} to ${toFiatData?.code} is being processed.`,
      });
      setIsSubmitting(false);
      setAmount("");
      // Potentially navigate or update UI
      // navigate("/"); 
    }, 1500);
  };

  const fromCryptoData = cryptos.find((c) => c.id === fromCrypto);
  const toFiatData = fiatCurrencies.find((f) => f.code === toFiat);
  
  const maxAmount = fromCryptoData ? fromCryptoData.balance : 0;
  
  const getConversionRate = () => {
    if (!fromCryptoData || !toFiatData) return 0;
    // This is crypto price in USD / fiat rate to USD (e.g., USD per NGN)
    // For simplicity, using direct placeholder rates: crypto USD price * fiat rate (e.g., NGN per USD)
    return fromCryptoData.price * toFiatData.rate;
  };
  
  const getEstimatedAmount = () => {
    if (!amount || !fromCryptoData || !toFiatData) return 0;
    const feePercentage = 0.01; // 1% fee
    const cryptoValueInUSD = parseFloat(amount) * fromCryptoData.price;
    const feeInUSD = cryptoValueInUSD * feePercentage;
    const valueAfterFeeInUSD = cryptoValueInUSD - feeInUSD;
    return valueAfterFeeInUSD * toFiatData.rate; // Convert USD to Fiat
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
        <h1 className="text-3xl font-bold">Convert Crypto to Fiat</h1>
        <p className="text-muted-foreground">
          Exchange cryptocurrency for local currency
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>Crypto to Fiat Conversion</CardTitle>
            <CardDescription>
              Select crypto to convert and the desired fiat currency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">From (Crypto)</label>
                  {fromCryptoData && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {maxAmount.toFixed(fromCryptoData.id === 'bitcoin' ? 8 : 4)} {fromCryptoData.symbol}
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
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To (Fiat Currency)</label>
                <Select 
                  value={toFiat} 
                  onValueChange={setToFiat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fiat currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiatCurrencies.map((fiat) => (
                      <SelectItem 
                        key={fiat.code} 
                        value={fiat.code}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{fiat.flag}</span>
                          <span>{fiat.name} ({fiat.code})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Input
                    type="text"
                    value={estimatedAmount ? estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                    readOnly
                    placeholder="0.00"
                    className="bg-muted/50"
                  />
                   {toFiatData && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{toFiatData.code}</span>}
                </div>
              </div>

              {fromCryptoData && toFiatData && amount && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Exchange Rate: 1 {fromCryptoData.symbol} ≈ {conversionRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toFiatData.code}</p>
                  <p>Fee: 1% (approx. {(parseFloat(amount) * fromCryptoData.price * 0.01).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)</p>
                  <p className="font-medium">You will receive approximately: {estimatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toFiatData.code}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={!fromCrypto || !toFiat || !amount || parseFloat(amount) <= 0 || isSubmitting}
              >
                <RefreshCw className="h-4 w-4" /> 
                {isSubmitting ? "Processing..." : `Convert to ${toFiatData?.code || "Fiat"}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ConvertPage;