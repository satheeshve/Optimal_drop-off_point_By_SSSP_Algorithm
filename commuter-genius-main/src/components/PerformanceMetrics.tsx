import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, Clock, Award } from 'lucide-react';
import { Badge } from './ui/badge';

export function PerformanceMetrics() {
  // Results from paper's experimental evaluation
  const metrics = {
    speedup: 1.77,
    safetyImprovement: 26.6,
    verificationRate: 85.6,
    responseTimeReduction: 67,
    avgResponseTime: 2.3,
    avgModerationTime: 20,
    contactResponseRate: 96.1,
  };

  const comparisonData = [
    {
      algorithm: 'Classical Dijkstra',
      time: 100, // baseline
      safety: 5.5,
      complexity: 'O((m+n) log n)',
      color: 'bg-gray-500'
    },
    {
      algorithm: 'Enhanced SSSP (Soft Heap)',
      time: 56.5, // 1.77x faster
      safety: 7.0,
      complexity: 'O(m + n log n / log log n)',
      color: 'bg-primary'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Algorithm Performance Analysis</h2>
        <p className="text-muted-foreground">
          Experimental results on Chennai Metropolitan Network
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-600">1.77×</span>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Speedup over Dijkstra
                  </p>
                </div>
                <Zap className="h-10 w-10 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-blue-500/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">26.6%</span>
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Safety Score Improvement
                  </p>
                </div>
                <Shield className="h-10 w-10 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-purple-600">2.3s</span>
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    95th Percentile Response
                  </p>
                </div>
                <Clock className="h-10 w-10 text-purple-500/30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-orange-500/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-orange-600">85.6%</span>
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Report Verification Rate
                  </p>
                </div>
                <Award className="h-10 w-10 text-orange-500/30" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Algorithm Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Comparison</CardTitle>
          <CardDescription>
            Performance comparison between classical and enhanced SSSP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {comparisonData.map((algo, index) => (
              <motion.div
                key={algo.algorithm}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{algo.algorithm}</h4>
                    <p className="text-sm text-muted-foreground">{algo.complexity}</p>
                  </div>
                  {index === 1 && (
                    <Badge className="bg-green-500">✨ Current Implementation</Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Execution Time */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Execution Time</span>
                      <span className="text-sm font-semibold">{algo.time}ms</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${algo.time}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.7 }}
                        className={`h-full ${algo.color}`}
                      />
                    </div>
                  </div>

                  {/* Safety Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Safety Score</span>
                      <span className="text-sm font-semibold">{algo.safety}/10</span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(algo.safety / 10) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.7 }}
                        className={`h-full ${algo.color}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Response Time Reduction</span>
                <span className="font-semibold text-green-600">67% ↓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Contact Response Rate</span>
                <span className="font-semibold text-green-600">96.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crowdsourced Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verification Rate</span>
                <span className="font-semibold text-blue-600">85.6%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg. Moderation Time</span>
                <span className="font-semibold text-blue-600">20 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Query Response Time</span>
                <span className="font-semibold text-purple-600">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Update Latency</span>
                <span className="font-semibold text-purple-600">4.2s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Findings */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Key Research Findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Enhanced SSSP achieves <strong>1.77× speedup</strong> over classical Dijkstra while improving safety by <strong>26.6%</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Crowdsourced hazard reporting achieves <strong>85.6% verification rate</strong> with <strong>20-minute avg. moderation time</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Emergency SOS features reduce response time by <strong>67%</strong> with <strong>96.1% contact response rate</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>System maintains <strong>2.3s 95th percentile</strong> response time suitable for real-time deployment</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
