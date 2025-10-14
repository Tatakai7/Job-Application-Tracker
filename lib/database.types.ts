export type Database = {
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          position_title: string;
          job_url: string | null;
          status: string;
          location: string | null;
          salary_range: string | null;
          application_date: string;
          follow_up_date: string | null;
          priority: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          position_title: string;
          job_url?: string | null;
          status?: string;
          location?: string | null;
          salary_range?: string | null;
          application_date?: string;
          follow_up_date?: string | null;
          priority?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          position_title?: string;
          job_url?: string | null;
          status?: string;
          location?: string | null;
          salary_range?: string | null;
          application_date?: string;
          follow_up_date?: string | null;
          priority?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          position: string | null;
          company: string | null;
          linkedin_url: string | null;
          relationship: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
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
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          position?: string | null;
          company?: string | null;
          linkedin_url?: string | null;
          relationship?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          title: string;
          description: string | null;
          reminder_date: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          title: string;
          description?: string | null;
          reminder_date: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          title?: string;
          description?: string | null;
          reminder_date?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      company_research: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          company_culture: string | null;
          tech_stack: string | null;
          interview_prep: string | null;
          pros: string | null;
          cons: string | null;
          additional_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          company_culture?: string | null;
          tech_stack?: string | null;
          interview_prep?: string | null;
          pros?: string | null;
          cons?: string | null;
          additional_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          company_culture?: string | null;
          tech_stack?: string | null;
          interview_prep?: string | null;
          pros?: string | null;
          cons?: string | null;
          additional_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
