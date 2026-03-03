import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, Award, CheckCircle, Clock } from 'lucide-react';

interface ITRCertificate {
  id: string;
  enrollmentNumber: string;
  name: string;
  groupNumber: string;
  fileName: string;
  status: 'not_submitted' | 'pending' | 'verified';
  uploadedAt: string;
}



interface ITRCertificatesPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRCertificatesPage({ role }: ITRCertificatesPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showCerts, setShowCerts] = useState(false);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Certificates</h1>
          <p className="text-muted-foreground">Manage ITR completion certificates</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowCerts(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showCerts && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />ITR Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No ITR certificates found for the selected filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
