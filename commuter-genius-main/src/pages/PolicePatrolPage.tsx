import { PolicePatrolManager } from '@/components/safety/PolicePatrolManager';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PolicePatrolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Police Patrol Management</h1>
                <p className="text-xs text-blue-200">Daily Shift & Route Entry System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white">
            <h2 className="text-2xl font-bold mb-3">📋 Instructions for Police Officials</h2>
            <div className="space-y-2 text-sm">
              <p>✅ <strong>Daily Entry Required:</strong> Please enter patrol route details at the start of each shift</p>
              <p>🚔 <strong>Shift Types:</strong> Morning (6AM-2PM), Afternoon (2PM-10PM), Evening (6PM-2AM), Night (10PM-6AM)</p>
              <p>📍 <strong>Location:</strong> Use current location button or enter manually</p>
              <p>👮 <strong>Officer Details:</strong> Name, badge number, and contact information</p>
              <p>🚗 <strong>Vehicle:</strong> Enter patrol vehicle registration number</p>
              <p>⏱️ <strong>Status Updates:</strong> Mark patrol as Active when starting, Complete when done</p>
            </div>
          </div>

          {/* Benefits Card */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-4 border border-green-500/30 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                Public Safety
              </h3>
              <p className="text-sm">Helps citizens find safer routes near active police patrols</p>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-500/30 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🚴</span>
                Delivery Riders
              </h3>
              <p className="text-sm">Zomato, Swiggy, Rapido riders get patrol proximity alerts</p>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-500/30 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Data Analytics
              </h3>
              <p className="text-sm">Generate patrol coverage reports and safety metrics</p>
            </div>
          </div>

          {/* Police Patrol Manager Component */}
          <PolicePatrolManager />
        </motion.div>
      </main>
    </div>
  );
}
