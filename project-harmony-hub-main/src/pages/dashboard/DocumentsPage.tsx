import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, Upload, FolderOpen, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

interface DocumentRecord {
  id: string;
  serialNumber: string;
  enrollmentNumber: string;
  groupNumber: string;
  studentNames: string;
  projectTopic: string;
  projectGuide: string;
  stage: string;
  documentType: string;
  status: 'not_submitted' | 'needs_correction' | 'pending' | 'verified';
  fileName?: string;
}

const mockDocumentRecords: DocumentRecord[] = [
  { id: '1', serialNumber: '1', enrollmentNumber: '23611780192', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir', stage: 'Stage 1', documentType: 'Synopsis', status: 'verified', fileName: 'synopsis_g1.pdf' },
  { id: '2', serialNumber: '2', enrollmentNumber: '23611780192', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir', stage: 'Stage 1', documentType: 'PPT Stage One', status: 'pending', fileName: 'ppt_stage1_g1.pptx' },
  { id: '3', serialNumber: '3', enrollmentNumber: '23611780192', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir', stage: 'Stage 2', documentType: 'Final Report', status: 'not_submitted' },
  { id: '4', serialNumber: '4', enrollmentNumber: '23611780234', groupNumber: 'G1', studentNames: 'Purva Santosh Deshmane, Arpita Sanjay Galankar', projectTopic: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir', stage: 'Stage 1', documentType: 'Black Book', status: 'pending', fileName: 'blackbook_arpita.pdf' },
  { id: '5', serialNumber: '5', enrollmentNumber: '23611780356', groupNumber: 'G2', studentNames: 'Sneha Patil, Rohan Gaikwad', projectTopic: 'AI-based Attendance System', projectGuide: 'Prof. S. K. Jadhav', stage: 'Stage 1', documentType: 'Synopsis', status: 'needs_correction', fileName: 'synopsis_g2.pdf' },
  { id: '6', serialNumber: '6', enrollmentNumber: '23611780356', groupNumber: 'G2', studentNames: 'Sneha Patil, Rohan Gaikwad', projectTopic: 'AI-based Attendance System', projectGuide: 'Prof. S. K. Jadhav', stage: 'Stage 1', documentType: 'Weekly Diary', status: 'pending', fileName: 'diary_g2.pdf' },
];

interface GroupDocumentSummary {
  groupNumber: string;
  projectTitle: string;
  projectGuide: string;
  totalDocuments: number;
  submittedDocuments: number;
  submittedList: string[];
  pendingList: string[];
}

const mockGroupSummaries: GroupDocumentSummary[] = [
  { groupNumber: 'G1', projectTitle: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir', totalDocuments: 7, submittedDocuments: 3, submittedList: ['Synopsis', 'PPT Stage One', 'Black Book'], pendingList: ['Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'] },
  { groupNumber: 'G2', projectTitle: 'AI-based Attendance System', projectGuide: 'Prof. S. K. Jadhav', totalDocuments: 7, submittedDocuments: 2, submittedList: ['Synopsis', 'Weekly Diary'], pendingList: ['PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Sponsorship Letter'] },
  { groupNumber: 'G3', projectTitle: 'Predictive Analytics Dashboard', projectGuide: 'Prof. G. K. Ghate', totalDocuments: 7, submittedDocuments: 1, submittedList: ['Synopsis'], pendingList: ['PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'] },
  { groupNumber: 'G4', projectTitle: 'Voice-Controlled Home Automation', projectGuide: 'Prof. V. B. Ohol', totalDocuments: 7, submittedDocuments: 0, submittedList: [], pendingList: ['Synopsis', 'PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'] },
];

interface DocumentsPageProps {
  role: 'admin' | 'mentor';
}

export default function DocumentsPage({ role }: DocumentsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);
  const [docTab, setDocTab] = useState('current');

  const isCurrentYear = academicYear === '2025-26';
  const isPastYear = academicYear === '2023-24' || academicYear === '2024-25';

  const getStatusBadge = (status: string) => {
    if (isPastYear) return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground">Review and manage student project documents</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Documents</CardTitle></CardHeader>
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
              <Button className="btn-info" onClick={() => setShowDocuments(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showDocuments && (
          <Tabs value={docTab} onValueChange={setDocTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">Current Upload</TabsTrigger>
              <TabsTrigger value="group_submitted">Group Submitted Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Current Documents - {academicYear}</CardTitle>
                  <CardDescription>Recently uploaded documents by students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[60px]">S.No.</TableHead>
                          <TableHead>Enrollment No.</TableHead>
                          <TableHead>Group No.</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Project Guide</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockDocumentRecords.map((doc) => (
                          <TableRow key={doc.id} className="hover:bg-muted/30">
                            <TableCell>{doc.serialNumber}</TableCell>
                            <TableCell className="font-mono">{doc.enrollmentNumber}</TableCell>
                            <TableCell>{doc.groupNumber}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{doc.studentNames}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{doc.projectTopic}</TableCell>
                            <TableCell>{doc.projectGuide}</TableCell>
                            <TableCell>{doc.stage}</TableCell>
                            <TableCell>
                              <Button variant="link" className="p-0 h-auto text-primary underline">{doc.documentType}</Button>
                            </TableCell>
                            <TableCell>{getStatusBadge(doc.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {isPastYear ? (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                  </>
                                ) : (
                                  <>
                                    <Button variant="ghost" size="sm"><Upload className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                    {doc.status !== 'not_submitted' && <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>}
                                    {doc.status === 'pending' && (
                                      <>
                                        <Button size="sm" className="btn-success">Approve</Button>
                                        <Button size="sm" variant="destructive">Reject</Button>
                                        <Button size="sm" variant="outline" className="text-warning border-warning">Correction</Button>
                                      </>
                                    )}
                                  </>
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
            </TabsContent>

            <TabsContent value="group_submitted" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockGroupSummaries.map((group) => {
                  const progressPercent = Math.round((group.submittedDocuments / group.totalDocuments) * 100);
                  return (
                    <Card key={group.groupNumber} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {group.groupNumber}
                          </CardTitle>
                          <Badge variant="secondary">{group.submittedDocuments}/{group.totalDocuments} docs</Badge>
                        </div>
                        <CardDescription className="text-sm">{group.projectTitle}</CardDescription>
                        <p className="text-xs text-muted-foreground">Guide: {group.projectGuide}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Documents Progress</span>
                              <span className="font-medium">{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-success flex items-center gap-1 mb-1"><CheckCircle className="h-3 w-3" />Submitted</p>
                            <div className="flex flex-wrap gap-1">
                              {group.submittedList.length > 0 ? group.submittedList.map((d, i) => (
                                <Badge key={i} className="bg-success text-success-foreground text-xs">{d}</Badge>
                              )) : <span className="text-xs text-muted-foreground">None</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-warning flex items-center gap-1 mb-1"><Clock className="h-3 w-3" />Pending</p>
                            <div className="flex flex-wrap gap-1">
                              {group.pendingList.map((d, i) => (
                                <Badge key={i} variant="outline" className="text-warning border-warning text-xs">{d}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
