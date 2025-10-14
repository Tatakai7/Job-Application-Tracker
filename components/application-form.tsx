'use client';

import { useState } from 'react';
import { JobApplication, ApplicationStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ApplicationFormProps {
  application?: JobApplication | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<JobApplication>) => Promise<void>;
}

export function ApplicationForm({ application, open, onClose, onSubmit }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>(
    application || {
      company_name: '',
      position_title: '',
      job_url: '',
      status: 'applied',
      location: '',
      salary_range: '',
      application_date: new Date().toISOString().split('T')[0],
      follow_up_date: '',
      priority: 'medium',
      notes: '',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof JobApplication, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? 'Edit Application' : 'Add New Application'}</DialogTitle>
          <DialogDescription>
            {application ? 'Update your job application details' : 'Add a new job application to track'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_title">Position Title *</Label>
              <Input
                id="position_title"
                value={formData.position_title}
                onChange={(e) => handleChange('position_title', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_url">Job Posting URL</Label>
            <Input
              id="job_url"
              type="url"
              value={formData.job_url || ''}
              onChange={(e) => handleChange('job_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as ApplicationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application_date">Application Date</Label>
              <Input
                id="application_date"
                type="date"
                value={formData.application_date}
                onChange={(e) => handleChange('application_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Remote, New York, NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range || ''}
                onChange={(e) => handleChange('salary_range', e.target.value)}
                placeholder="e.g., $80k - $100k"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date || ''}
              onChange={(e) => handleChange('follow_up_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              placeholder="Additional notes about this application..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : application ? 'Update' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
