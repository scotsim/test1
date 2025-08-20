import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";

const TransactionList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions yet
      </div>
    );
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "convert":
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTransactionTitle = (transaction) => {
    const { type, symbol, fromSymbol, toSymbol } = transaction;
    
    switch (type) {
      case "send":
        return `Sent ${symbol}`;
      case "receive":
        return `Received ${symbol}`;
      case "convert":
        return `Converted ${fromSymbol} to ${toSymbol}`;
      default:
        return "Transaction";
    }
  };

  const getTransactionAmount = (transaction) => {
    const { type, amount, symbol, fromAmount, fromSymbol, toAmount, toSymbol } = transaction;
    
    switch (type) {
      case "send":
        return `-${amount} ${symbol}`;
      case "receive":
        return `+${amount} ${symbol}`;
      case "convert":
        return `${fromAmount} ${fromSymbol} → ${toAmount.toFixed(6)} ${toSymbol}`;
      default:
        return "";
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "send":
        return "text-red-500";
      case "receive":
        return "text-green-500";
      case "convert":
        return "text-blue-500";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          className="flex items-center justify-between p-4 rounded-lg glass-effect"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <h4 className="font-medium">{getTransactionTitle(transaction)}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(transaction.timestamp))}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={getTransactionColor(transaction.type)}>
              {getTransactionAmount(transaction)}
            </p>
            <p className="text-sm text-muted-foreground">
              ${transaction.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TransactionList;