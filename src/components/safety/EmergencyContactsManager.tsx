import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Phone, Mail, MessageSquare, Star, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { EmergencyContact } from '../../types/safety';

export const EmergencyContactsManager = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Mom',
      phone: '+91-9876543210',
      email: 'mom@example.com',
      relation: 'parent',
      priority: 1,
      notifyViaSMS: true,
      notifyViaEmail: true,
      notifyViaWhatsApp: true,
    },
    {
      id: '2',
      name: 'Dad',
      phone: '+91-9876543211',
      relation: 'parent',
      priority: 1,
      notifyViaSMS: true,
      notifyViaEmail: false,
      notifyViaWhatsApp: true,
    },
  ]);

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    email: '',
    relation: 'friend',
    priority: 2,
    notifyViaSMS: true,
    notifyViaEmail: false,
    notifyViaWhatsApp: true,
  });

  const getRelationEmoji = (relation: EmergencyContact['relation']) => {
    const emojiMap = {
      parent: '👨‍👩‍👦',
      guardian: '🛡️',
      friend: '🤝',
      police: '👮',
      family: '👪',
      spouse: '💑',
      sibling: '👫',
    };
    return emojiMap[relation] || '👤';
  };

  const getPriorityColor = (priority: number) => {
    return priority === 1 ? 'bg-red-500' : priority === 2 ? 'bg-orange-500' : 'bg-yellow-500';
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error(t('fill_required_fields') || 'Please fill all required fields');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      relation: newContact.relation as EmergencyContact['relation'],
      priority: newContact.priority as 1 | 2 | 3,
      notifyViaSMS: newContact.notifyViaSMS ?? true,
      notifyViaEmail: newContact.notifyViaEmail ?? false,
      notifyViaWhatsApp: newContact.notifyViaWhatsApp ?? true,
    };

    setContacts([...contacts, contact]);
    setNewContact({
      name: '',
      phone: '',
      email: '',
      relation: 'friend',
      priority: 2,
      notifyViaSMS: true,
      notifyViaEmail: false,
      notifyViaWhatsApp: true,
    });
    setIsAddingContact(false);
    toast.success(t('contact_added') || `${contact.name} added as emergency contact`);
  };

  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(contacts.filter(c => c.id !== id));
    toast.success(t('contact_removed') || `${contact?.name} removed from emergency contacts`);
  };

  const handleCallContact = (contact: EmergencyContact) => {
    window.location.href = `tel:${contact.phone}`;
    toast.info(t('calling') || `Calling ${contact.name}...`);
  };

  const handleTestAlert = () => {
    toast.success(
      t('test_alert_sent') || '✅ Test Alert Sent',
      {
        description: t('test_alert_desc') || `Test emergency notification sent to all ${contacts.length} contacts`,
        duration: 5000,
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">🆘</span>
            {t('emergency_contacts') || 'Emergency Contacts'}
          </CardTitle>
          <CardDescription>
            {t('emergency_contacts_desc') || 'People who will be notified in case of emergency'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => setIsAddingContact(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('add_contact') || 'Add Contact'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleTestAlert}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              {t('test_alert') || 'Test Alert'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar with Priority Badge */}
                    <div className="relative">
                      <Avatar className="h-16 w-16 bg-gradient-to-br from-red-400 to-orange-400">
                        <AvatarFallback className="text-2xl text-white">
                          {getRelationEmoji(contact.relation)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 ${getPriorityColor(contact.priority)} rounded-full w-6 h-6 flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{contact.priority}</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold truncate">{contact.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {contact.relation}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Notification Methods */}
                      <div className="flex gap-2 mt-3">
                        {contact.notifyViaSMS && (
                          <Badge variant="outline" className="text-xs">
                            📱 SMS
                          </Badge>
                        )}
                        {contact.notifyViaEmail && contact.email && (
                          <Badge variant="outline" className="text-xs">
                            ✉️ Email
                          </Badge>
                        )}
                        {contact.notifyViaWhatsApp && (
                          <Badge variant="outline" className="text-xs">
                            💬 WhatsApp
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCallContact(contact)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {contacts.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-muted-foreground text-center">
                {t('no_contacts') || 'No emergency contacts added yet'}
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsAddingContact(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('add_first_contact') || 'Add First Contact'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Plus className="h-6 w-6" />
              {t('add_emergency_contact') || 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('name') || 'Name'} *</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone') || 'Phone Number'} *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91-XXXXXXXXXX"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email') || 'Email'} ({t('optional') || 'Optional'})</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
            </div>

            {/* Relation */}
            <div className="space-y-2">
              <Label>{t('relation') || 'Relation'} *</Label>
              <Select
                value={newContact.relation}
                onValueChange={(value) => setNewContact({ ...newContact, relation: value as EmergencyContact['relation'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">👨‍👩‍👦 Parent</SelectItem>
                  <SelectItem value="guardian">🛡️ Guardian</SelectItem>
                  <SelectItem value="spouse">💑 Spouse</SelectItem>
                  <SelectItem value="sibling">👫 Sibling</SelectItem>
                  <SelectItem value="family">👪 Family Member</SelectItem>
                  <SelectItem value="friend">🤝 Friend</SelectItem>
                  <SelectItem value="police">👮 Police</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>{t('priority') || 'Priority'}</Label>
              <Select
                value={newContact.priority?.toString()}
                onValueChange={(value) => setNewContact({ ...newContact, priority: parseInt(value) as 1 | 2 | 3 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">⭐⭐⭐ Highest (1)</SelectItem>
                  <SelectItem value="2">⭐⭐ Medium (2)</SelectItem>
                  <SelectItem value="3">⭐ Low (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification Methods */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Label className="text-base font-semibold">
                {t('notification_methods') || 'Notification Methods'}
              </Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms" className="flex items-center gap-2">
                  <span className="text-lg">📱</span> SMS
                </Label>
                <Switch
                  id="sms"
                  checked={newContact.notifyViaSMS}
                  onCheckedChange={(checked) => setNewContact({ ...newContact, notifyViaSMS: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-notify" className="flex items-center gap-2">
                  <span className="text-lg">✉️</span> Email
                </Label>
                <Switch
                  id="email-notify"
                  checked={newContact.notifyViaEmail}
                  onCheckedChange={(checked) => setNewContact({ ...newContact, notifyViaEmail: checked })}
                  disabled={!newContact.email}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <span className="text-lg">💬</span> WhatsApp
                </Label>
                <Switch
                  id="whatsapp"
                  checked={newContact.notifyViaWhatsApp}
                  onCheckedChange={(checked) => setNewContact({ ...newContact, notifyViaWhatsApp: checked })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddingContact(false)}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleAddContact}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('add') || 'Add Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
