import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, CalendarCheck, CheckCircle } from 'lucide-react';

interface ITRDailyRecord {
  id: string;
  groupNumber: string;
  studentName: string;
  enrollmentNumber: string;
  technology: string;
  company: string;
  totalDays: number;
  presentDays: number;
  percentage: number;
  lastStatus: 'present' | 'absent';
}



interface ITRDailyDetailsPageProps {
  role?: 'admin' | 'mentor';
}

export default function ITRDailyDetailsPage({ role = 'mentor' }: ITRDailyDetailsPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Daily Details</h1>
          <p className="text-muted-foreground">View attendance status of students allotted to your groups</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowDetails(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Student Attendance Status</CardTitle>
              <CardDescription>Students with 75%+ are marked as completed. Visible to HOD, Project Guide, and ITR Coordinator.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No daily attendance records found for the selected filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
