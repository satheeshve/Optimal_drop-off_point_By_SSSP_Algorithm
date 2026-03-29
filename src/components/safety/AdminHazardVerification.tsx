import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, MapPin, User, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { getPendingHazards, verifyHazardReport } from '@/utils/apiService';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'all';

interface HazardModerationRow {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
  created_at: string;
  priority_score: number;
  upvotes: number;
  downvotes: number;
  admin_notes?: string;
}

const severityColorMap: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const categoryIconMap: Record<string, string> = {
  obstacle: '🚧',
  safety_concern: '⚠️',
  crowd_update: '👥',
  facility_issue: '🔧',
  accident: '🚗',
  crime: '🚨',
  positive: '✅',
};

export function AdminHazardVerification() {
  const [reports, setReports] = useState<HazardModerationRow[]>([]);
  const [selectedReport, setSelectedReport] = useState<HazardModerationRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<VerificationStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminId = useMemo(() => {
    const fromSession = Number(sessionStorage.getItem('adminUserId'));
    return Number.isFinite(fromSession) && fromSession > 0 ? fromSession : 1;
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await getPendingHazards(adminId, 100);
    if (response.error) {
      setError(response.error);
      setReports([]);
      setLoading(false);
      return;
    }

    const data = Array.isArray(response.data) ? response.data : [];
    setReports(data as HazardModerationRow[]);
    setLoading(false);
  }, [adminId]);

  useEffect(() => {
    void loadReports();

    const timer = window.setInterval(() => {
      void loadReports();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadReports]);

  const updateStatus = async (action: 'verify' | 'reject' | 'escalate', reportArg?: HazardModerationRow) => {
    const targetReport = reportArg ?? selectedReport;
    if (!targetReport) {
      return;
    }

    const response = await verifyHazardReport(adminId, targetReport.id, action, adminNotes.trim() || undefined);
    if (response.error) {
      setError(response.error);
      return;
    }

    setSelectedReport(null);
    setAdminNotes('');
    await loadReports();
  };

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') {
      return true;
    }
    return report.status === filter;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified').length;
  const rejectedCount = reports.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue Health</p>
                <p className="text-3xl font-bold">{reports.length}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Hazard Reports Moderation
              </CardTitle>
              <CardDescription>Live queue from backend verification workflow</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void loadReports()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as VerificationStatus)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="verified">Verified ({verifiedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
              <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
            </TabsList>

            {error && (
              <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading hazard reports...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports in this category</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl">{categoryIconMap[report.category] || '📍'}</span>
                            <h4 className="font-semibold text-lg">{report.title}</h4>
                            <Badge className={severityColorMap[report.severity] || 'bg-gray-500'}>{report.severity}</Badge>
                            <Badge variant="outline">Priority {report.priority_score.toFixed(2)}</Badge>
                            {report.status !== 'pending' && (
                              <Badge variant={report.status === 'verified' ? 'default' : 'destructive'}>{report.status}</Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User {report.user_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(report.created_at).toLocaleString()}
                            </span>
                            <span>
                              👍 {report.upvotes} | 👎 {report.downvotes}
                            </span>
                          </div>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                void updateStatus('verify', report);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                void updateStatus('reject', report);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {selectedReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedReport(null)}
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-3xl">{categoryIconMap[selectedReport.category] || '📍'}</span>
                    {selectedReport.title}
                  </CardTitle>
                  <CardDescription className="mt-2">Report ID: {selectedReport.id}</CardDescription>
                </div>
                <Badge className={severityColorMap[selectedReport.severity] || 'bg-gray-500'}>{selectedReport.severity}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <Textarea
                  placeholder="Add notes for verification workflow..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => void updateStatus('verify')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Report
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => void updateStatus('reject')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Report
                </Button>
                <Button variant="outline" onClick={() => void updateStatus('escalate')}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
