import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, Zap, AlertTriangle, MapPin,
  Award, BarChart3, ArrowRight, CheckCircle, Users 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { calculateDeliveryRisk, getDeliveryRecommendations, SAMPLE_DELIVERY_ORDERS } from '@/utils/deliveryRisk';
import { calculateSafetyScore, SAMPLE_POLICE_STATIONS, SAMPLE_INCIDENTS } from '@/utils/safetyScoring';

export default function DiagnosticTest() {
  const [selectedDemo, setSelectedDemo] = useState<'performance' | 'safety' | 'delivery'>('performance');

  // Sample safety calculation
  const sampleLocation = { lat: 13.0827, lng: 80.2707 };
  const safetyScore = calculateSafetyScore({
    location: sampleLocation,
    incidents: SAMPLE_INCIDENTS,
    feedbacks: [
      { rating: 7.5, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), credibility: 0.8 }
    ],
    crowdDensity: 45,
    infrastructureRating: 7.0,
    policeStations: SAMPLE_POLICE_STATIONS,
  });

  // Sample delivery risk
  const deliveryRisk = calculateDeliveryRisk(SAMPLE_DELIVERY_ORDERS[0]);
  const deliveryHighRisk = calculateDeliveryRisk(SAMPLE_DELIVERY_ORDERS[1]);
  const recommendations = getDeliveryRecommendations(deliveryRisk);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-b">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Badge className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Research Implementation
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight">
              Safety-Enhanced Urban Navigation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Optimal Drop-off Point Using Safety-Aware SSSP Algorithm
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>🎓 Final Year Project</span>
              <span>•</span>
              <span>🏛️ RMK College of Engineering and Technology</span>
              <span>•</span>
              <span>📄 IEEE Conference Paper</span>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Link to="/">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <MapPin className="h-5 w-5 mr-2" />
                  Try Route Planning
                </Button>
              </Link>
              <Link to="/safety">
                <Button size="lg" variant="outline" className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white">
                  <Shield className="h-5 w-5 mr-2" />
                  Safety Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Key Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Enhanced SSSP Algorithm</CardTitle>
                <CardDescription>
                  1.77× faster than classical Dijkstra with O(m + n log n / log log n) complexity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Soft heap priority queues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Hierarchical decomposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dynamic safety integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Multi-Dimensional Safety</CardTitle>
                <CardDescription>
                  26.6% safety improvement through comprehensive scoring framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Incident-based analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Crowd density monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Police presence tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 hover:border-red-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Emergency Response</CardTitle>
                <CardDescription>
                  67% response time reduction with 96.1% contact success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>One-tap SOS activation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Multi-channel alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Live location sharing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interactive Demos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">System Demonstrations</CardTitle>
            <CardDescription>
              Explore live demonstrations of key features and algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedDemo} onValueChange={(v) => setSelectedDemo(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="performance">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="safety">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety Scoring
                </TabsTrigger>
                <TabsTrigger value="delivery">
                  <Users className="h-4 w-4 mr-2" />
                  Delivery Risk
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-6 pt-6">
                <PerformanceMetrics />
              </TabsContent>

              <TabsContent value="safety" className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Safety Score Calculation</CardTitle>
                      <CardDescription>Chennai Central Metro Station</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-6">
                        <div className="text-6xl font-bold text-primary mb-2">
                          {safetyScore.total.toFixed(1)}
                        </div>
                        <p className="text-muted-foreground">Overall Safety Score</p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { label: 'Incident Score', value: safetyScore.incident, color: 'blue' },
                          { label: 'User Feedback', value: safetyScore.feedback, color: 'green' },
                          { label: 'Crowd Density', value: safetyScore.crowd, color: 'yellow' },
                          { label: 'Lighting', value: safetyScore.lighting, color: 'purple' },
                          { label: 'Police Presence', value: safetyScore.police, color: 'red' }
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">{item.label}</span>
                              <span className="text-sm font-semibold">{item.value.toFixed(1)}/10</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-${item.color}-500`}
                                style={{ width: `${(item.value / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Safety Formula</CardTitle>
                      <CardDescription>Multi-dimensional weighted scoring</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-secondary/50 rounded-lg font-mono text-sm">
                        S<sub>total</sub>(p,t) = Σ w<sub>i</sub> × S<sub>i</sub>(p,t)
                      </div>

                      <div className="space-y-2 text-sm">
                        <h4 className="font-semibold mb-3">Component Weights:</h4>
                        {[
                          { name: 'Incident History (w₁)', weight: '35%' },
                          { name: 'User Feedback (w₂)', weight: '25%' },
                          { name: 'Crowd Density (w₃)', weight: '15%' },
                          { name: 'Infrastructure (w₄)', weight: '15%' },
                          { name: 'Police Proximity (w₅)', weight: '10%' }
                        ].map(item => (
                          <div key={item.name} className="flex justify-between">
                            <span>{item.name}</span>
                            <Badge>{item.weight}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[deliveryRisk, deliveryHighRisk].map((risk, index) => {
                    const order = SAMPLE_DELIVERY_ORDERS[index];
                    const recs = getDeliveryRecommendations(risk);
                    const colorClass = recs.color === 'green' ? 'text-green-600' : recs.color === 'yellow' ? 'text-yellow-600' : recs.color === 'orange' ? 'text-orange-600' : 'text-red-600';
                    
                    return (
                      <Card key={index} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">{recs.icon}</span>
                                Order {order.orderId}
                              </CardTitle>
                              <CardDescription className="mt-2 text-xs">
                                {order.pickupLocation.address} → {order.dropLocation.address}
                              </CardDescription>
                            </div>
                            <Badge className="capitalize">{risk.recommendation}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center py-4 bg-secondary/50 rounded-lg">
                            <div className={`text-5xl font-bold mb-2 ${colorClass}`}>
                              {risk.totalRisk}/10
                            </div>
                            <p className="text-sm text-muted-foreground">Risk Score</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Recommended Actions:</h4>
                            <ul className="space-y-1.5 text-sm">
                              {recs.actions.slice(0, 3).map((action, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="mt-0.5">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Navigation CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Ready to Experience the System?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our safety-first navigation system with live route planning, emergency features, and comprehensive safety intelligence.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Route Planning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/safety">
                  <Button size="lg" variant="outline">
                    Safety Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button size="lg" variant="outline">
                    Admin Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
