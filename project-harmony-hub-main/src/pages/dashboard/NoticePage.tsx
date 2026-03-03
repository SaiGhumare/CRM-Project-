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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Upload, Send, Plus, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { apiGet } from '@/lib/api';

interface Notice {
  _id: string;
  title: string;
  purpose: string;
  startDate?: string;
  dueDate?: string;
  type: 'manual' | 'file';
  fileName?: string;
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
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Upload tab selections
  const [uploadSendToStudent, setUploadSendToStudent] = useState(false);
  const [uploadSendToGuide, setUploadSendToGuide] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await apiGet<{ notices?: Notice[] }>('/notices');
        if (data?.notices) {
          setNotices(data.notices);
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const handleAddNotice = () => {
    setIsAddDialogOpen(false);
    setNewNotice({ title: '', purpose: '', startDate: '', dueDate: '' });
    toast({ title: 'Notice Created', description: 'Notice has been created successfully.' });
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
                    <DialogDescription>Fill in the details to create a notice</DialogDescription>
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
                      <Label>Title of Notice</Label>
                      <Input value={newNotice.title} onChange={(e) => setNewNotice({...newNotice, title: e.target.value})} placeholder="Enter notice title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Purpose of Notice</Label>
                      <Textarea value={newNotice.purpose} onChange={(e) => setNewNotice({...newNotice, purpose: e.target.value})} placeholder="Enter the purpose and details..." rows={5} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button className="btn-success" onClick={handleAddNotice}><Send className="h-4 w-4 mr-2" />Create Notice</Button>
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
                  <p className="text-sm text-muted-foreground text-center py-8">Loading notices...</p>
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
                          <TableHead>Status</TableHead>
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
                                {notice.sentToStudents && <Badge className="bg-success text-success-foreground text-xs">Sent to Students</Badge>}
                                {notice.sentToGuides && <Badge className="bg-info text-info-foreground text-xs">Sent to Guides</Badge>}
                                {!notice.sentToStudents && !notice.sentToGuides && <Badge variant="secondary">Draft</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Drag and drop your PDF or Word file here, or click to browse</p>
                    <Input type="file" accept=".pdf,.doc,.docx" className="max-w-xs mx-auto" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id="upload-student" checked={uploadSendToStudent} onCheckedChange={(c) => setUploadSendToStudent(!!c)} />
                      <label htmlFor="upload-student" className="text-sm">Student</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="upload-guide" checked={uploadSendToGuide} onCheckedChange={(c) => setUploadSendToGuide(!!c)} />
                      <label htmlFor="upload-guide" className="text-sm">Guide</label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="btn-success"><Send className="h-4 w-4 mr-2" />Send Notice</Button>
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
