import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Megaphone, Upload, Send, Plus, Eye, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { apiGet, apiPost, apiUpload } from '@/lib/api';

interface Notice {
  _id: string;
  title: string;
  purpose: string;
  startDate?: string;
  dueDate?: string;
  type: 'manual' | 'file';
  fileName?: string;
  fileUrl?: string;
  sentToStudents: boolean;
  sentToGuides: boolean;
  createdAt: string;
}

interface NoticePageProps {
  role?: UserRole;
}

export default function NoticePage({ role = 'admin' }: NoticePageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', purpose: '', startDate: '', dueDate: '' });
  const [sendToStudents, setSendToStudents] = useState(false);
  const [sendToGuides, setSendToGuides] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Upload tab state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPurpose, setUploadPurpose] = useState('');
  const [uploadStartDate, setUploadStartDate] = useState('');
  const [uploadDueDate, setUploadDueDate] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSendToStudent, setUploadSendToStudent] = useState(false);
  const [uploadSendToGuide, setUploadSendToGuide] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchNotices = async () => {
    try {
      const data = await apiGet<{ success: boolean; count: number; data: Notice[] }>('/notices');
      if (data?.success) {
        setNotices(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Create manual notice
  const handleAddNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.purpose.trim()) {
      toast({ title: 'Missing Fields', description: 'Please fill in both title and purpose.', variant: 'destructive' });
      return;
    }
    if (!sendToStudents && !sendToGuides) {
      toast({ title: 'Select Audience', description: 'Please select at least one audience (Students or Mentors).', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/notices', {
        title: newNotice.title.trim(),
        purpose: newNotice.purpose.trim(),
        startDate: newNotice.startDate || undefined,
        dueDate: newNotice.dueDate || undefined,
        sentToStudents: sendToStudents,
        sentToGuides: sendToGuides,
      });

      toast({ title: 'Notice Created', description: 'Notice has been created and sent successfully.' });
      setIsAddDialogOpen(false);
      setNewNotice({ title: '', purpose: '', startDate: '', dueDate: '' });
      setSendToStudents(false);
      setSendToGuides(false);
      fetchNotices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create notice.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload file notice
  const handleUploadNotice = async () => {
    if (!uploadFile) {
      toast({ title: 'No File', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }
    if (!uploadSendToStudent && !uploadSendToGuide) {
      toast({ title: 'Select Audience', description: 'Please select at least one audience.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadTitle.trim()) formData.append('title', uploadTitle.trim());
      if (uploadPurpose.trim()) formData.append('purpose', uploadPurpose.trim());
      if (uploadStartDate) formData.append('startDate', uploadStartDate);
      if (uploadDueDate) formData.append('dueDate', uploadDueDate);

      const data = await apiUpload('/notices/upload', formData);

      // After upload, send it to selected audiences
      if (data?.data?._id) {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/notices/${data.data._id}/send`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            sendToStudents: uploadSendToStudent,
            sendToGuides: uploadSendToGuide,
          }),
        });
      }

      toast({ title: 'Notice Uploaded', description: 'File notice has been uploaded and sent successfully.' });
      setUploadTitle('');
      setUploadPurpose('');
      setUploadStartDate('');
      setUploadDueDate('');
      setUploadFile(null);
      setUploadSendToStudent(false);
      setUploadSendToGuide(false);
      fetchNotices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to upload notice.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete notice
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Deleted', description: 'Notice has been deleted.' });
      fetchNotices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete notice.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notice Delivering</h1>
          <p className="text-muted-foreground">Create and send notices to students and project guides</p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-success"><Plus className="h-4 w-4 mr-2" />Create Notice</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Notice</DialogTitle>
                    <DialogDescription>Fill in the details and select who should receive the notice</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" value={newNotice.startDate} onChange={(e) => setNewNotice({...newNotice, startDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={newNotice.dueDate} onChange={(e) => setNewNotice({...newNotice, dueDate: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Title of Notice *</Label>
                      <Input value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} placeholder="Enter notice title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose of Notice *</Label>
                      <Textarea value={newNotice.purpose} onChange={(e) => setNewNotice({...newNotice, purpose: e.target.value})} placeholder="Enter the purpose and details..." rows={5} />
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Send To *</Label>
                      <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Checkbox id="send-students" checked={sendToStudents} onCheckedChange={(c) => setSendToStudents(!!c)} />
                          <label htmlFor="send-students" className="text-sm font-medium cursor-pointer">Students</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="send-mentors" checked={sendToGuides} onCheckedChange={(c) => setSendToGuides(!!c)} />
                          <label htmlFor="send-mentors" className="text-sm font-medium cursor-pointer">Mentors</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button className="btn-success" onClick={handleAddNotice} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Create & Send Notice
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Megaphone className="h-5 w-5" />All Notices</CardTitle>
                <CardDescription>{notices.length} notices found</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : notices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No notices created yet. Click "Create Notice" to add one.
                  </p>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Title</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Sent To</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {notices.map((notice) => (
                          <TableRow key={notice._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{notice.title}</TableCell>
                            <TableCell className="max-w-[250px] truncate">{notice.purpose}</TableCell>
                            <TableCell>{notice.startDate ? new Date(notice.startDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>{notice.dueDate ? new Date(notice.dueDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {notice.sentToStudents && <Badge className="bg-success text-success-foreground text-xs">Students</Badge>}
                                {notice.sentToGuides && <Badge className="bg-info text-info-foreground text-xs">Mentors</Badge>}
                                {!notice.sentToStudents && !notice.sentToGuides && <Badge variant="secondary">Draft</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(notice._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Notice File</CardTitle>
                <CardDescription>Upload a PDF or Word file as a notice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title (optional)</Label>
                      <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Notice title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose (optional)</Label>
                      <Input value={uploadPurpose} onChange={(e) => setUploadPurpose(e.target.value)} placeholder="Purpose" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={uploadStartDate} onChange={(e) => setUploadStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Input type="date" value={uploadDueDate} onChange={(e) => setUploadDueDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Select a PDF or Word file to upload</p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="max-w-xs mx-auto"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Send To *</Label>
                    <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Checkbox id="upload-student" checked={uploadSendToStudent} onCheckedChange={(c) => setUploadSendToStudent(!!c)} />
                        <label htmlFor="upload-student" className="text-sm font-medium cursor-pointer">Students</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="upload-guide" checked={uploadSendToGuide} onCheckedChange={(c) => setUploadSendToGuide(!!c)} />
                        <label htmlFor="upload-guide" className="text-sm font-medium cursor-pointer">Mentors</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="btn-success" onClick={handleUploadNotice} disabled={isUploading}>
                      {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Upload & Send Notice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
