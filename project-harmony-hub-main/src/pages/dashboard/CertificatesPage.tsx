import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Award, Download, Upload, CheckCircle, Clock } from 'lucide-react';

type CertificateFilterType = 'paper_presentation' | 'project_competition';

interface PaperPresentationRecord {
  id: string;
  serialNumber: string;
  enrollmentNumber: string;
  groupNumber: string;
  studentNames: string;
  projectTopic: string;
  projectGuide: string;
  paperTitle: string;
  volume: string;
  issueNo: string;
  issnNo: string;
  journalName: string;
  impactFactor: string;
  status: 'not_submitted' | 'pending' | 'verified';
  certificates: { name: string; uploaded: boolean }[];
}

interface ProjectCompetitionRecord {
  id: string;
  serialNumber: string;
  enrollmentNumber: string;
  groupNumber: string;
  studentNames: string;
  projectTopic: string;
  projectGuide: string;
  instituteName: string;
  level: 'State' | 'National';
  principalName: string;
  certificateStatus: 'Winner' | 'Runner Up' | '1st Runner Up' | '2nd Runner Up' | 'Participation';
  status: 'not_submitted' | 'pending' | 'verified';
  certificates: { name: string; uploaded: boolean }[];
}

const mockPaperRecords: PaperPresentationRecord[] = [
  { id: '1', serialNumber: '1', enrollmentNumber: '23611780192', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management', projectGuide: 'Prof. P. B. Datir', paperTitle: 'IoT Based Campus Management', volume: 'Vol. 12', issueNo: 'Issue 3', issnNo: '2456-7890', journalName: 'IJERT', impactFactor: '4.5', status: 'verified', certificates: [{ name: 'Certificate 1', uploaded: true }, { name: 'Certificate 2', uploaded: true }, { name: 'Certificate 3', uploaded: true }] },
  { id: '2', serialNumber: '2', enrollmentNumber: '23611780234', groupNumber: 'G2', studentNames: 'Sneha Patil, Rohan Gaikwad', projectTopic: 'AI Attendance System', projectGuide: 'Prof. S. K. Jadhav', paperTitle: 'AI Based Face Recognition', volume: 'Vol. 8', issueNo: 'Issue 1', issnNo: '1234-5678', journalName: 'IEEE Access', impactFactor: '3.8', status: 'pending', certificates: [{ name: 'Certificate 1', uploaded: true }, { name: 'Certificate 2', uploaded: false }, { name: 'Certificate 3', uploaded: false }] },
];

const mockCompetitionRecords: ProjectCompetitionRecord[] = [
  { id: '1', serialNumber: '1', enrollmentNumber: '23611780192', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management', projectGuide: 'Prof. P. B. Datir', instituteName: 'Sandip Foundation, Nashik', level: 'State', principalName: 'Dr. R. M. Patil', certificateStatus: 'Winner', status: 'verified', certificates: [{ name: 'Cert 1', uploaded: true }, { name: 'Cert 2', uploaded: true }, { name: 'Cert 3', uploaded: true }, { name: 'Cert 4', uploaded: true }] },
  { id: '2', serialNumber: '2', enrollmentNumber: '23611780234', groupNumber: 'G2', studentNames: 'Sneha Patil, Rohan Gaikwad', projectTopic: 'AI Attendance System', projectGuide: 'Prof. S. K. Jadhav', instituteName: 'MIT, Pune', level: 'National', principalName: 'Dr. S. T. More', certificateStatus: 'Participation', status: 'pending', certificates: [{ name: 'Cert 1', uploaded: true }, { name: 'Cert 2', uploaded: false }] },
];

interface CertificatesPageProps {
  role: 'admin' | 'mentor';
}

export default function CertificatesPage({ role }: CertificatesPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [certificateType, setCertificateType] = useState<CertificateFilterType>('paper_presentation');
  const [showCertificates, setShowCertificates] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending': return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificate Management</h1>
          <p className="text-muted-foreground">Manage student certificates - click on certificate type to view</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Certificates</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[250px]">
                <Label>Type of Certificate</Label>
                <Select value={certificateType} onValueChange={(v) => setCertificateType(v as CertificateFilterType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper_presentation">Paper Presentation (Published)</SelectItem>
                    <SelectItem value="project_competition">Project Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowCertificates(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showCertificates && certificateType === 'paper_presentation' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Paper Presentation (Published) — Minimum 3, Maximum 5 Certificates Required</CardTitle>
              <CardDescription>Click on certificate type to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]">S.No.</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>Paper Title</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Issue No.</TableHead>
                      <TableHead>ISSN No.</TableHead>
                      <TableHead>Journal</TableHead>
                      <TableHead>Impact Factor</TableHead>
                      <TableHead>Certificates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPaperRecords.map(rec => {
                      const uploadedCount = rec.certificates.filter(c => c.uploaded).length;
                      return (
                        <TableRow key={rec.id}>
                          <TableCell>{rec.serialNumber}</TableCell>
                          <TableCell className="font-mono">{rec.enrollmentNumber}</TableCell>
                          <TableCell>{rec.groupNumber}</TableCell>
                          <TableCell className="max-w-[120px] truncate">{rec.studentNames}</TableCell>
                          <TableCell className="max-w-[100px] truncate">{rec.projectTopic}</TableCell>
                          <TableCell>{rec.projectGuide}</TableCell>
                          <TableCell className="max-w-[100px] truncate">{rec.paperTitle}</TableCell>
                          <TableCell>{rec.volume}</TableCell>
                          <TableCell>{rec.issueNo}</TableCell>
                          <TableCell>{rec.issnNo}</TableCell>
                          <TableCell>{rec.journalName}</TableCell>
                          <TableCell>{rec.impactFactor}</TableCell>
                          <TableCell>
                            <Badge variant={uploadedCount >= 3 ? 'default' : 'secondary'} className={uploadedCount >= 3 ? 'bg-success text-success-foreground' : ''}>
                              {uploadedCount}/{rec.certificates.length} (min 3, max 5)
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(rec.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm"><Upload className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {showCertificates && certificateType === 'project_competition' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Project Competition - Minimum 2, At Least 4 Certificates</CardTitle>
              <CardDescription>Click on certificate type to view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50px]">S.No.</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>Institute</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Principal (Host)</TableHead>
                      <TableHead>Certificate Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCompetitionRecords.map(rec => (
                      <TableRow key={rec.id}>
                        <TableCell>{rec.serialNumber}</TableCell>
                        <TableCell className="font-mono">{rec.enrollmentNumber}</TableCell>
                        <TableCell>{rec.groupNumber}</TableCell>
                        <TableCell className="max-w-[120px] truncate">{rec.studentNames}</TableCell>
                        <TableCell className="max-w-[100px] truncate">{rec.projectTopic}</TableCell>
                        <TableCell>{rec.projectGuide}</TableCell>
                        <TableCell>{rec.instituteName}</TableCell>
                        <TableCell><Badge variant="outline">{rec.level}</Badge></TableCell>
                        <TableCell>{rec.principalName}</TableCell>
                        <TableCell>
                          <Badge className={rec.certificateStatus === 'Winner' ? 'bg-success text-success-foreground' : rec.certificateStatus === 'Participation' ? 'bg-info text-info-foreground' : 'bg-warning text-warning-foreground'}>
                            {rec.certificateStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(rec.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm"><Upload className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
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
