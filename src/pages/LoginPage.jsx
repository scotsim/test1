import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Mail, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      await login(email, password);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const response = await fetch('https://auth-service-v0rl.onrender.com/list/endpoints');
      if (response.ok) {
        alert('✅ Connection successful! Backend is reachable.');
      } else {
        alert('❌ Connection failed. Backend returned error: ' + response.status);
      }
    } catch (error) {
      alert('❌ Connection failed: ' + error.message);
    }
    setIsTestingConnection(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card/80 backdrop-blur-lg border-primary/30 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="text-center p-8 bg-primary/10">
            <div className="flex justify-center items-center mb-4">
              <ShieldCheck className="h-20 w-20 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Secure Login</CardTitle>
            <CardDescription className="text-muted-foreground">Access your CryptoWallet securely.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-background/70 border-border/50 focus:border-primary h-12 text-base ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 bg-background/70 border-border/50 focus:border-primary h-12 text-base ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full crypto-gradient text-lg py-3 h-12 font-semibold tracking-wider hover:opacity-90 transition-opacity duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 border-2 border-transparent border-t-white rounded-full mr-2" />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Authenticating...' : 'Log In'}
              </Button>
            </form>
            
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={isTestingConnection}
              className="w-full mt-4"
            >
              {isTestingConnection ? 'Testing...' : 'Test Backend Connection'}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-3 p-8 bg-primary/5">
            <Button variant="link" onClick={() => navigate('/forgot-password')} className="text-sm text-muted-foreground hover:text-primary">
              Forgot password?
            </Button>
            <p className="text-sm text-muted-foreground">
              New to CryptoWallet?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;