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

const mockITRDocs: ITRDocument[] = [
  { id: '1', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', groupNumber: 'G1', documentType: 'offer_letter', fileName: 'offer_letter_purva.pdf', status: 'verified', uploadedAt: '2025-01-10' },
  { id: '2', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', groupNumber: 'G1', documentType: 'itr_report', fileName: 'itr_report_purva.pdf', status: 'pending', uploadedAt: '2025-01-15' },
  { id: '3', enrollmentNumber: '23611780234', name: 'Arpita Sanjay Galankar', groupNumber: 'G1', documentType: 'offer_letter', fileName: 'offer_letter_arpita.pdf', status: 'pending', uploadedAt: '2025-01-12' },
  { id: '4', enrollmentNumber: '23611780356', name: 'Sneha Patil', groupNumber: 'G2', documentType: 'offer_letter', fileName: 'offer_letter_sneha.pdf', status: 'not_submitted', uploadedAt: '' },
];

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
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockITRDocs.map(doc => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-mono">{doc.enrollmentNumber}</TableCell>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.groupNumber}</TableCell>
                        <TableCell>{doc.documentType === 'offer_letter' ? 'Offer Letter' : 'ITR Report'}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            {doc.status === 'pending' && (
                              <Button size="sm" className="btn-success">Verify</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
