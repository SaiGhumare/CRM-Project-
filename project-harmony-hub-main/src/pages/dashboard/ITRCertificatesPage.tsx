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

const mockITRCerts: ITRCertificate[] = [
  { id: '1', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', groupNumber: 'G1', fileName: 'itr_cert_purva.pdf', status: 'verified', uploadedAt: '2025-01-20' },
  { id: '2', enrollmentNumber: '23611780234', name: 'Arpita Sanjay Galankar', groupNumber: 'G1', fileName: 'itr_cert_arpita.pdf', status: 'pending', uploadedAt: '2025-01-22' },
  { id: '3', enrollmentNumber: '23611780356', name: 'Sneha Patil', groupNumber: 'G2', fileName: '', status: 'not_submitted', uploadedAt: '' },
];

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
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockITRCerts.map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono">{cert.enrollmentNumber}</TableCell>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell>{cert.groupNumber}</TableCell>
                        <TableCell>
                          {cert.status === 'verified' ? <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge> :
                           cert.status === 'pending' ? <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge> :
                           <Badge variant="secondary">Not Submitted</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {cert.status !== 'not_submitted' && (
                              <>
                                <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                              </>
                            )}
                            {cert.status === 'pending' && <Button size="sm" className="btn-success">Verify</Button>}
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
