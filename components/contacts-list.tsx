'use client';

import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Mail, Phone, Linkedin, Trash2, Edit } from 'lucide-react';

interface ContactsListProps {
  applicationId: string;
}

export function ContactsList({ applicationId }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    linkedin_url: '',
    relationship: '',
    notes: '',
  });

  useEffect(() => {
    loadContacts();
  }, [applicationId]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const contactData = {
        ...formData,
        user_id: session.session.user.id,
        application_id: applicationId,
      };

      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);
        if (error) throw error;
      }

      loadContacts();
      closeForm();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const openForm = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData(contact);
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        company: '',
        linkedin_url: '',
        relationship: '',
        notes: '',
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Network connections for this application</CardDescription>
            </div>
            <Button onClick={() => openForm()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet. Add your first networking contact!</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{contact.name}</h4>
                      {contact.position && contact.company && (
                        <p className="text-sm text-muted-foreground">
                          {contact.position} at {contact.company}
                        </p>
                      )}
                      {contact.relationship && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {contact.relationship}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openForm(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center text-sm text-blue-600 hover:underline">
                        <Mail className="h-3 w-3 mr-2" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.linkedin_url && (
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                        <Linkedin className="h-3 w-3 mr-2" />
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="text-sm text-muted-foreground pt-2">{contact.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact information' : 'Add a new networking contact'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={formData.relationship || ''}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g., Recruiter, Referral, Hiring Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
