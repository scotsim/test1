import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send as SendIcon, User, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/components/ui/use-toast";

const InternalTransfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cryptos, sendCrypto } = useWallet();
  const { toast } = useToast();
  
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [activeTab, setActiveTab] = useState("userid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set selected crypto from navigation state if available
  useEffect(() => {
    if (location.state?.selectedCrypto) {
      setSelectedCrypto(location.state.selectedCrypto);
    } else if (cryptos.length > 0) {
      setSelectedCrypto(cryptos[0].id);
    }
  }, [location.state, cryptos]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const crypto = cryptos.find((c) => c.id === selectedCrypto);
    if (crypto) {
      setAmount(crypto.balance.toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const recipient = activeTab === "userid" ? recipientId : recipientEmail;
    
    if (!recipient) {
      toast({
        title: "Missing Recipient",
        description: `Please enter a ${activeTab === "userid" ? "User ID" : "email address"}.`,
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
    if (!selectedCryptoData) {
      toast({
        title: "Invalid Cryptocurrency",
        description: "Please select a valid cryptocurrency.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > selectedCryptoData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCryptoData.symbol}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate internal transfer (in a real app, this would be an API call)
    setTimeout(() => {
      const success = sendCrypto(
        selectedCrypto,
        parseFloat(amount),
        `Internal: ${recipient}`
      );
      
      setIsSubmitting(false);
      
      if (success) {
        toast({
          title: "Internal Transfer Successful",
          description: `Sent ${amount} ${selectedCryptoData.symbol} to ${recipient}`,
        });
        
        // Reset form
        setAmount("");
        setRecipientId("");
        setRecipientEmail("");
        
        // Navigate back to dashboard
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    }, 1000);
  };

  const selectedCryptoData = cryptos.find((c) => c.id === selectedCrypto);
  const maxAmount = selectedCryptoData ? selectedCryptoData.balance : 0;
  const estimatedValue = selectedCryptoData && amount 
    ? (parseFloat(amount) * selectedCryptoData.price).toLocaleString('en-US', { maximumFractionDigits: 2 })
    : "0.00";

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
        <h1 className="text-3xl font-bold">Internal Transfer</h1>
        <p className="text-muted-foreground">
          Send crypto to another HyperX user instantly
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="crypto-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Internal Transfer
            </CardTitle>
            <CardDescription>
              Free and instant transfers between HyperX users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Amount</label>
                  {selectedCryptoData && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {maxAmount.toFixed(6)} {selectedCryptoData.symbol}
                    </span>
                  )}
                </div>
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
                <p className="text-sm text-muted-foreground">
                  ≈ ${estimatedValue}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Recipient</label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="userid" className="text-xs">User ID</TabsTrigger>
                    <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="userid" className="mt-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Enter User ID (e.g., @john_doe)"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the recipient's HyperX User ID
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="email" className="mt-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the recipient's registered email address
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transfer Fee</span>
                  <span className="text-green-500 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Time</span>
                  <span className="text-primary font-medium">Instant</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>You will send</span>
                  <span>{amount || "0"} {selectedCryptoData?.symbol || ""}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={!selectedCrypto || !amount || (!recipientId && !recipientEmail) || isSubmitting}
              >
                <SendIcon className="h-4 w-4" /> 
                {isSubmitting ? "Processing..." : "Send Internally"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InternalTransfer;