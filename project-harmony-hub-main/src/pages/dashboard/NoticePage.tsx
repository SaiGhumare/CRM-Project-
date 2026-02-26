import { useState } from 'react';
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

interface Notice {
  id: string;
  title: string;
  purpose: string;
  startDate: string;
  dueDate: string;
  type: 'manual' | 'file';
  fileName?: string;
  sentToStudents: boolean;
  sentToGuides: boolean;
  createdAt: string;
}

interface NoticeSelection {
  sendToStudent: boolean;
  sendToGuide: boolean;
  selectedGroup: string;
  selectedGuide: string;
  selectedITRCoordinator: string;
}

const mockNotices: Notice[] = [
  { id: '1', title: 'Submit Synopsis', purpose: 'All students must submit their Synopsis document by the due date.', startDate: '2025-01-10', dueDate: '2025-01-25', type: 'manual', sentToStudents: true, sentToGuides: false, createdAt: '2025-01-10' },
  { id: '2', title: 'Project Guide Allocation', purpose: 'Students are requested to view their respective allocated project guide.', startDate: '2025-01-05', dueDate: '2025-01-15', type: 'manual', sentToStudents: true, sentToGuides: true, createdAt: '2025-01-05' },
  { id: '3', title: 'Weekly Diary Submission Reminder', purpose: 'All students must submit weekly diary entries every Friday before 5 PM.', startDate: '2025-01-15', dueDate: '2025-03-30', type: 'file', fileName: 'weekly_diary_notice.pdf', sentToStudents: false, sentToGuides: false, createdAt: '2025-01-15' },
];

const projectGuides = [
  { id: '1', name: 'P.B.Datir' },
  { id: '2', name: 'G.K.Ghate' },
  { id: '3', name: 'V.B.Ohol' },
  { id: '4', name: 'Y.N.Jadhav' },
  { id: '5', name: 'V.A.Wagh' },
  { id: '6', name: 'R.V.Deshpande' },
  { id: '7', name: 'R.S.Thete' },
];

const itrCoordinators = [
  { id: '1', name: 'Y.N.Jadhav' },
];

const groups = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];

const createDefaultSelection = (): NoticeSelection => ({
  sendToStudent: false,
  sendToGuide: false,
  selectedGroup: 'all',
  selectedGuide: 'all',
  selectedITRCoordinator: 'all',
});

interface NoticePageProps {
  role?: UserRole;
}

export default function NoticePage({ role = 'admin' }: NoticePageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', purpose: '', startDate: '', dueDate: '' });
  const [selections, setSelections] = useState<Record<string, NoticeSelection>>(() => {
    const initial: Record<string, NoticeSelection> = {};
    mockNotices.forEach(n => { initial[n.id] = createDefaultSelection(); });
    return initial;
  });
  // Upload tab selections
  const [uploadSendToStudent, setUploadSendToStudent] = useState(false);
  const [uploadSendToGuide, setUploadSendToGuide] = useState(false);
  const [uploadSelectedGuide, setUploadSelectedGuide] = useState<string>('all');
  const { toast } = useToast();

  const getSelection = (noticeId: string): NoticeSelection => {
    return selections[noticeId] || createDefaultSelection();
  };

  const updateSelection = (noticeId: string, updates: Partial<NoticeSelection>) => {
    setSelections(prev => ({
      ...prev,
      [noticeId]: { ...getSelection(noticeId), ...updates },
    }));
  };

  const handleSendNotice = (noticeId: string) => {
    const sel = getSelection(noticeId);
    const targets: string[] = [];
    if (sel.sendToStudent) targets.push('Students');
    if (sel.sendToGuide) {
      const guideName = sel.selectedGuide === 'all' ? 'All Guides' : projectGuides.find(g => g.id === sel.selectedGuide)?.name;
      targets.push(`Guide: ${guideName}`);
    }
    if (targets.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one recipient.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Notice Sent', description: `Sent to ${targets.join(', ')} successfully.` });
  };

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
                <CardDescription>{mockNotices.length} notices created</CardDescription>
              </CardHeader>
              <CardContent>
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
                      {mockNotices.map((notice) => {
                        const sel = getSelection(notice.id);
                        return (
                          <TableRow key={notice.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{notice.title}</TableCell>
                            <TableCell className="max-w-[250px] truncate">{notice.purpose}</TableCell>
                            <TableCell>{notice.startDate}</TableCell>
                            <TableCell>{notice.dueDate}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {notice.sentToStudents && <Badge className="bg-success text-success-foreground text-xs">Sent to Students</Badge>}
                                {notice.sentToGuides && <Badge className="bg-info text-info-foreground text-xs">Sent to Guides</Badge>}
                                {!notice.sentToStudents && !notice.sentToGuides && <Badge variant="secondary">Draft</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col gap-2 items-end">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Checkbox id={`student-${notice.id}`} checked={sel.sendToStudent} onCheckedChange={(c) => updateSelection(notice.id, { sendToStudent: !!c })} />
                                    <label htmlFor={`student-${notice.id}`} className="text-xs">Student</label>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Checkbox id={`guide-${notice.id}`} checked={sel.sendToGuide} onCheckedChange={(c) => updateSelection(notice.id, { sendToGuide: !!c })} />
                                    <label htmlFor={`guide-${notice.id}`} className="text-xs">Guide</label>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 items-center">
                                  <Select value={sel.selectedGroup} onValueChange={(v) => updateSelection(notice.id, { selectedGroup: v })}>
                                    <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue placeholder="Group" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Groups</SelectItem>
                                      {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <Select value={sel.selectedGuide} onValueChange={(v) => updateSelection(notice.id, { selectedGuide: v })}>
                                    <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue placeholder="Guide" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Guides</SelectItem>
                                      {projectGuides.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <Select value={sel.selectedITRCoordinator} onValueChange={(v) => updateSelection(notice.id, { selectedITRCoordinator: v })}>
                                    <SelectTrigger className="h-7 w-[130px] text-xs"><SelectValue placeholder="ITR Coord." /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Coordinators</SelectItem>
                                      {itrCoordinators.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" className="btn-success" onClick={() => handleSendNotice(notice.id)}>
                                    <Send className="h-3 w-3 mr-1" />Send
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
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
                    <Select value={uploadSelectedGuide} onValueChange={setUploadSelectedGuide}>
                      <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Select Guide" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Guides</SelectItem>
                        {projectGuides.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
