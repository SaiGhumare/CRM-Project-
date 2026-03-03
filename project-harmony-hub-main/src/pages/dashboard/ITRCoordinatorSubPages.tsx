import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, CalendarCheck, FolderOpen, Award, Send, Megaphone, FileText, IndianRupee } from 'lucide-react';

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
            <p className="text-sm text-muted-foreground text-center py-8">
              No ITR students assigned yet. Students will appear here once ITR records are created.
            </p>
          </CardContent>
        </Card>
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
