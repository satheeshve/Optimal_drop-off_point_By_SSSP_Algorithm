import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation & Common
      "app_title": "Commuter Genius",
      "user_portal": "User Portal",
      "admin_portal": "Admin Portal",
      "logout": "Logout",
      "login": "Login",
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "search": "Search",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      
      // User Dashboard
      "plan_journey": "Plan Your Journey",
      "source_start": "Source Start",
      "source_stop": "Source Stop",
      "destination": "Destination",
      "fare_budget": "Fare Budget",
      "any_amount": "Any Amount",
      "find_route": "Find Best Route",
      "optimal_route": "Optimal Route",
      "route_map": "Route Map",
      "compare_routes": "Compare Routes",
      "bus": "Bus",
      "metro": "Metro",
      "train": "Train",
      "walk": "Walk",
      "minutes": "minutes",
      "rupees": "₹",
      "transfers": "transfers",
      "best_drop": "Best Drop Point",
      "total_time": "Total Time",
      "total_fare": "Total Fare",
      "get_off_at": "Get off at",
      "then_take": "Then take",
      "arriving_in": "Arriving in",
      "live_tracking": "Live Tracking",
      
      // Admin Dashboard
      "admin_dashboard": "Admin Dashboard",
      "manage_stops": "Manage Stops",
      "manage_fares": "Manage Fares",
      "manage_routes": "Manage Routes",
      "add_stop": "Add Stop",
      "stop_name": "Stop Name",
      "stop_type": "Stop Type",
      "latitude": "Latitude",
      "longitude": "Longitude",
      "update_fare": "Update Fare",
      "route_name": "Route Name",
      "current_fare": "Current Fare",
      "new_fare": "New Fare",
      "stop_added": "Stop added successfully",
      "fare_updated": "Fare updated successfully",
      
      // Authentication
      "username": "Username",
      "password": "Password",
      "admin_login": "Admin Login",
      "login_success": "Login successful",
      "login_failed": "Invalid credentials",
      
      // Notifications
      "bus_arriving": "Bus arriving",
      "bus_delayed": "Bus delayed by",
      "route_updated": "Route updated",
      
      // Symbols (for illiterate users - using emojis)
      "symbol_bus": "🚌",
      "symbol_metro": "🚇",
      "symbol_train": "🚆",
      "symbol_location": "📍",
      "symbol_money": "💰",
      "symbol_time": "⏱️",
      "symbol_user": "👤",
      "symbol_admin": "🔑",
      
      // Safety & Emergency
      "emergency_sos": "Emergency SOS",
      "sos": "SOS",
      "emergency_alert": "Emergency Alert",
      "sos_triggered": "🚨 EMERGENCY ALERT SENT!",
      "alert_sent_contacts": "Alert sent to all emergency contacts",
      "alert_cancelled": "Emergency alert cancelled",
      "sending_alert_in": "Sending alert in",
      "current_location_shared": "Your current location will be shared",
      "contacts_notified": "All emergency contacts will be notified",
      "audio_recording_start": "Audio recording will start automatically",
      "send_now": "Send Now",
      "emergency_contacts": "Emergency Contacts",
      "emergency_contacts_desc": "People who will be notified in case of emergency",
      "add_contact": "Add Contact",
      "test_alert": "Test Alert",
      "contact_added": "Contact added successfully",
      "contact_removed": "Contact removed",
      "calling": "Calling",
      "test_alert_sent": "✅ Test Alert Sent",
      "test_alert_desc": "Test emergency notification sent to all contacts",
      "no_contacts": "No emergency contacts added yet",
      "add_first_contact": "Add First Contact",
      "add_emergency_contact": "Add Emergency Contact",
      "relation": "Relation",
      "priority": "Priority",
      "notification_methods": "Notification Methods",
      "fill_required_fields": "Please fill all required fields",
      "optional": "Optional",
      "share_location": "Share Live Location",
      "women_safety": "Women Safety",
      "child_safety": "Child Safety",
      "panic_mode": "Panic Mode",
      "safe_journey": "Have a Safe Journey!",
      "guardian_alert": "Guardian Alert",
      "medical_info": "Medical Information",
      "blood_group": "Blood Group",
      "allergies": "Allergies",
      "medications": "Medications",
      "emergency_services": "Emergency Services",
      "police": "Police",
      "ambulance": "Ambulance",
      "fire": "Fire Brigade",
      "women_helpline": "Women Helpline",
      "child_helpline": "Child Helpline"
    }
  },
  ta: {
    translation: {
      // Navigation & Common
      "app_title": "பயண மேதை",
      "user_portal": "பயனர் போர்ட்டல்",
      "admin_portal": "நிர்வாக போர்ட்டல்",
      "logout": "வெளியேறு",
      "login": "உள்நுழை",
      "submit": "சமர்ப்பிக்கவும்",
      "cancel": "ரத்து செய்",
      "save": "சேமி",
      "delete": "நீக்கு",
      "edit": "திருத்து",
      "add": "சேர்",
      "search": "தேடு",
      "loading": "ஏற்றுகிறது...",
      "error": "பிழை",
      "success": "வெற்றி",
      
      // User Dashboard
      "plan_journey": "உங்கள் பயணத்தை திட்டமிடுங்கள்",
      "source_start": "தொடக்க நிலையம்",
      "source_stop": "ஏறும் இடம்",
      "destination": "சேருமிடம்",
      "fare_budget": "கட்டண வரம்பு",
      "any_amount": "எந்த தொகையும்",
      "find_route": "சிறந்த பாதையைக் கண்டறியவும்",
      "optimal_route": "சிறந்த பாதை",
      "route_map": "பாதை வரைபடம்",
      "compare_routes": "பாதைகளை ஒப்பிடவும்",
      "bus": "பேருந்து",
      "metro": "மெட்ரோ",
      "train": "தொடர்வண்டி",
      "walk": "நடை",
      "minutes": "நிமிடங்கள்",
      "rupees": "₹",
      "transfers": "மாற்றங்கள்",
      "best_drop": "சிறந்த இறங்கும் இடம்",
      "total_time": "மொத்த நேரம்",
      "total_fare": "மொத்த கட்டணம்",
      "get_off_at": "இங்கே இறங்கவும்",
      "then_take": "பின்னர் ஏறவும்",
      "arriving_in": "வருகிறது",
      "live_tracking": "நேரடி கண்காணிப்பு",
      
      // Admin Dashboard
      "admin_dashboard": "நிர்வாக பலகை",
      "manage_stops": "நிலையங்களை நிர்வகி",
      "manage_fares": "கட்டணங்களை நிர்வகி",
      "manage_routes": "பாதைகளை நிர்வகி",
      "add_stop": "நிலையம் சேர்",
      "stop_name": "நிலைய பெயர்",
      "stop_type": "நிலைய வகை",
      "latitude": "அட்சரேகை",
      "longitude": "தீர்க்கரேகை",
      "update_fare": "கட்டணம் புதுப்பி",
      "route_name": "பாதை பெயர்",
      "current_fare": "தற்போதைய கட்டணம்",
      "new_fare": "புதிய கட்டணம்",
      "stop_added": "நிலையம் வெற்றிகரமாக சேர்க்கப்பட்டது",
      "fare_updated": "கட்டணம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      
      // Authentication
      "username": "பயனர் பெயர்",
      "password": "கடவுச்சொல்",
      "admin_login": "நிர்வாக உள்நுழைவு",
      "login_success": "உள்நுழைவு வெற்றிகரமாக",
      "login_failed": "தவறான நற்சான்றிதழ்கள்",
      
      // Notifications
      "bus_arriving": "பேருந்து வருகிறது",
      "bus_delayed": "பேருந்து தாமதமானது",
      "route_updated": "பாதை புதுப்பிக்கப்பட்டது",
      
      // Symbols remain same (universal)
      "symbol_bus": "🚌",
      "symbol_metro": "🚇",
      "symbol_train": "🚆",
      "symbol_location": "📍",
      "symbol_money": "💰",
      "symbol_time": "⏱️",
      "symbol_user": "👤",
      "symbol_admin": "🔑",
      
      // Safety & Emergency (Tamil)
      "emergency_sos": "அவசர எஸ்ஓஎஸ்",
      "sos": "எஸ்ஓஎஸ்",
      "emergency_alert": "அவசர எச்சரிக்கை",
      "sos_triggered": "🚨 அவசர எச்சரிக்கை அனுப்பப்பட்டது!",
      "alert_sent_contacts": "அனைத்து அவசர தொடர்புகளுக்கும் எச்சரிக்கை அனுப்பப்பட்டது",
      "alert_cancelled": "அவசர எச்சரிக்கை ரத்து செய்யப்பட்டது",
      "sending_alert_in": "எச்சரிக்கை அனுப்புகிறது",
      "current_location_shared": "உங்கள் தற்போதைய இடம் பகிரப்படும்",
      "contacts_notified": "அனைத்து அவசர தொடர்புகளுக்கும் அறிவிக்கப்படும்",
      "audio_recording_start": "ஆடியோ பதிவு தானாக தொடங்கும்",
      "send_now": "இப்போது அனுப்பு",
      "emergency_contacts": "அவசர தொடர்புகள்",
      "emergency_contacts_desc": "அவசர நிலையில் அறிவிக்கப்படும் நபர்கள்",
      "add_contact": "தொடர்பு சேர்",
      "test_alert": "சோதனை எச்சரிக்கை",
      "contact_added": "தொடர்பு வெற்றிகரமாக சேர்க்கப்பட்டது",
      "contact_removed": "தொடர்பு நீக்கப்பட்டது",
      "calling": "அழைக்கிறது",
      "test_alert_sent": "✅ சோதனை எச்சரிக்கை அனுப்பப்பட்டது",
      "test_alert_desc": "சோதனை அவசர அறிவிப்பு அனைத்து தொடர்புகளுக்கும் அனுப்பப்பட்டது",
      "no_contacts": "இன்னும் அவசர தொடர்புகள் சேர்க்கப்படவில்லை",
      "add_first_contact": "முதல் தொடர்பைச் சேர்",
      "add_emergency_contact": "அவசர தொடர்பு சேர்",
      "relation": "உறவு",
      "priority": "முன்னுரிமை",
      "notification_methods": "அறிவிப்பு முறைகள்",
      "fill_required_fields": "அனைத்து தேவையான புலங்களையும் நிரப்பவும்",
      "optional": "விருப்பத்தேர்வு",
      "share_location": "நேரடி இடத்தைப் பகிரவும்",
      "women_safety": "பெண்கள் பாதுகாப்பு",
      "child_safety": "குழந்தை பாதுகாப்பு",
      "panic_mode": "பீதி பயமான நிலை",
      "safe_journey": "பாதுகாப்பான பயணம்!",
      "guardian_alert": "காப்பாளர் எச்சரிக்கை",
      "medical_info": "மருத்துவ தகவல்",
      "blood_group": "இரத்த வகை",
      "allergies": "ஒவ்வாமைகள்",
      "medications": "மருந்துகள்",
      "emergency_services": "அவசர சேவைகள்",
      "police": "காவல்துறை",
      "ambulance": "ஆம்புலன்ஸ்",
      "fire": "தீ அணைப்பு",
      "women_helpline": "பெண்கள் ஹெல்ப்லைன்",
      "child_helpline": "குழந்தை ஹெல்ப்லைன்"
    }
  }
};

// Safe language retrieval with fallback
const getStoredLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch (error) {
    console.warn('localStorage not available:', error);
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
