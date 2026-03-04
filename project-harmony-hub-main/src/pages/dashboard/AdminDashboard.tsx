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
  TrendingUp,
  Eye,
  Loader2,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalStudents: number;
  totalGroups: number;
  totalAbstracts: number;
  totalDocuments: number;
}

export default function AdminDashboard() {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleViewData = async () => {
    if (!academicYear || !department) {
      toast({ title: 'Missing Filters', description: 'Please select both academic year and department.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const [studentsRes, groupsRes, abstractsRes, documentsRes] = await Promise.all([
        apiGet<{ success: boolean; total: number }>(`/students?academicYear=${academicYear}&department=${department}&limit=1`),
        apiGet<{ success: boolean; count: number }>(`/groups?academicYear=${academicYear}&department=${department}`),
        apiGet<{ success: boolean; count: number }>(`/abstracts?academicYear=${academicYear}&department=${department}`),
        apiGet<{ success: boolean; count: number }>(`/documents?academicYear=${academicYear}&department=${department}`),
      ]);

      setStats({
        totalStudents: studentsRes.total || 0,
        totalGroups: groupsRes.count || 0,
        totalAbstracts: abstractsRes.count || 0,
        totalDocuments: documentsRes.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: <Users className="h-6 w-6" />, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Groups', value: stats.totalGroups, icon: <FolderOpen className="h-6 w-6" />, color: 'text-green-500 bg-green-500/10' },
    { label: 'Total Abstracts', value: stats.totalAbstracts, icon: <FileText className="h-6 w-6" />, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Total Documents', value: stats.totalDocuments, icon: <Award className="h-6 w-6" />, color: 'text-orange-500 bg-orange-500/10' },
  ] : [];

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

              <Button className="btn-info" onClick={handleViewData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                View Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
          </div>
        )}

        {!loading && stats && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !stats && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-4">
                Select an academic year and department above, then click "View Data" to see statistics.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest submissions and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to show.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
