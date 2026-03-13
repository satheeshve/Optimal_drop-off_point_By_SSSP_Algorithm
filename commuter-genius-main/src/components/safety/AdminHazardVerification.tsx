import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, MapPin, User, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { HazardReport } from '@/types/hazardTypes';

// Sample data for demonstration
const SAMPLE_REPORTS: HazardReport[] = [
  {
    id: 'rep1',
    userId: 'user123',
    location: { lat: 13.0827, lng: 80.2707, address: 'Near Chennai Central Metro Station' },
    category: 'safety_concern',
    severity: 'high',
    title: 'Suspicious activity reported',
    description: 'Group of individuals loitering near the metro exit, making commuters uncomfortable',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'pending',
    isAnonymous: false,
    upvotes: 12,
    downvotes: 1,
  },
  {
    id: 'rep2',
    userId: 'user456',
    location: { lat: 13.0703, lng: 80.2034, address: 'Koyambedu CMBT Bus Stand' },
    category: 'facility_issue',
    severity: 'medium',
    title: 'Broken street lights',
    description: 'Multiple street lights not working near Platform 5, area is very dark after sunset',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'pending',
    isAnonymous: false,
    upvotes: 8,
    downvotes: 0,
  },
  {
    id: 'rep3',
    userId: 'user789',
    location: { lat: 13.1147, lng: 79.9864, address: 'Avadi Bus Stop' },
    category: 'obstacle',
    severity: 'critical',
    title: 'Fallen tree blocking road',
    description: 'Large tree fell across the main road, traffic completely blocked',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'pending',
    isAnonymous: true,
    upvotes: 25,
    downvotes: 0,
  },
];

export function AdminHazardVerification() {
  const [reports, setReports] = useState<HazardReport[]>(SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  const handleVerify = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'verified', adminNotes, verifiedAt: new Date(), verifiedBy: 'Admin' }
        : report
    ));
    setSelectedReport(null);
    setAdminNotes('');
  };

  const handleReject = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'rejected', adminNotes }
        : report
    ));
    setSelectedReport(null);
    setAdminNotes('');
  };

  const handleEscalate = (reportId: string) => {
    alert(`Report ${reportId} escalated to authorities`);
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, adminNotes: adminNotes + ' [ESCALATED TO AUTHORITIES]' }
        : report
    ));
  };

  const filteredReports = reports.filter(report => 
    filter === 'all' ? true : report.status === filter
  );

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const verifiedCount = reports.filter(r => r.status === 'verified').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'obstacle': return '🚧';
      case 'safety_concern': return '⚠️';
      case 'crowd_update': return '👥';
      case 'facility_issue': return '🔧';
      case 'accident': return '🚗';
      case 'crime': return '🚨';
      case 'positive': return '✅';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
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
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-3xl font-bold">18m</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Hazard Reports Moderation
          </CardTitle>
          <CardDescription>Review and verify crowdsourced safety reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({verifiedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({reports.length})
              </TabsTrigger>
            </TabsList>

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
                          <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                          <h4 className="font-semibold text-lg">{report.title}</h4>
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                          {report.status !== 'pending' && (
                            <Badge variant={report.status === 'verified' ? 'default' : 'destructive'}>
                              {report.status}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.location.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {report.isAnonymous ? 'Anonymous' : report.userId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round((Date.now() - report.timestamp.getTime()) / (1000 * 60))} mins ago
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
                              handleVerify(report.id);
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
                              handleReject(report.id);
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
          </Tabs>
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedReport(null)}
        >
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-3xl">{getCategoryIcon(selectedReport.category)}</span>
                    {selectedReport.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Report ID: {selectedReport.id}
                  </CardDescription>
                </div>
                <Badge className={getSeverityColor(selectedReport.severity)}>
                  {selectedReport.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm">{selectedReport.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.location.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Reported By</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.isAnonymous ? 'Anonymous User' : selectedReport.userId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedReport.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Community Feedback</h4>
                <div className="flex gap-4">
                  <Badge variant="outline">👍 {selectedReport.upvotes} Upvotes</Badge>
                  <Badge variant="outline">👎 {selectedReport.downvotes} Downvotes</Badge>
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Admin Notes</h4>
                    <Textarea
                      placeholder="Add notes about this report..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerify(selectedReport.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Report
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(selectedReport.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Report
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEscalate(selectedReport.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate
                    </Button>
                  </div>
                </div>
              )}

              {selectedReport.adminNotes && (
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <p className="text-sm">{selectedReport.adminNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
