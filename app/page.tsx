'use client';

import { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { ApplicationCard } from '@/components/application-card';
import { ApplicationForm } from '@/components/application-form';
import { ApplicationDetails } from '@/components/application-details';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Briefcase, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const checkAuth = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      setUserId(session.session.user.id);
      loadApplications(session.session.user.id);
    } else {
      signInAnonymously();
    }
  };

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: `user-${Date.now()}@demo.com`,
      password: `demo-password-${Date.now()}`,
    });

    if (!error && data.user) {
      setUserId(data.user.id);
      loadApplications(data.user.id);
    }
  };

  const loadApplications = async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.position_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleAddEdit = async (data: Partial<JobApplication>) => {
    if (!userId) return;

    try {
      if (editingApp) {
        const updateData: any = { ...data, updated_at: new Date().toISOString() };
        const { error } = await supabase
          .from('job_applications')
          .update(updateData)
          .eq('id', editingApp.id);
        if (error) throw error;
      } else {
        const insertData: any = { ...data, user_id: userId };
        const { error } = await supabase
          .from('job_applications')
          .insert([insertData]);
        if (error) throw error;
      }

      loadApplications(userId);
      setShowForm(false);
      setEditingApp(null);
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      if (userId) loadApplications(userId);
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const openForm = (app?: JobApplication) => {
    setEditingApp(app || null);
    setShowForm(true);
  };

  const openDetails = (app: JobApplication) => {
    setSelectedApp(app);
    setShowDetails(true);
  };

  const getStatusCount = (status: ApplicationStatus) => {
    return applications.filter((app) => app.status === status).length;
  };

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: Briefcase },
    { label: 'Active (Interview)', value: getStatusCount('interview'), icon: TrendingUp },
    { label: 'Offers', value: getStatusCount('offer'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Application Tracker</h1>
          <p className="text-slate-600">Organize and manage your job search effectively</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by company, position, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => openForm()} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Briefcase className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchTerm || statusFilter !== 'all'
                  ? 'No applications found'
                  : 'No applications yet'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start tracking your job applications by adding your first one'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => openForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Application
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onEdit={openForm}
                onDelete={handleDelete}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}
      </div>

      <ApplicationForm
        application={editingApp}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingApp(null);
        }}
        onSubmit={handleAddEdit}
      />

      <ApplicationDetails
        application={selectedApp}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedApp(null);
        }}
        onUpdate={() => userId && loadApplications(userId)}
      />
    </div>
  );
}
