import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Camera, MapPin, Send, X, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { HazardReport, HazardCategory } from '@/types/hazardTypes';
import { submitHazardReport } from '@/utils/apiService';

interface HazardPreset {
  id: string;
  label: string;
  category: HazardCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
}

export function HazardReportForm() {
  const presets: HazardPreset[] = [
    {
      id: 'general-safety',
      label: 'General Safety',
      category: 'safety_concern',
      severity: 'medium',
      title: 'Safety concern reported in commuter area',
      description: 'Observed suspicious behavior near a transit point. Requesting patrol visibility and verification.',
    },
    {
      id: 'traffic-accident',
      label: 'Traffic Accident',
      category: 'accident',
      severity: 'high',
      title: 'Road accident affecting movement',
      description: 'Accident reported near route corridor. Traffic is slow and route planning may need rerouting.',
    },
    {
      id: 'facility-lighting',
      label: 'Facility / Lighting',
      category: 'facility_issue',
      severity: 'medium',
      title: 'Street light / facility issue',
      description: 'Public safety infrastructure is not functioning. Area visibility is low and requires maintenance.',
    },
    {
      id: 'crime-alert',
      label: 'Crime Alert',
      category: 'crime',
      severity: 'critical',
      title: 'Potential crime activity reported',
      description: 'Possible criminal activity observed. Immediate verification and police attention requested.',
    },
  ];

  const defaultPreset = presets[0];

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPreset.id);
  
  const [formData, setFormData] = useState({
    category: defaultPreset.category,
    severity: defaultPreset.severity,
    title: defaultPreset.title,
    description: defaultPreset.description,
    isAnonymous: false,
  });

  const categories = [
    { value: 'obstacle', label: '🚧 Obstacle/Roadblock', icon: '🚧' },
    { value: 'safety_concern', label: '⚠️ Safety Concern', icon: '⚠️' },
    { value: 'crowd_update', label: '👥 Crowd Update', icon: '👥' },
    { value: 'facility_issue', label: '🔧 Facility Issue', icon: '🔧' },
    { value: 'accident', label: '🚗 Accident', icon: '🚗' },
    { value: 'crime', label: '🚨 Crime Alert', icon: '🚨' },
    { value: 'positive', label: '✅ Positive Report', icon: '✅' },
  ];

  const applyPreset = (presetId: string) => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setSelectedPreset(preset.id);
    setFormData((prev) => ({
      ...prev,
      category: preset.category,
      severity: preset.severity,
      title: preset.title,
      description: preset.description,
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Please enable location first');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const storedReporterId = Number(localStorage.getItem('reporterUserId'));
    const reporterId = Number.isFinite(storedReporterId) && storedReporterId > 0 ? storedReporterId : 1;

    const response = await submitHazardReport({
      user_id: reporterId,
      latitude: location.lat,
      longitude: location.lng,
      category: formData.category,
      severity: formData.severity,
      title: formData.title.trim(),
      description: formData.description.trim(),
      is_anonymous: formData.isAnonymous,
    });

    if (response.error) {
      setSubmitError(response.error);
      setIsSubmitting(false);
      return;
    }

    const report: Partial<HazardReport> = {
      ...formData,
      location,
      timestamp: new Date(),
      status: 'pending',
      upvotes: 0,
      downvotes: 0,
    };

    console.log('Submitting hazard report:', report);

    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFormData({
        category: defaultPreset.category,
        severity: defaultPreset.severity,
        title: defaultPreset.title,
        description: defaultPreset.description,
        isAnonymous: false,
      });
      setSelectedPreset(defaultPreset.id);
      setSubmitError(null);
      setLocation(null);
    }, 3000);
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-28 right-6 sm:bottom-6 sm:right-28 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-4 border-white"
        >
          <AlertTriangle className="h-8 w-8" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-2">
        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Report Submitted! 🎉</h3>
            <p className="text-lg text-muted-foreground">
              Your report is being reviewed by our admin team.
              <br />
              Thank you for helping keep the community safe!
            </p>
          </motion.div>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                    Report Hazard
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Help keep the community safe by reporting safety concerns
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {presets.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        variant={selectedPreset === preset.id ? 'default' : 'outline'}
                        className="h-auto justify-start px-3 py-2 text-left text-xs"
                        onClick={() => applyPreset(preset.id)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Button
                    type="button"
                    variant={location ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={handleGetLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {location 
                      ? `📍 Location Captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                      : 'Click to Capture Current Location'
                    }
                  </Button>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Hazard Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as HazardCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div className="space-y-3">
                  <Label>Severity Level *</Label>
                  <RadioGroup
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="cursor-pointer flex-1">
                        <Badge variant="secondary">Low</Badge>
                        <span className="text-sm text-muted-foreground ml-2">Minor issue</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="cursor-pointer flex-1">
                        <Badge className="bg-yellow-500">Medium</Badge>
                        <span className="text-sm text-muted-foreground ml-2">Moderate</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="cursor-pointer flex-1">
                        <Badge className="bg-orange-500">High</Badge>
                        <span className="text-sm text-muted-foreground ml-2">Serious concern</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="critical" id="critical" />
                      <Label htmlFor="critical" className="cursor-pointer flex-1">
                        <Badge className="bg-red-500">Critical</Badge>
                        <span className="text-sm text-muted-foreground ml-2">Urgent</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description (e.g., 'Broken street light near bus stop')"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about the hazard..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/500
                  </p>
                </div>

                {/* Photo Upload (Optional) */}
                <div className="space-y-2">
                  <Label>Add Photos (Optional)</Label>
                  <Button type="button" variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo Evidence
                  </Button>
                </div>

                {/* Anonymous Reporting */}
                <div className="flex items-center space-x-2 p-4 bg-secondary/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="anonymous" className="cursor-pointer text-sm">
                    Submit anonymously (your identity will be hidden)
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !location}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    {isSubmitting ? (
                      <>⏳ Submitting...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>

                {submitError && (
                  <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {submitError}
                  </p>
                )}
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </motion.div>
  );
}
