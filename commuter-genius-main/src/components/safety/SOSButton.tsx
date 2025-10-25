import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MapPin, Shield, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface SOSButtonProps {
  onEmergency?: () => void;
  className?: string;
  showConfirmation?: boolean; // If true, shows confirmation dialog before triggering
}

export const SOSButton = ({ 
  onEmergency, 
  className = '', 
  showConfirmation = true 
}: SOSButtonProps) => {
  const { t } = useTranslation();
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
    };
  }, [pressTimer]);

  // Countdown effect when dialog is shown
  useEffect(() => {
    if (showDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showDialog && countdown === 0) {
      triggerEmergency();
    }
  }, [showDialog, countdown]);

  const handleLongPressStart = () => {
    setIsLongPressing(true);
    
    const timer = setTimeout(() => {
      if (showConfirmation) {
        setShowDialog(true);
        setCountdown(5);
      } else {
        triggerEmergency();
      }
    }, 2000); // 2 seconds long press
    
    setPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    setIsLongPressing(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const triggerEmergency = () => {
    setShowDialog(false);
    setIsLongPressing(false);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendEmergencyAlert(latitude, longitude);
        },
        (error) => {
          console.error('Location error:', error);
          sendEmergencyAlert(0, 0); // Send without location
        }
      );
    } else {
      sendEmergencyAlert(0, 0);
    }
    
    if (onEmergency) {
      onEmergency();
    }
  };

  const sendEmergencyAlert = (lat: number, lng: number) => {
    // Simulate sending emergency alerts
    // In production, this would call backend API
    
    toast.error(t('sos_triggered') || '🚨 EMERGENCY ALERT SENT!', {
      description: t('alert_sent_contacts') || `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}\nAlert sent to all emergency contacts`,
      duration: 10000,
      action: {
        label: t('cancel') || 'Cancel',
        onClick: () => {
          toast.success(t('alert_cancelled') || 'Emergency alert cancelled');
        },
      },
    });

    // Play alert sound (if available)
    try {
      const audio = new Audio('/emergency-alert.mp3');
      audio.play().catch(() => {
        // Fallback: Use browser beep
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      });
    } catch (error) {
      console.error('Audio error:', error);
    }

    // Vibrate phone (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    console.log('📍 Emergency Alert Details:', {
      timestamp: new Date().toISOString(),
      location: { lat, lng },
      userAgent: navigator.userAgent,
      battery: (navigator as any).getBattery?.(),
    });
  };

  const cancelAlert = () => {
    setShowDialog(false);
    setCountdown(5);
    setIsLongPressing(false);
    toast.info(t('alert_cancelled') || 'Emergency alert cancelled');
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl flex flex-col items-center justify-center z-50 ${className}`}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isLongPressing ? [1, 1.1, 1] : 1,
          boxShadow: isLongPressing 
            ? ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)']
            : '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
        transition={{
          duration: 1,
          repeat: isLongPressing ? Infinity : 0,
        }}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
        <span className="text-white text-xs font-bold mt-1">
          {t('sos') || 'SOS'}
        </span>
        
        {isLongPressing && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2 }}
          />
        )}
      </motion.button>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showDialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={cancelAlert}
            >
              {/* Dialog */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="border-4 border-red-500 shadow-2xl bg-white dark:bg-gray-900">
                  <CardHeader className="bg-red-600 text-white relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-white hover:bg-red-700"
                      onClick={cancelAlert}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Shield className="h-8 w-8 animate-pulse" />
                      {t('emergency_alert') || '🚨 EMERGENCY ALERT'}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-6 space-y-6">
                    {/* Countdown Circle */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="relative w-32 h-32 flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, ease: "linear" }}
                      >
                        <div className="absolute inset-0 rounded-full border-8 border-red-200 dark:border-red-900" />
                        <motion.div
                          className="absolute inset-0 rounded-full border-8 border-red-600"
                          style={{
                            clipPath: `polygon(50% 0%, 50% 50%, ${50 + 50 * Math.sin((countdown / 5) * 2 * Math.PI)}% ${50 - 50 * Math.cos((countdown / 5) * 2 * Math.PI)}%, 50% 50%)`,
                          }}
                        />
                        <span className="text-6xl font-bold text-red-600 z-10">
                          {countdown}
                        </span>
                      </motion.div>
                      <p className="text-center text-lg font-semibold mt-4 text-gray-700 dark:text-gray-300">
                        {t('sending_alert_in') || 'Sending alert in'}...
                      </p>
                    </div>

                    {/* Alert Details */}
                    <div className="space-y-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-red-600" />
                        <span className="text-sm">
                          {t('current_location_shared') || 'Your current location will be shared'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-red-600" />
                        <span className="text-sm">
                          {t('contacts_notified') || 'All emergency contacts will be notified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-sm">
                          {t('audio_recording_start') || 'Audio recording will start automatically'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-14 text-lg"
                        onClick={cancelAlert}
                      >
                        {t('cancel') || '❌ Cancel'}
                      </Button>
                      <Button
                        className="flex-1 h-14 text-lg bg-red-600 hover:bg-red-700"
                        onClick={triggerEmergency}
                      >
                        {t('send_now') || '🚨 Send Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
