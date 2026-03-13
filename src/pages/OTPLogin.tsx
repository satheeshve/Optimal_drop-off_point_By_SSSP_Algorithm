import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function OTPLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async () => {
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Invalid phone number', {
        description: 'Please enter a valid 10-digit Indian mobile number',
      });
      return;
    }

    setLoading(true);

    // Simulate API call to send OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setResendTimer(30);
      
      // Countdown timer
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success('OTP Sent Successfully! 📱', {
        description: `Verification code sent to +91 ${phoneNumber}`,
      });

      // For demo purposes, show the OTP in console
      console.log('🔐 Demo OTP: 123456');
    }, 2000);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Invalid OTP', {
        description: 'Please enter the 6-digit code',
      });
      return;
    }

    setLoading(true);

    // Simulate API call to verify OTP
    setTimeout(() => {
      setLoading(false);
      
      // For demo, accept 123456 or any 6-digit code
      if (otp === '123456' || otp.length === 6) {
        setStep('success');
        
        // Store authentication in localStorage
        localStorage.setItem('userAuthenticated', 'true');
        localStorage.setItem('userPhone', phoneNumber);
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        toast.success('Verification Successful! ✅', {
          description: 'Welcome to Commuter Genius',
        });

        // Navigate to mobile dashboard after 2 seconds
        setTimeout(() => {
          navigate('/mobile');
        }, 2000);
      } else {
        toast.error('Invalid OTP', {
          description: 'Please check the code and try again',
        });
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast.success('OTP Resent! 📱', {
      description: 'A new code has been sent to your phone',
    });
    
    console.log('🔐 Demo OTP: 123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-2xl bg-white/10 border-2 border-white/30 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Shield className="w-12 h-12 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-white">
              {step === 'phone' && 'Secure Login 🔐'}
              {step === 'otp' && 'Verify OTP 📱'}
              {step === 'success' && 'Welcome! 🎉'}
            </CardTitle>
            <CardDescription className="text-gray-200">
              {step === 'phone' && 'Enter your mobile number to receive a verification code'}
              {step === 'otp' && `Enter the 6-digit code sent to +91 ${phoneNumber}`}
              {step === 'success' && 'Your account has been verified successfully'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Phone Number */}
              {step === 'phone' && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="w-16 h-12 rounded-lg bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-semibold backdrop-blur-xl">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 h-12 text-lg bg-white/20 border-2 border-white/30 text-white placeholder:text-gray-300 backdrop-blur-xl"
                        maxLength={10}
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-300">
                      We'll send you a 6-digit verification code via SMS
                    </p>
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || phoneNumber.length !== 10}
                    className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/')}
                      className="text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Back to Home
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-white text-center block">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-12 h-14 text-2xl font-bold bg-white/20 border-2 border-white/30 text-white backdrop-blur-xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-center text-gray-300">
                      {resendTimer > 0 ? (
                        <span>Resend OTP in {resendTimer}s</span>
                      ) : (
                        <Button
                          variant="link"
                          onClick={handleResendOTP}
                          className="text-cyan-300 hover:text-cyan-200 p-0 h-auto"
                        >
                          Didn't receive? Resend OTP
                        </Button>
                      )}
                    </p>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <Check className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                      }}
                      className="text-gray-300 hover:text-white hover:bg-white/10"
                      disabled={loading}
                    >
                      Change Number
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Check className="w-14 h-14 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Verification Successful!
                    </h3>
                    <p className="text-gray-200">
                      Redirecting to your dashboard...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Note */}
            {step !== 'success' && (
              <div className="mt-6 p-4 rounded-lg bg-blue-500/20 border border-blue-400/30">
                <p className="text-xs text-center text-gray-200">
                  🔒 Your phone number is secure and will never be shared.
                  We use OTP verification to prevent bot users and scams.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Hint */}
        {step === 'otp' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-400/30 backdrop-blur-xl"
          >
            <p className="text-xs text-center text-yellow-100">
              <strong>Demo Mode:</strong> Use OTP <code className="px-2 py-1 bg-black/30 rounded">123456</code> for testing
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
