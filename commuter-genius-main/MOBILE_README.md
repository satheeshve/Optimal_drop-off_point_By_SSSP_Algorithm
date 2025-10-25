# Commuter Genius - Enhanced Mobile Version

## 🚀 Features

### User Features
- 📍 **Multi-language Support** - English & Tamil (தமிழ்)
- 🗺️ **Interactive Map** - Live route visualization with Leaflet
- 🚌 **Real-time Tracking** - GPS bus/metro/train tracking (simulated)
- 💰 **Budget Planning** - Set fare budget constraints
- ⭐ **Optimal Route** - AI-powered best drop point recommendation
- 🎨 **Beautiful UI** - Glassmorphism design with smooth animations
- 📱 **Mobile Optimized** - Responsive design for all devices
- 🔔 **Notifications** - Instant alerts for bus arrival
- 🎯 **Symbolic UI** - Icon-based for illiterate users

### Admin Features
- 🔑 **Secure Login** - Authentication (username: computer, password: pass@3456)
- 📍 **Manage Stops** - Add/edit/delete bus/metro/train stops
- 💵 **Update Fares** - Real-time fare price management
- 🗺️ **Map Preview** - Visual stop management on map
- 📊 **Route Management** - View and manage all transport routes

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- Modern browser (Chrome, Firefox, Edge, Safari)

### Install Dependencies

Using npm:
```bash
cd commuter-genius-main
npm install
```

Or using bun (faster):
```bash
cd commuter-genius-main
bun install
```

### Required Packages
The following packages will be installed:
- `leaflet` & `react-leaflet` - Interactive maps
- `i18next` & `react-i18next` - Multi-language support
- `lottie-react` - Smooth animations
- `@types/leaflet` - TypeScript support for Leaflet

## 🏃 Running the Application

### Development Mode

Using npm:
```bash
npm run dev
```

Using bun:
```bash
bun run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 Access Points

### User Portal (Mobile Optimized)
- URL: `http://localhost:5173/mobile`
- Features: Plan journey, view routes, get optimal drop point

### Admin Portal (Mobile Optimized)
- URL: `http://localhost:5173/admin/mobile`
- Login: username = `computer`, password = `pass@3456`
- Features: Manage stops, update fares, view routes

### Classic Desktop Version
- URL: `http://localhost:5173/`

## 🌐 Language Switching
- Click the 🌐 globe icon in the header
- Select English 🇬🇧 or தமிழ் 🇮🇳
- Language preference is saved locally

## 🗺️ Map Features
- **Interactive Markers**: Click on any stop to view details
- **Animated Routes**: Colored polylines showing bus/metro/train paths
- **Live Tracking**: Animated vehicles moving along routes (simulated)
- **Optimal Drop Point**: Starred marker showing best place to get off

## 💡 Key Updates

### Fare Update
- Bus 77 (Koyambedu to Avadi): **₹17** (updated from ₹25)
- All fares are in Indian Rupees (₹)

### Symbolic Representations
- 🚌 Bus
- 🚇 Metro
- 🚆 Train
- 📍 Location/Stop
- 💰 Fare/Money
- ⏱️ Time
- 👤 User
- 🔑 Admin

## 🎨 Design Features
- **Glassmorphism** - Frosted glass effect backgrounds
- **Gradient Themes** - Beautiful color transitions
- **Smooth Animations** - Framer Motion powered
- **Responsive** - Works on mobile, tablet, desktop
- **Dark Mode** - Automatic theme support

## 📱 Mobile UI Highlights
- Large touch targets (minimum 44px)
- Clear visual hierarchy
- Icon-first design for accessibility
- Swipe-friendly interface
- Optimized for one-handed use

## 🔐 Security
- Admin authentication with session management
- Password-protected admin features
- Client-side data validation
- Secure route protection

## 🚀 Future Enhancements (Planned)
- Google Maps API integration
- Real Chalo app-like live tracking
- Push notifications (Web Push API)
- Offline mode with service workers
- Voice navigation
- More languages
- ML-based ETA prediction

## 📊 Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: Leaflet + React Leaflet
- **Animations**: Framer Motion
- **i18n**: react-i18next
- **Routing**: React Router v6
- **State**: React Query (TanStack)

## 🐛 Troubleshooting

### Map not showing?
Make sure Leaflet CSS is imported in `src/index.css`

### Language not switching?
Clear browser localStorage and reload

### Admin can't login?
Use exact credentials: `computer` / `pass@3456`

## 📄 License
MIT License

## 👥 Contributors
[Your Team Names Here]

## 🌟 Star this Project!
If you find this useful, please give it a star ⭐
