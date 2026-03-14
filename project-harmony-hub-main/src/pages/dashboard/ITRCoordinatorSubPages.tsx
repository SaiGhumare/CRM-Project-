import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, CalendarCheck, FolderOpen, Award, Send, Megaphone, FileText, IndianRupee, Loader2, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';

// Individual page components
export function ITRCoordStudentListPage() {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setShowStudents(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);
      
      const res = await apiGet<{ success: boolean; data: any[] }>(`/itr/students?${params.toString()}`);
      if (res.success) setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch assigned ITR students', error);
      toast({ title: 'Error', description: 'Failed to find assigned ITR students', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // optional initial fetch or wait for handleView
  }, [toast]);

  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned ITR Students</h1>
          <p className="text-muted-foreground">View and manage your currently assigned students</p>
        </div>
        
        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Data</CardTitle></CardHeader>
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
              <Button className="btn-info" onClick={fetchStudents}><Eye className="h-4 w-4 mr-2" />View Data</Button>
            </div>
          </CardContent>
        </Card>

        {showStudents && (
          <Card>
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                   <Users className="h-5 w-5 text-primary" />
                   Student Roster
               </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground cursor-default">No ITR students found.</p>
                  <p className="text-sm text-muted-foreground mt-1 cursor-default">Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((entry, idx) => {
                      const s = entry.student;
                      const latestRecord = entry.itrRecords?.[0];
                      return (
                        <TableRow key={s?._id || idx}>
                          <TableCell className="font-medium">{s?.name || 'N/A'}</TableCell>
                          <TableCell>{s?.enrollmentNumber || 'N/A'}</TableCell>
                          <TableCell>
                            {s?.className} {s?.division} ({s?.academicYear})
                          </TableCell>
                          <TableCell>{latestRecord?.companyName || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {latestRecord?.startDate ? new Date(latestRecord.startDate).toLocaleDateString() : '-'} - {latestRecord?.endDate ? new Date(latestRecord.endDate).toLocaleDateString() : 'Present'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={latestRecord?.status === 'completed' ? 'default' : 'secondary'} className={latestRecord?.status === 'completed' ? 'bg-success text-success-foreground' : ''}>
                              {latestRecord?.status ? latestRecord.status.charAt(0).toUpperCase() + latestRecord.status.slice(1) : '-'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordAttendancePage() {
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendance records to display. Attendance data will appear here once marking begins.
            </p>
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
  const [file, setFile] = useState<File | null>(null);
  
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: any[] }>('/notices');
      if (res.success) {
        setNotices(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [toast]);

  const handleSendNotice = async () => {
    if (!noticeTitle.trim() || !noticePurpose.trim()) {
      toast({ title: 'Validation Error', description: 'Title and purpose are required', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (file) {
        // File Upload Workflow
        const formData = new FormData();
        formData.append('title', noticeTitle);
        formData.append('purpose', noticePurpose);
        formData.append('file', file);
        if (startDate) formData.append('startDate', startDate);
        if (dueDate) formData.append('dueDate', dueDate);
        formData.append('sentToStudents', selectedSendTo === 'students' || selectedSendTo === 'both' ? 'true' : 'false');
        formData.append('sentToGuides', selectedSendTo === 'hod' || selectedSendTo === 'both' ? 'true' : 'false');

        const res = await apiPost<{ success: boolean }>('/notices/upload', formData);
        if (res.success) toast({ title: 'Notice Sent', description: 'File notice successfully created and sent.', className: 'bg-success text-success-foreground' });
      } else {
        // Manual Text Workflow
        const payload = {
          title: noticeTitle,
          purpose: noticePurpose,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
          sentToStudents: selectedSendTo === 'students' || selectedSendTo === 'both',
          sentToGuides: selectedSendTo === 'hod' || selectedSendTo === 'both',
        };
        const res = await apiPost<{ success: boolean }>('/notices', payload);
        if (res.success) toast({ title: 'Notice Sent', description: 'Manual notice successfully created and sent.', className: 'bg-success text-success-foreground' });
      }

      // Reset form & refresh
      setNoticeTitle('');
      setNoticePurpose('');
      setStartDate('');
      setDueDate('');
      setFile(null);
      await fetchNotices();
    } catch (error: any) {
      console.error('Error sending notice', error);
      toast({ title: 'Failed to send', description: error.message || 'Server error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await apiDelete<{ success: boolean }>(`/notices/${id}`);
      if (res.success) {
        toast({ title: 'Notice Deleted', description: 'The notice has been removed successfully.' });
        setNotices(notices.filter(n => n._id !== id));
      }
    } catch (error: any) {
      toast({ title: 'Delete Failed', description: error.message || 'Not authorized to delete this notice.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notice Delivering</h1>
          <p className="text-muted-foreground">Send notices to HOD and Students</p>
        </div>

        {/* Create Notice Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Create & Send Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Title of Notice</Label>
                <Input placeholder="Enter notice title" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message/Purpose</Label>
                <Textarea placeholder="Enter the message body or purpose of the attached file..." rows={4} value={noticePurpose} onChange={(e) => setNoticePurpose(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Optional File Attachment</Label>
                <Input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex gap-4 items-end pt-2">
                <div className="space-y-2 w-full max-w-[200px]">
                  <Label>Send To</Label>
                  <Select value={selectedSendTo} onValueChange={setSelectedSendTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">ITR Students</SelectItem>
                      <SelectItem value="hod">HODs</SelectItem>
                      <SelectItem value="both">HODs & Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="btn-success w-full sm:w-auto" onClick={handleSendNotice} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  {submitting ? 'Sending...' : 'Send Notice'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Past Notices Board */}
        <Card>
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Notice Board
             </CardTitle>
           </CardHeader>
           <CardContent>
             {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
             ) : notices.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No notices have been published yet.</div>
             ) : (
                <div className="rounded-md border overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-muted/50">
                       <TableHead>Title</TableHead>
                       <TableHead>Type</TableHead>
                       <TableHead>Posted By</TableHead>
                       <TableHead>Date</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {notices.map((n) => (
                       <TableRow key={n._id}>
                         <TableCell className="font-medium">
                           {n.title}
                           {n.fileUrl && <Badge variant="secondary" className="ml-2">Attachment</Badge>}
                         </TableCell>
                         <TableCell className="text-sm">{n.type === 'file' ? 'File' : 'Text'}</TableCell>
                         <TableCell className="text-sm">{n.createdBy?.name || 'System'}</TableCell>
                         <TableCell className="text-sm text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                         <TableCell className="text-right space-x-2">
                           {n.fileUrl && (
                             <Button variant="outline" size="sm" asChild>
                                <a href={`http://localhost:5000${n.fileUrl}`} target="_blank" rel="noreferrer">View File</a>
                             </Button>
                           )}
                           <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(n._id)}>
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordAssignmentsPage() {
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No assignments submitted yet. Assignments will appear here once students submit them.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function ITRCoordDocumentsPage() {
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No document templates uploaded yet.
            </p>
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No certificate records to display. Certificates will appear once attendance eligibility is confirmed.
            </p>
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
            <p className="text-sm text-muted-foreground text-center py-8">
              No fee records to display.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
