import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, List, Search, Copy, ChevronDown, History, Repeat, Filter, Wallet, Bell, LifeBuoy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransferTypeModal from "@/components/modals/TransferTypeModal";

const ActionButton = ({ icon: Icon, label, onClick, className }) => (
  <motion.div 
    className="flex flex-col items-center gap-1"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Button
      variant="outline"
      size="icon"
      className={cn("bg-card hover:bg-muted/80 border-border/50 rounded-full w-14 h-14", className)}
      onClick={onClick}
    >
      <Icon className="h-6 w-6 text-primary" />
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </motion.div>
);

const AssetRowNew = ({ crypto, onClick }) => {
  const { symbol, name, balance, price, color } = crypto;
  const value = balance * price;
  const percentChange = (Math.random() * 2 - 1).toFixed(2); 
  const isPositive = parseFloat(percentChange) >= 0;

  return (
    <motion.div
      className="flex items-center justify-between p-3 hover:bg-muted/30 cursor-pointer rounded-lg transition-colors duration-150"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center" 
          style={{ backgroundColor: `${color}20` }}
        >
          <CryptoIcon name={crypto.id} color={color} size={22}/>
        </div>
        <div>
          <p className="font-medium text-sm">{symbol}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            <span className={cn("ml-2", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? "+" : ""}{percentChange}%
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">{balance.toFixed(crypto.id === 'bitcoin' ? 8 : 4)}</p>
        <p className="text-xs text-muted-foreground">${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { cryptos, getTotalBalance } = useWallet();
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [assetSearchTerm, setAssetSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("crypto");
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleSendClick = () => {
    setIsTransferModalOpen(true);
  };

  const handleTransferTypeSelect = (type) => {
    if (type === "internal") {
      navigate("/internal-transfer");
    } else {
      navigate("/send");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };
  
  const filteredCryptos = cryptos.filter(c => 
    c.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(assetSearchTerm.toLowerCase())
  );

  const totalBalance = getTotalBalance();
  const simulatedDailyChange = (totalBalance * (Math.random() * 0.02 - 0.01)); 
  const simulatedDailyPercent = (simulatedDailyChange / (totalBalance || 1)) * 100;

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <motion.div 
        variants={item} 
        initial="hidden" 
        animate="show" 
        className="flex items-center justify-between gap-4 mb-4 px-1"
      >
        <div className="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md">
          <Input 
            type="text"
            placeholder="Search wallet (e.g. Bitcoin, send...)"
            className="pl-10 bg-card/80 backdrop-blur-sm border-border/50 focus:border-primary h-10 text-sm rounded-full"
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full">
            <LifeBuoy size={20} />
          </Button>
        </div>
      </motion.div>
      
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="crypto-card border-none p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet size={16} />
              <span>Wallet Balance</span>
              <ChevronDown size={16} className="cursor-pointer hover:text-primary" />
            </div>
            <Copy size={16} className="text-muted-foreground cursor-pointer hover:text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-1">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <div className="flex items-center text-xs mb-3">
            <span className={cn(simulatedDailyChange >= 0 ? "text-green-500" : "text-red-500")}>
              {simulatedDailyChange >= 0 ? "+" : ""}${Math.abs(simulatedDailyChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              ({simulatedDailyPercent.toFixed(2)}%) 1D
            </span>
          </div>
          <div className="h-1 w-full rounded-full">
            <div 
              className={cn(
                "h-full rounded-full",
                simulatedDailyChange >= 0 ? "bg-green-500/70" : "bg-red-500/70"
              )} 
              style={{ width: `${50 + simulatedDailyPercent * 5}%`}}
            ></div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-x-2 gap-y-4 items-start justify-items-center px-2 py-4"
      >
        <ActionButton icon={ArrowUpRight} label="Send" onClick={handleSendClick} />
        <ActionButton icon={ArrowDownLeft} label="Receive" onClick={() => navigate("/receive")} />
        <ActionButton icon={Repeat} label="Convert" onClick={() => navigate("/convert")} />
        <ActionButton icon={History} label="History" onClick={() => navigate("/history")} />
      </motion.div>
      
      <motion.div variants={item} initial="hidden" animate="show">
        <Card className="crypto-card border-none p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Check $NEW_COIN airdrop!</p>
              <p className="text-xs text-muted-foreground">Exclusively on YourWallet.</p>
            </div>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto">Check <ArrowUpRight size={14} className="ml-1"/></Button>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} initial="hidden" animate="show">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card crypto-card border-none">
            <TabsTrigger value="crypto" className="data-[state=active]:bg-muted/70 data-[state=active]:text-primary">Crypto</TabsTrigger>
            <TabsTrigger value="nft" disabled>NFT</TabsTrigger>
            <TabsTrigger value="defi" disabled>DeFi</TabsTrigger>
            <TabsTrigger value="approvals" disabled>Approvals</TabsTrigger>
          </TabsList>
          <TabsContent value="crypto" className="mt-4">
            <Card className="crypto-card border-none">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle className="text-sm font-normal text-muted-foreground">Total assets</CardTitle>
                    <p className="text-lg font-semibold">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Filter size={18} className="text-muted-foreground cursor-pointer hover:text-primary" />
                </div>
                <div className="relative">
                  <Input 
                    type="text"
                    placeholder="Search assets..."
                    className="pl-9 bg-background/50 border-border/50 focus:border-primary h-9 text-sm rounded-full"
                    value={assetSearchTerm}
                    onChange={(e) => setAssetSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0 max-h-[400px] overflow-y-auto">
                {filteredCryptos.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCryptos.map((crypto) => (
                      <AssetRowNew 
                        key={crypto.id} 
                        crypto={crypto} 
                        onClick={handleSendClick}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-sm text-muted-foreground">
                    {assetSearchTerm ? "No assets found matching your search." : "No assets yet."}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nft"><p className="text-center py-10 text-muted-foreground">NFTs coming soon!</p></TabsContent>
          <TabsContent value="defi"><p className="text-center py-10 text-muted-foreground">DeFi features coming soon!</p></TabsContent>
          <TabsContent value="approvals"><p className="text-center py-10 text-muted-foreground">Approvals management coming soon!</p></TabsContent>
        </Tabs>
      </motion.div>

      <TransferTypeModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSelectType={handleTransferTypeSelect}
      />
    </div>
  );
};

export default Dashboard;