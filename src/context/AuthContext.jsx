import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import OTPVerificationModal from "@/components/modals/OTPVerificationModal";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user info
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('https://auth-service-v0rl.onrender.com/auth/v2/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch('https://auth-service-v0rl.onrender.com/auth/v2/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        // Set user data
        setUser(data.user);
        
        toast({ 
          title: "Login Successful", 
          description: `Welcome back, ${email}!` 
        });
        navigate('/');
      } else {
        toast({ 
          title: "Login Failed", 
          description: data.message || "Invalid email or password.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ 
        title: "Login Error", 
        description: `Connection failed: ${error.message}. Please check your internet connection.`, 
        variant: "destructive" 
      });
    }
    
    setLoading(false);
  };

  const signup = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch('https://auth-service-v0rl.onrender.com/auth/v2/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show OTP verification modal
        setPendingEmail(email);
        setShowOTPModal(true);
        
        toast({ 
          title: "Account Created", 
          description: "Please check your email for a verification code." 
        });
      } else {
        toast({ 
          title: "Signup Failed", 
          description: data.message || "Failed to create account. Please try again.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({ 
        title: "Signup Error", 
        description: `Connection failed: ${error.message}. Please check your internet connection.`, 
        variant: "destructive" 
      });
    }
    
    setLoading(false);
  };

  const handleVerificationSuccess = () => {
    toast({ 
      title: "Email Verified", 
      description: "Your account has been verified. Please log in." 
    });
    setPendingEmail("");
    navigate('/login');
  };

  const logout = () => {
    // Call logout endpoint
    fetch('https://auth-service-v0rl.onrender.com/auth/v2/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }).catch(() => {
      // Ignore errors on logout
    });
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={pendingEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </AuthContext.Provider>
  );
};