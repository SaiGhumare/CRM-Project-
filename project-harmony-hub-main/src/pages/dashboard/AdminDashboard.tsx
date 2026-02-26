import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { 
  Users, 
  FileText, 
  FolderOpen, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';

const stats = [
  { title: 'Total Students', value: '156', icon: Users, color: 'text-info' },
  { title: 'Total Groups', value: '42', icon: Users, color: 'text-primary' },
  { title: 'Pending Abstracts', value: '12', icon: FileText, color: 'text-warning' },
  { title: 'Documents Submitted', value: '89', icon: FolderOpen, color: 'text-success' },
  { title: 'Certificates', value: '34', icon: Award, color: 'text-primary' },
  { title: 'Approved', value: '67', icon: CheckCircle, color: 'text-success' },
];

const recentActivities = [
  { type: 'abstract', message: 'G1 - Purva Santosh Deshmane submitted abstract (95% completion)', time: '2 hours ago', status: 'pending' },
  { type: 'document', message: 'G1 - Purva Santosh Deshmane uploaded Synopsis', time: '3 hours ago', status: 'pending' },
  { type: 'approval', message: 'Abstract approved for G2 - Arpita Sanjay Galankar (5% completion)', time: '5 hours ago', status: 'approved' },
  { type: 'document', message: 'G1 - Purva Santosh Deshmane uploaded Project Report', time: '1 day ago', status: 'pending' },
  { type: 'rejection', message: 'Abstract rejected for G3 - Sneha Patil', time: '1 day ago', status: 'rejected' },
];

export default function AdminDashboard() {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Manage students, abstracts, and documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
            <CardDescription>Select academic year and department to view data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label} ({dept.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-info">
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest submissions and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
