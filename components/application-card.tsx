'use client';

import { JobApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, MoreVertical, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ApplicationCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  onViewDetails: (application: JobApplication) => void;
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500',
  screening: 'bg-yellow-500',
  interview: 'bg-purple-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500',
  accepted: 'bg-emerald-600',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-orange-500',
  high: 'bg-red-600',
};

export function ApplicationCard({ application, onEdit, onDelete, onViewDetails }: ApplicationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{application.position_title}</CardTitle>
            <CardDescription className="text-base font-medium">{application.company_name}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(application)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(application)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(application.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 pt-2">
          <Badge className={statusColors[application.status]}>
            {application.status}
          </Badge>
          <Badge variant="outline" className={`${priorityColors[application.priority]} text-white border-0`}>
            {application.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {application.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {application.location}
          </div>
        )}
        {application.salary_range && (
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            {application.salary_range}
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          Applied: {format(new Date(application.application_date), 'MMM dd, yyyy')}
        </div>
        {application.follow_up_date && (
          <div className="flex items-center text-sm text-amber-600 font-medium">
            <Calendar className="h-4 w-4 mr-2" />
            Follow-up: {format(new Date(application.follow_up_date), 'MMM dd, yyyy')}
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
      </CardContent>
    </Card>
  );
}
