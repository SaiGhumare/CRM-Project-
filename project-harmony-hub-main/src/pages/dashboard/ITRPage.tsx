import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS, DocumentStatus } from '@/types';
import { 
  Eye, 
  FileText, 
  CheckCircle, 
  Clock, 
  Download,
  Briefcase,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend types
interface ITRRecord {
  _id: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  dailyDetails: { date: string; description: string; hours: number }[];
  studentId?: {
    _id: string;
    name: string;
    enrollmentNumber?: string;
    rollNumber?: string;
    academicYear?: string;
  };
  coordinatorId?: {
    _id: string;
    name: string;
  };
}

interface ITRPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRPage({ role }: ITRPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);
  const { toast } = useToast();

  const [records, setRecords] = useState<ITRRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchITR = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);

      const data = await apiGet<{
        success: boolean;
        count: number;
        data: ITRRecord[];
      }>(`/itr?${params.toString()}`);

      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ITR:', error);
      toast({ title: 'Error', description: 'Failed to load ITR records.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch triggered directly by handleView
  }, []);

  const handleView = () => {
    if (academicYear && department) {
      setShowDocuments(true);
      fetchITR();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'needs_correction':
        return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      default:
        return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Industrial Training (ITR)</h1>
          <p className="text-muted-foreground">Review ITR reports and records</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter ITR Records</CardTitle>
            <CardDescription>Select academic year and department to view ITR records</CardDescription>
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

              <Button className="btn-info" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ITR Records List */}
        {showDocuments && (
          loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  ITR Records - {academicYear} ({department})
                </CardTitle>
                <CardDescription>
                  {records.length} ITR records found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No ITR records found for this academic year.</p>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div 
                        key={record._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{record.studentId?.name || 'Unknown Student'}</p>
                            <p className="text-sm text-muted-foreground">
                              Roll: {record.studentId?.rollNumber || '-'}
                            </p>
                            <p className="text-sm text-primary">
                              Company: {record.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.startDate ? new Date(record.startDate).toLocaleDateString() : ''} — {record.endDate ? new Date(record.endDate).toLocaleDateString() : 'Ongoing'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Daily entries: {record.dailyDetails?.length || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status)}
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {record.status === 'pending' && (
                            <Button size="sm" className="btn-success">
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
