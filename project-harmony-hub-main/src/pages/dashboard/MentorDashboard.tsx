import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Users, FileText, FolderOpen, Award, CheckCircle, Clock, AlertCircle, TrendingUp, Eye, Upload } from 'lucide-react';



export default function MentorDashboard() {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');

  return (
    <DashboardLayout role="mentor">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Mentor Dashboard</h1>
          <p className="text-muted-foreground">Guide students and review their submissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
            <CardDescription>Select academic year and department to view your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept.value} value={dept.value}>{dept.label} ({dept.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info"><Eye className="h-4 w-4 mr-2" />View Data</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center py-4">
              Select an academic year and department above, then click "View Data" to see your student statistics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-warning" />Pending Reviews</CardTitle>
            <CardDescription>Items awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No pending reviews at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
