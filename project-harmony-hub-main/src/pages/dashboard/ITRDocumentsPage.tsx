import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, FolderOpen, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ITRDocument {
  id: string;
  enrollmentNumber: string;
  name: string;
  groupNumber: string;
  documentType: 'offer_letter' | 'itr_report';
  fileName: string;
  status: 'not_submitted' | 'pending' | 'verified' | 'needs_correction';
  uploadedAt: string;
}



interface ITRDocumentsPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRDocumentsPage({ role }: ITRDocumentsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showDocs, setShowDocs] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'needs_correction': return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      case 'pending': return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Documents</h1>
          <p className="text-muted-foreground">Manage ITR related documents - Offer Letter & ITR Report</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter</CardTitle>
          </CardHeader>
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
              <Button className="btn-info" onClick={() => setShowDocs(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showDocs && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />ITR Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No ITR documents found for the selected filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
