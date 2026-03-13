import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Phone, MapPin, AlertTriangle, Users, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SOSButton } from '../components/safety/SOSButton';
import { EmergencyContactsManager } from '../components/safety/EmergencyContactsManager';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { HazardReportForm } from '../components/safety/HazardReportForm';
import { Link } from 'react-router-dom';

export default function SafetyDashboard() {
  const { t } = useTranslation();
  const [isLocationSharing, setIsLocationSharing] = useState(false);

  const emergencyNumbers = [
    { name: t('police') || 'Police', number: '100', icon: '👮', color: 'bg-blue-600' },
    { name: t('ambulance') || 'Ambulance', number: '108', icon: '🚑', color: 'bg-red-600' },
    { name: t('fire') || 'Fire Brigade', number: '101', icon: '🚒', color: 'bg-orange-600' },
    { name: t('women_helpline') || 'Women Helpline', number: '1091', icon: '👩', color: 'bg-pink-600' },
    { name: t('child_helpline') || 'Child Helpline', number: '1098', icon: '🧒', color: 'bg-purple-600' },
  ];

  const handleQuickDial = (number: string, name: string) => {
    window.location.href = `tel:${number}`;
    console.log(`Calling ${name} at ${number}`);
  };

  const handleLocationShare = () => {
    setIsLocationSharing(!isLocationSharing);
    if (!isLocationSharing) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Sharing location:', latitude, longitude);
          },
          (error) => console.error('Location error:', error)
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-96 h-96 bg-red-500/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-500/30 rounded-full blur-2xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-40 shadow-2xl"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl"
              >
                <Shield className="w-8 h-8 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  {t('app_title') || 'Commuter Genius'}
                </h1>
                <p className="text-sm text-red-200">
                  🛡️ {t('safe_journey') || 'Your Safety Guardian'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/mobile">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg">
                    <Navigation className="h-4 w-4 mr-2" />
                    Routes
                  </Button>
                </motion.div>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8 max-w-5xl relative z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-red-950/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-6xl">🛡️</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t('safe_journey') || 'Have a Safe Journey!'}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Emergency help is just one tap away. We're here to ensure your safety throughout your journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Live Location Sharing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-lg">{t('share_location') || 'Share Location'}</h3>
                <p className="text-sm text-muted-foreground">
                  Share your live location with trusted contacts
                </p>
                <Button
                  className={`w-full ${isLocationSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={handleLocationShare}
                >
                  {isLocationSharing ? '✅ Sharing...' : '📍 Start Sharing'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Journey Tracking */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-lg">Track Journey</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your trip and get deviation alerts
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  🚀 Start Tracking
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Women Safety Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-xl transition-shadow cursor-pointer h-full border-pink-200 dark:border-pink-800">
              <CardContent className="pt-6 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="font-bold text-lg">{t('women_safety') || 'Women Safety'}</h3>
                <p className="text-sm text-muted-foreground">
                  Enhanced protection with silent alarm
                </p>
                <Button className="w-full bg-pink-600 hover:bg-pink-700">
                  🌸 Enable Mode
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs: Emergency Contacts & Services */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <TabsTrigger value="contacts" className="text-base">
              👥 {t('emergency_contacts') || 'Emergency Contacts'}
            </TabsTrigger>
            <TabsTrigger value="services" className="text-base">
              📞 {t('emergency_services') || 'Emergency Services'}
            </TabsTrigger>
          </TabsList>

          {/* Emergency Contacts Tab */}
          <TabsContent value="contacts" className="mt-6">
            <EmergencyContactsManager />
          </TabsContent>

          {/* Emergency Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Phone className="h-6 w-6" />
                  {t('emergency_services') || 'Quick Dial Emergency Services'}
                </CardTitle>
                <CardDescription>
                  Tap any service to call immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {emergencyNumbers.map((service, index) => (
                    <motion.div
                      key={service.number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-full ${service.color} flex items-center justify-center text-3xl shadow-lg`}>
                              {service.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{service.name}</h3>
                              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                {service.number}
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className={service.color}
                              onClick={() => handleQuickDial(service.number, service.name)}
                            >
                              <Phone className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Safety Tips */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                ✅ Always share your location when traveling alone at night
              </li>
              <li className="flex items-center gap-2">
                ✅ Keep your phone charged and emergency contacts updated
              </li>
              <li className="flex items-center gap-2">
                ✅ Trust your instincts - if something feels wrong, seek help
              </li>
              <li className="flex items-center gap-2">
                ✅ Use well-lit and crowded routes whenever possible
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Floating SOS Button */}
      <SOSButton />
      
      {/* Floating Hazard Report Button */}
      <HazardReportForm />
    </div>
  );
}
