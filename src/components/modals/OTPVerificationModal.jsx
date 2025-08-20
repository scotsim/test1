import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const OTPVerificationModal = ({ isOpen, onClose, email, onVerificationSuccess }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-character OTP code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://auth-service-v0rl.onrender.com'}/auth/v2/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        });
        onVerificationSuccess();
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid OTP code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://auth-service-v0rl.onrender.com'}/auth/v2/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
        });
        setCountdown(60);
        setOtp("");
      } else {
        toast({
          title: "Resend Failed",
          description: data.message || "Failed to resend verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Resend Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerifyOTP();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <Card className="crypto-card border-none shadow-2xl">
              <CardHeader className="relative text-center pb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold">Verify Your Email</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-sm font-medium text-primary">{email}</p>
              </CardHeader>
              
              <CardContent className="space-y-6 pb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={handleOTPChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the code exactly as received in your email
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  className="w-full crypto-gradient text-black dark:text-black"
                  disabled={!otp || otp.length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 border-2 border-transparent border-t-current rounded-full mr-2"
                      />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Email
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isResending}
                    className="text-primary hover:text-primary/80"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OTPVerificationModal;