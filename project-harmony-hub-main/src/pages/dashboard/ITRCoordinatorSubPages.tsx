import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, CalendarCheck, FolderOpen, Award, Eye, Download, Upload, Send, Plus, Save, CheckCircle, Clock, AlertTriangle, Megaphone, FileText, IndianRupee } from 'lucide-react';

// Student list data
interface ITRStudentRecord {
  id: string;
  serialNumber: string;
  name: string;
  technology: string;
  hrName: string;
  instituteName: string;
  enrollmentNumber: string;
  rollNumber: string;
  companyName: string;
  companyAddress: string;
  trainingMode: 'Online' | 'Offline';
  email: string;
  contactNo: string;
}

const mockStudentList: ITRStudentRecord[] = [
  { id: '1', serialNumber: '1', name: 'Purva Santosh Deshmane', technology: 'Node.js', hrName: 'Mr. Verma', instituteName: 'Tech Mahindra', enrollmentNumber: '23611780192', rollNumber: '01', companyName: 'Tech Mahindra', companyAddress: 'Hinjewadi, Pune', trainingMode: 'Offline', email: 'purva@sandip.edu', contactNo: '9876543213' },
  { id: '2', serialNumber: '2', name: 'Arpita Sanjay Galankar', technology: 'React', hrName: 'Mrs. Deshpande', instituteName: 'Persistent', enrollmentNumber: '23611780234', rollNumber: '02', companyName: 'Persistent', companyAddress: 'MIDC, Nashik', trainingMode: 'Offline', email: 'arpita@sandip.edu', contactNo: '9876543214' },
  { id: '3', serialNumber: '3', name: 'Sneha Patil', technology: 'AWS', hrName: 'Mr. Jain', instituteName: 'Accenture', enrollmentNumber: '23611780356', rollNumber: '03', companyName: 'Accenture', companyAddress: 'Magarpatta, Pune', trainingMode: 'Online', email: 'sneha@sandip.edu', contactNo: '9876543215' },
];

interface AttendanceRecord {
  id: string;
  name: string;
  enrollmentNumber: string;
  totalDays: number;
  presentDays: number;
  percentage: number;
  status: 'present' | 'absent';
  date: string;
}

const mockAttendance: AttendanceRecord[] = [
  { id: '1', name: 'Purva Santosh Deshmane', enrollmentNumber: '23611780192', totalDays: 30, presentDays: 28, percentage: 93, status: 'present', date: '2025-01-20' },
  { id: '2', name: 'Arpita Sanjay Galankar', enrollmentNumber: '23611780234', totalDays: 30, presentDays: 24, percentage: 80, status: 'present', date: '2025-01-20' },
  { id: '3', name: 'Sneha Patil', enrollmentNumber: '23611780356', totalDays: 30, presentDays: 20, percentage: 67, status: 'absent', date: '2025-01-20' },
];

interface Assignment {
  id: string;
  title: string;
  studentName: string;
  enrollmentNumber: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'needs_correction' | 'rejected';
  acceptedByCoordinator: boolean;
  fileName?: string;
}

const mockAssignments: Assignment[] = [
  { id: '1', title: 'Week 1 - Database Design', studentName: 'Purva Santosh Deshmane', enrollmentNumber: '23611780192', submittedAt: '2025-01-15', status: 'verified', acceptedByCoordinator: true, fileName: 'assignment1_purva.pdf' },
  { id: '2', title: 'Week 2 - API Development', studentName: 'Arpita Sanjay Galankar', enrollmentNumber: '23611780234', submittedAt: '2025-01-20', status: 'pending', acceptedByCoordinator: false, fileName: 'assignment2_arpita.pdf' },
  { id: '3', title: 'Week 1 - Database Design', studentName: 'Sneha Patil', enrollmentNumber: '23611780356', submittedAt: '', status: 'needs_correction', acceptedByCoordinator: false, fileName: 'assignment1_sneha.pdf' },
];

const itrDocuments = [
  { id: '1', name: 'Offer Letter', type: 'offer_letter' },
  { id: '2', name: 'Completion Certificate', type: 'completion_cert' },
  { id: '3', name: 'Sample ITR Report Format', type: 'sample_itr' },
  { id: '4', name: 'Daily Diary Format', type: 'daily_diary' },
];

interface FeeRecord {
  id: string;
  name: string;
  enrollmentNumber: string;
  totalFees: number;
  paidAmount: number;
  status: 'Paid' | 'Half-Paid' | 'Not Paid';
}

const mockFees: FeeRecord[] = [
  { id: '1', name: 'Purva Santosh Deshmane', enrollmentNumber: '23611780192', totalFees: 15000, paidAmount: 15000, status: 'Paid' },
  { id: '2', name: 'Arpita Sanjay Galankar', enrollmentNumber: '23611780234', totalFees: 15000, paidAmount: 7500, status: 'Half-Paid' },
  { id: '3', name: 'Sneha Patil', enrollmentNumber: '23611780356', totalFees: 15000, paidAmount: 0, status: 'Not Paid' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'verified': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    case 'needs_correction': return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
    case 'pending': return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
    default: return <Badge variant="secondary">Not Submitted</Badge>;
  }
};

const getFeeStatusBadge = (status: string) => {
  switch (status) {
    case 'Paid': return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    case 'Half-Paid': return <Badge className="bg-warning text-warning-foreground">Half-Paid</Badge>;
    default: return <Badge variant="destructive">Not Paid</Badge>;
  }
};

// Individual page components
export function ITRCoordStudentListPage() {
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Student List</h1>
          <p className="text-muted-foreground">View and manage assigned students</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Student List</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>S.No.</TableHead><TableHead>Name</TableHead><TableHead>Technology</TableHead><TableHead>HR Name</TableHead><TableHead>Institute</TableHead><TableHead>Enrollment No.</TableHead><TableHead>Roll No.</TableHead><TableHead>Company</TableHead><TableHead>Address</TableHead><TableHead>Mode</TableHead><TableHead>Email</TableHead><TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentList.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.serialNumber}</TableCell><TableCell className="font-medium">{s.name}</TableCell><TableCell><Badge variant="secondary">{s.technology}</Badge></TableCell><TableCell>{s.hrName}</TableCell><TableCell>{s.instituteName}</TableCell><TableCell className="font-mono">{s.enrollmentNumber}</TableCell><TableCell>{s.rollNumber}</TableCell><TableCell>{s.companyName}</TableCell><TableCell className="max-w-[120px] truncate">{s.companyAddress}</TableCell><TableCell><Badge variant="outline">{s.trainingMode}</Badge></TableCell><TableCell>{s.email}</TableCell><TableCell>{s.contactNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordAttendancePage() {
  const { toast } = useToast();
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Marking</h1>
          <p className="text-muted-foreground">Students with 75%+ attendance are eligible for certificates</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Attendance</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Enrollment No.</TableHead><TableHead>Name</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Attendance %</TableHead><TableHead>Eligible</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendance.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.enrollmentNumber}</TableCell><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.date}</TableCell>
                      <TableCell><Badge className={r.status === 'present' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>{r.status === 'present' ? 'Present' : 'Absent'}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-2 min-w-[120px]"><Progress value={r.percentage} className="h-2 flex-1" /><span className={`text-sm font-medium ${r.percentage >= 75 ? 'text-success' : 'text-destructive'}`}>{r.percentage}%</span></div></TableCell>
                      <TableCell>{r.percentage >= 75 ? <Badge className="bg-success text-success-foreground">Eligible</Badge> : <Badge variant="destructive">Not Eligible</Badge>}</TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="sm" className="btn-success" onClick={() => toast({ title: 'Marked Present' })}>Present</Button><Button size="sm" variant="destructive" onClick={() => toast({ title: 'Marked Absent' })}>Absent</Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordNoticesPage() {
  const { toast } = useToast();
  const [selectedSendTo, setSelectedSendTo] = useState('students');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticePurpose, setNoticePurpose] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');




  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notice Delivering</h1>
          <p className="text-muted-foreground">Send notices to HOD and Students</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Megaphone className="h-5 w-5" />Create & Send Notice</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Title of Notice</Label><Input placeholder="Enter notice title" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Purpose of Notice</Label><Textarea placeholder="Enter the purpose and details..." rows={4} value={noticePurpose} onChange={(e) => setNoticePurpose(e.target.value)} /></div>
              <div className="space-y-2"><Label>Or Upload File</Label><Input type="file" accept=".pdf,.doc,.docx" /></div>
              <div className="flex gap-2">
                <Select value={selectedSendTo} onValueChange={setSelectedSendTo}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="both">HOD & Students</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="btn-success" onClick={() => toast({ title: 'Notice Sent', description: `Sent to ${selectedSendTo}` })}><Send className="h-4 w-4 mr-2" />Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordAssignmentsPage() {
  const { toast } = useToast();
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">View and manage student assignments. Status visible to students and project mentors.</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Assignments</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Assignment Title</TableHead><TableHead>Student Name</TableHead><TableHead>Enrollment No.</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead>Accepted by Coordinator</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAssignments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell><TableCell>{a.studentName}</TableCell><TableCell className="font-mono">{a.enrollmentNumber}</TableCell><TableCell>{a.submittedAt || '-'}</TableCell>
                      <TableCell>{getStatusBadge(a.status)}</TableCell>
                      <TableCell>{a.acceptedByCoordinator ? <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge> : <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {a.fileName && <><Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></>}
                          {a.status === 'pending' && <><Button size="sm" className="btn-success" onClick={() => toast({ title: 'Approved' })}>Approve</Button><Button size="sm" variant="destructive">Reject</Button><Button size="sm" variant="outline" className="text-warning border-warning">Correction</Button></>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordDocumentsPage() {
  const { toast } = useToast();
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground">Send document formats to students</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Document Templates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itrDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><span className="font-medium">{doc.name}</span></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />Upload</Button>
                    <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4 mr-1" />View</Button>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
                    <Button size="sm" className="btn-success" onClick={() => toast({ title: 'Sent', description: `${doc.name} sent to students` })}><Send className="h-4 w-4 mr-1" />Send to Students</Button>
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

export function ITRCoordCertificatesPage() {
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">Certificates can only be generated for students with 75%+ attendance</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Certificate Status</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Enrollment No.</TableHead><TableHead>Attendance %</TableHead><TableHead>Eligible</TableHead><TableHead>Certificate Status</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendance.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell><TableCell className="font-mono">{r.enrollmentNumber}</TableCell>
                      <TableCell><div className="flex items-center gap-2 min-w-[100px]"><Progress value={r.percentage} className="h-2 flex-1" /><span className="text-sm font-medium">{r.percentage}%</span></div></TableCell>
                      <TableCell>{r.percentage >= 75 ? <Badge className="bg-success text-success-foreground">Yes</Badge> : <Badge variant="destructive">No</Badge>}</TableCell>
                      <TableCell>{r.percentage >= 75 ? <Badge className="bg-success text-success-foreground">Generated</Badge> : <Badge variant="secondary">N/A</Badge>}</TableCell>
                      <TableCell className="text-right">{r.percentage >= 75 && <div className="flex justify-end gap-1"><Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></div>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordFeesPage() {
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fees Status</h1>
          <p className="text-muted-foreground">View student fee payment status</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><IndianRupee className="h-5 w-5" />Fees Status</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead><TableHead>Enrollment No.</TableHead><TableHead>Total Fees</TableHead><TableHead>Paid Amount</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.name}</TableCell><TableCell className="font-mono">{fee.enrollmentNumber}</TableCell><TableCell>₹{fee.totalFees.toLocaleString()}</TableCell><TableCell>₹{fee.paidAmount.toLocaleString()}</TableCell>
                      <TableCell>{getFeeStatusBadge(fee.status)}</TableCell>
                      <TableCell><div className="flex items-center gap-2 min-w-[120px]"><Progress value={(fee.paidAmount / fee.totalFees) * 100} className="h-2 flex-1" /><span className="text-sm font-medium">{Math.round((fee.paidAmount / fee.totalFees) * 100)}%</span></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
