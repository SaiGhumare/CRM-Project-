import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Users, FileText, FolderOpen, Award, CheckCircle, Clock, AlertCircle, TrendingUp, Eye, Upload } from 'lucide-react';

const stats = [
  { title: 'My Students', value: '38', icon: Users, color: 'text-info' },
  { title: 'My Groups', value: '12', icon: Users, color: 'text-primary' },
  { title: 'Pending Reviews', value: '8', icon: FileText, color: 'text-warning' },
  { title: 'Documents to Review', value: '15', icon: FolderOpen, color: 'text-success' },
];

const pendingTasks = [
  { type: 'abstract', group: 'G1', title: 'Smart Campus Management', time: '2 hours ago' },
  { type: 'abstract', group: 'G2', title: 'AI-based Attendance System', time: '5 hours ago' },
  { type: 'document', group: 'G3', title: 'Synopsis Review', time: '1 day ago' },
  { type: 'document', group: 'G4', title: 'Project Report Review', time: '1 day ago' },
];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-warning" />Pending Reviews</CardTitle>
            <CardDescription>Items awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  {task.type === 'abstract' ? <FileText className="h-5 w-5 text-info" /> : <FolderOpen className="h-5 w-5 text-primary" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Group: {task.group} • {task.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-success">Approve</Button>
                    <Button size="sm" variant="destructive">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
