'use client';

import { useState, useEffect } from 'react';
import { JobApplication, Contact, Reminder, CompanyResearch } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar, MapPin, DollarSign, ExternalLink, Save } from 'lucide-react';
import { ContactsList } from './contacts-list';
import { RemindersList } from './reminders-list';

interface ApplicationDetailsProps {
  application: JobApplication | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500',
  screening: 'bg-yellow-500',
  interview: 'bg-purple-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500',
  accepted: 'bg-emerald-600',
};

export function ApplicationDetails({ application, open, onClose, onUpdate }: ApplicationDetailsProps) {
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application?.id) {
      loadResearch();
    }
  }, [application?.id]);

  const loadResearch = async () => {
    if (!application) return;

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data, error } = await supabase
        .from('company_research')
        .select('*')
        .eq('application_id', application.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setResearch(data);
    } catch (error) {
      console.error('Error loading research:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResearch = async () => {
    if (!application) return;

    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const researchData = {
        user_id: session.session.user.id,
        application_id: application.id,
        company_culture: research?.company_culture || '',
        tech_stack: research?.tech_stack || '',
        interview_prep: research?.interview_prep || '',
        pros: research?.pros || '',
        cons: research?.cons || '',
        additional_notes: research?.additional_notes || '',
      };

      if (research?.id) {
        const { error } = await supabase
          .from('company_research')
          .update({ ...researchData, updated_at: new Date().toISOString() })
          .eq('id', research.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('company_research')
          .insert([researchData])
          .select()
          .single();
        if (error) throw error;
        setResearch(data);
      }
    } catch (error) {
      console.error('Error saving research:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateResearch = (field: keyof CompanyResearch, value: string) => {
    setResearch((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{application.position_title}</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-lg font-medium">{application.company_name}</span>
            <Badge className={statusColors[application.status]}>
              {application.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{application.location}</span>
                </div>
              )}
              {application.salary_range && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{application.salary_range}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Applied: {format(new Date(application.application_date), 'MMM dd, yyyy')}</span>
              </div>
              {application.follow_up_date && (
                <div className="flex items-center text-sm text-amber-600 font-medium">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Follow-up: {format(new Date(application.follow_up_date), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {application.job_url && (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job Posting
                </a>
              )}
              {application.notes && (
                <div className="pt-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{application.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="research" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
            </TabsList>

            <TabsContent value="research" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Research</CardTitle>
                  <CardDescription>Track your research and interview preparation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_culture">Company Culture</Label>
                    <Textarea
                      id="company_culture"
                      value={research?.company_culture || ''}
                      onChange={(e) => updateResearch('company_culture', e.target.value)}
                      rows={3}
                      placeholder="Notes about company culture, values, work environment..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tech_stack">Tech Stack</Label>
                    <Textarea
                      id="tech_stack"
                      value={research?.tech_stack || ''}
                      onChange={(e) => updateResearch('tech_stack', e.target.value)}
                      rows={3}
                      placeholder="Technologies, tools, frameworks they use..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interview_prep">Interview Preparation</Label>
                    <Textarea
                      id="interview_prep"
                      value={research?.interview_prep || ''}
                      onChange={(e) => updateResearch('interview_prep', e.target.value)}
                      rows={3}
                      placeholder="Questions to ask, topics to prepare, interview process notes..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pros">Pros</Label>
                      <Textarea
                        id="pros"
                        value={research?.pros || ''}
                        onChange={(e) => updateResearch('pros', e.target.value)}
                        rows={3}
                        placeholder="Positive aspects of this opportunity..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cons">Cons</Label>
                      <Textarea
                        id="cons"
                        value={research?.cons || ''}
                        onChange={(e) => updateResearch('cons', e.target.value)}
                        rows={3}
                        placeholder="Concerns or drawbacks..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_notes">Additional Notes</Label>
                    <Textarea
                      id="additional_notes"
                      value={research?.additional_notes || ''}
                      onChange={(e) => updateResearch('additional_notes', e.target.value)}
                      rows={3}
                      placeholder="Any other relevant information..."
                    />
                  </div>

                  <Button onClick={saveResearch} disabled={saving} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Research'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsList applicationId={application.id} />
            </TabsContent>

            <TabsContent value="reminders">
              <RemindersList applicationId={application.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
