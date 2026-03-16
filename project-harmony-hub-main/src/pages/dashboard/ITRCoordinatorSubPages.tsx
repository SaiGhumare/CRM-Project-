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
import { Users, CalendarCheck, FolderOpen, Award, Send, Megaphone, FileText, IndianRupee, Loader2, AlertTriangle, Trash2, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut, apiUpload } from '@/lib/api';
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

const dummyAttendanceData = Array.from({ length: 45 }, (_, i) => ({
  id: `${i + 1}`,
  name: [
    'Arjun Sharma', 'Sara Khan', 'Ishaan Gupta', 'Anya Verma', 'Rahul Singh', 
    'Zoya Ansari', 'Kabir Das', 'Myra Reddy', 'Aditya Mishra', 'Sana Parveen',
    'Yash Vardhan', 'Kiara Sen', 'Rohan Malhotra', 'Ishita Rao', 'Aryan Jain',
    'Avani Joshi', 'Devansh Shah', 'Tanvi Kulkarni', 'Karthik Nair', 'Anika Bose',
    'Siddharth Patil', 'Riya Hegde', 'Pranav Kulkarni', 'Navya Shetty', 'Hrithik Roshan',
    'Deepika Padukone', 'Ranbir Kapoor', 'Alia Bhatt', 'Varun Dhawan', 'Shraddha Kapoor',
    'Akshay Kumar', 'Katrina Kaif', 'Salman Khan', 'Priyanka Chopra', 'Shah Rukh Khan',
    'Anushka Sharma', 'Aamir Khan', 'Kareena Kapoor', 'Hrithik Shrivastav', 'Vidya Balan',
    'Farhan Akhtar', 'Sonam Kapoor', 'John Abraham', 'Jacqueline Fernandez', 'Ranveer Singh'
  ][i % 45],
  enrollment: `EN21${String(100 + i + 1).padStart(3, '0')}`,
  status: ['present', 'present', 'absent', 'present', 'late'][i % 5],
  attendancePercentage: Math.floor(65 + Math.random() * 30),
  lastUpdated: '2025-11-20'
}));

export function ITRCoordAttendancePage() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'present': return <Badge className="bg-success text-success-foreground">Present</Badge>;
      case 'absent': return <Badge variant="destructive">Absent</Badge>;
      case 'late': return <Badge className="bg-warning text-warning-foreground">Late</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance Marking</h1>
            <p className="text-muted-foreground">Students with 75%+ attendance are eligible for certificates</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 flex gap-4">
              <div className="text-center px-4 border-r border-primary/20">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Total Students</p>
                <p className="text-xl font-bold text-primary">45</p>
              </div>
              <div className="text-center px-4 border-r border-primary/20">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Present Today</p>
                <p className="text-xl font-bold text-success">36</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Avg Attendance</p>
                <p className="text-xl font-bold text-info">82%</p>
              </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Daily Attendance Log - {new Date().toLocaleDateString()}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-8">Mark All Present</Button>
              <Button size="sm" className="btn-success h-8 text-xs">Save Attendance</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment</TableHead>
                      <TableHead>Overall %</TableHead>
                      <TableHead>Today's Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyAttendanceData.map((student, idx) => (
                      <TableRow key={student.id} className="hover:bg-muted/30">
                        <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-sm font-mono">{student.enrollment}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${student.attendancePercentage >= 75 ? 'bg-success' : 'bg-warning'}`} 
                                style={{ width: `${student.attendancePercentage}%` }} 
                              />
                            </div>
                            <span className={`text-xs font-semibold ${student.attendancePercentage >= 75 ? 'text-success' : 'text-warning'}`}>
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="text-right">
                          <Select defaultValue={student.status}>
                            <SelectTrigger className="w-[110px] h-8 text-xs ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setPageLoading(true);
      const [aRes, sRes] = await Promise.all([
        apiGet<{ success: boolean; data: any[] }>('/assignments'),
        apiGet<{ success: boolean; data: any[] }>('/assignments/submissions'),
      ]);
      setAssignments(aRes.data || []);
      setSubmissions(sRes.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !file) {
      toast({ title: 'Validation', description: 'Title and PDF file are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (dueDate) formData.append('dueDate', dueDate);
      formData.append('file', file);

      const res = await apiUpload<{ success: boolean }>('/assignments', formData);
      if (res.success) {
        toast({ title: 'Assignment Posted', description: 'Students can now view and submit.', className: 'bg-success text-success-foreground' });
        setTitle(''); setDescription(''); setDueDate(''); setFile(null);
        fetchData();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to post assignment', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this assignment and all its submissions?')) return;
    try {
      await apiDelete<{ success: boolean }>(`/assignments/${id}`);
      toast({ title: 'Deleted', description: 'Assignment removed.' });
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Could not delete assignment', variant: 'destructive' });
    }
  };

  const submitReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !feedbackText.trim()) {
      toast({ title: 'Feedback required', description: 'Please provide feedback when rejecting.', variant: 'destructive' });
      return;
    }
    try {
      setSubmittingReview(true);
      await apiPut(`/assignments/submissions/${submissionId}/review`, { status, feedback: feedbackText });
      toast({ title: 'Review submitted', description: `Submission ${status}` });
      setReviewingId(null);
      setFeedbackText('');
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Review failed', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">Post assignments for students and review their submissions.</p>
        </div>

        {/* Create Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Post New Assignment</CardTitle>
            <CardDescription>Upload the assignment PDF that students will download, complete, and submit.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. Week 1 Report" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Describe what students should do..." rows={2} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label>Assignment PDF *</Label>
                  <Input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} key={file ? 'f' : 'e'} />
                </div>
                <Button className="btn-success w-full sm:w-auto" onClick={handleCreate} disabled={submitting}>
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Posting...</> : <><Send className="h-4 w-4 mr-2" />Post Assignment</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posted Assignments */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Posted Assignments</CardTitle></CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No assignments posted yet.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map(a => {
                      const aSubs = submissions.filter(s => s.assignmentId?._id === a._id || s.assignmentId === a._id);
                      return (
                        <TableRow key={a._id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}</TableCell>
                          <TableCell><Badge variant="secondary">{aSubs.length} submitted</Badge></TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`http://localhost:5001${a.fileUrl}`} target="_blank" rel="noreferrer">
                                <Eye className="h-4 w-4 mr-1" />View
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(a._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Student Submissions */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Student Submissions</CardTitle></CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No submissions yet.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map(sub => {
                      const isReviewing = reviewingId === sub._id;
                      const canReview = sub.status === 'pending';
                      return (
                        <>
                          <TableRow key={sub._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{sub.uploadedBy?.name || '—'}</TableCell>
                            <TableCell className="text-sm">{sub.assignmentId?.title || '—'}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{sub.fileName}</TableCell>
                            <TableCell>{getStatusBadge(sub.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {sub.fileUrl && (
                                  <Button variant="ghost" size="sm" className="text-info h-8 px-2" asChild>
                                    <a href={`http://localhost:5001${sub.fileUrl}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                                  </Button>
                                )}
                                {canReview && (
                                  <>
                                    <Button size="sm" className="bg-success text-success-foreground h-8 text-xs" disabled={submittingReview} onClick={() => submitReview(sub._id, 'approved')}>
                                      <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-destructive text-destructive h-8 text-xs" onClick={() => { setReviewingId(isReviewing ? null : sub._id); setFeedbackText(''); }}>
                                      <AlertCircle className="h-3.5 w-3.5 mr-1" />Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {isReviewing && (
                            <TableRow key={`${sub._id}-fb`} className="bg-destructive/5">
                              <TableCell colSpan={6}>
                                <div className="flex gap-3 items-end py-2 px-2">
                                  <div className="flex-1">
                                    <Label className="text-xs mb-1 block text-destructive">Rejection Feedback (required)</Label>
                                    <Textarea rows={2} placeholder="Explain what needs to be corrected..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="text-sm" />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="border-destructive text-destructive h-9" disabled={submittingReview || !feedbackText.trim()} onClick={() => submitReview(sub._id, 'rejected')}>
                                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-9" onClick={() => setReviewingId(null)}>Cancel</Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
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
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCerts = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: any[] }>('/certificates?category=itr');
      if (res.success) {
        setCerts(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch ITR certificates', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'needs_correction':
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleVerify = async (id: string) => {
    try {
      // Though they are auto-approved, leaving a verify switch or simply an action point if needed
      await apiPut(`/certificates/${id}/review`, { status: 'approved', feedback: '' });
      fetchCerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Certificates</h1>
          <p className="text-muted-foreground">View ITR completion certificates uploaded by students.</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Student ITR Certificates</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : certs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No ITR certificates uploaded yet.
              </p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Certificate File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certs.map((cert) => (
                      <TableRow key={cert._id}>
                        <TableCell className="font-medium">{cert.uploadedBy?.name || 'Unknown'}</TableCell>
                        <TableCell className="font-mono text-sm">{cert.uploadedBy?.enrollmentNumber || 'Unknown'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">{cert.fileName}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(cert.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                             {cert.fileUrl && (
                                <Button variant="outline" size="sm" asChild>
                                   <a href={`http://localhost:5001${cert.fileUrl}`} target="_blank" rel="noreferrer">
                                     <Eye className="h-4 w-4 mr-1" /> View
                                   </a>
                                </Button>
                             )}
                           </div>
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

const dummyFeesData = [
  { id: '1', name: 'Aarav Patel', enrollment: 'EN21001', amount: 1500, status: 'paid', date: '2025-10-15' },
  { id: '2', name: 'Priya Sharma', enrollment: 'EN21002', amount: 1500, status: 'pending', date: '-' },
  { id: '3', name: 'Rohan Gupta', enrollment: 'EN21003', amount: 1500, status: 'paid', date: '2025-10-18' },
  { id: '4', name: 'Neha Desai', enrollment: 'EN21004', amount: 1500, status: 'overdue', date: '-' },
  { id: '5', name: 'Aditya Singh', enrollment: 'EN21005', amount: 1500, status: 'paid', date: '2025-11-02' }
];

export function ITRCoordFeesPage() {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Enrollment No.</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyFeesData.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>{fee.enrollment}</TableCell>
                      <TableCell>₹{fee.amount}</TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fee.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-info">
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
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
