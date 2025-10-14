'use client';

import { useState, useEffect } from 'react';
import { Reminder } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface RemindersListProps {
  applicationId: string;
}

export function RemindersList({ applicationId }: RemindersListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    reminder_date: '',
  });

  useEffect(() => {
    loadReminders();
  }, [applicationId]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('application_id', applicationId)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const reminderData = {
        ...formData,
        user_id: session.session.user.id,
        application_id: applicationId,
      };

      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert([reminderData]);
        if (error) throw error;
      }

      loadReminders();
      closeForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  const toggleComplete = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !reminder.is_completed })
        .eq('id', reminder.id);
      if (error) throw error;
      loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const openForm = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        title: reminder.title,
        description: reminder.description,
        reminder_date: reminder.reminder_date.split('T')[0],
      });
    } else {
      setEditingReminder(null);
      setFormData({
        title: '',
        description: '',
        reminder_date: '',
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReminder(null);
  };

  const isPast = (date: string) => new Date(date) < new Date();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reminders & Deadlines</CardTitle>
              <CardDescription>Track follow-ups and important dates</CardDescription>
            </div>
            <Button onClick={() => openForm()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders set. Add your first reminder!</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`border rounded-lg p-4 ${reminder.is_completed ? 'bg-gray-50 opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={reminder.is_completed}
                      onCheckedChange={() => toggleComplete(reminder)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold ${reminder.is_completed ? 'line-through' : ''}`}>
                            {reminder.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {reminder.is_completed ? (
                              <span className="flex items-center text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            ) : (
                              <span className={`flex items-center text-xs ${isPast(reminder.reminder_date) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(reminder.reminder_date), 'MMM dd, yyyy')}
                                {isPast(reminder.reminder_date) && ' - Overdue'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openForm(reminder)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground mt-2">{reminder.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
            <DialogDescription>
              {editingReminder ? 'Update reminder details' : 'Create a new reminder or deadline'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Follow up with recruiter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_date">Date *</Label>
              <Input
                id="reminder_date"
                type="date"
                value={formData.reminder_date}
                onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional details about this reminder..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingReminder ? 'Update' : 'Add'} Reminder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
