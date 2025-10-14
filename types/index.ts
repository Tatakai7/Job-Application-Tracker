export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'accepted';

export type Priority = 'low' | 'medium' | 'high';

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  position_title: string;
  job_url?: string | null;
  status: ApplicationStatus;
  location?: string | null;
  salary_range?: string | null;
  application_date: string;
  follow_up_date?: string | null;
  priority: Priority;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  application_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  company?: string | null;
  linkedin_url?: string | null;
  relationship?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  application_id?: string | null;
  title: string;
  description?: string | null;
  reminder_date: string;
  is_completed: boolean;
  created_at: string;
}

export interface CompanyResearch {
  id: string;
  user_id: string;
  application_id: string;
  company_culture?: string | null;
  tech_stack?: string | null;
  interview_prep?: string | null;
  pros?: string | null;
  cons?: string | null;
  additional_notes?: string | null;
  created_at: string;
  updated_at: string;
}
