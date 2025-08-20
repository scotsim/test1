import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import QRCodeStylized from 'qrcode.react'; // For actual QR code generation

const Receive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cryptos, getWalletAddress, receiveCrypto } = useWallet();
  
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [showTestReceive, setShowTestReceive] = useState(false);

  useEffect(() => {
    if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [cryptos]);

  useEffect(() => {
    if (selectedCrypto) {
      setWalletAddress(getWalletAddress(selectedCrypto));
    }
  }, [selectedCrypto, getWalletAddress]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleTestReceive = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const success = receiveCrypto(
      selectedCrypto,
      parseFloat(amount),
      "Test Wallet"
    );
    
    if (success) {
      setAmount("");
      setShowTestReceive(false);
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);

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
        <h1 className="text-3xl font-bold">Receive Crypto</h1>
        <p className="text-muted-foreground">
          Receive cryptocurrency to your wallet
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle>Your Wallet Address</CardTitle>
            <CardDescription>
              Share this address to receive cryptocurrency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <Select 
                value={selectedCrypto} 
                onValueChange={setSelectedCrypto}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {cryptos.map((crypto) => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      <div className="flex items-center gap-2">
                        <CryptoIcon name={crypto.id} color={crypto.color} size={16} />
                        <span>{crypto.name} ({crypto.symbol})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {walletAddress && (
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-border/50">
                {/* Replace with actual QRCodeStylized if qrcode.react is fully set up */}
                {/* <QRCodeStylized
                  value={walletAddress}
                  size={160}
                  bgColor="hsl(var(--background))"
                  fgColor="hsl(var(--foreground))"
                  level="Q"
                  includeMargin={true}
                  imageSettings={{
                    src: `/icons/${selectedCryptoData?.id}.svg`, // Assuming you have icons
                    excavate: true,
                    width: 30,
                    height: 30,
                  }}
                /> */}
                 <div className="w-40 h-40 bg-background flex items-center justify-center border-2 border-dashed border-primary/50 rounded-lg mb-4">
                    {selectedCryptoData ? 
                      <CryptoIcon name={selectedCryptoData.id} color={selectedCryptoData.color} size={48} />
                      : <QrCode size={48} className="text-muted-foreground" />
                    }
                 </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Scan this QR code to receive {selectedCryptoData?.name}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Your {selectedCryptoData?.name} Address</label>
              <div className="relative">
                <Input
                  value={walletAddress}
                  readOnly
                  className="pr-10 font-mono text-xs sm:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={handleCopyAddress}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Only send {selectedCryptoData?.name} ({selectedCryptoData?.symbol}) to this address
              </p>
            </div>

            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowTestReceive(!showTestReceive)}
              >
                {showTestReceive ? "Hide Test Receive" : "Test Receive (Demo)"}
              </Button>
            </div>

            {showTestReceive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Amount</label>
                  <Input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is for demo purposes only
                  </p>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={handleTestReceive}
                  disabled={!amount}
                >
                  <Download className="h-4 w-4" /> 
                  Simulate Receiving Funds
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Receive;