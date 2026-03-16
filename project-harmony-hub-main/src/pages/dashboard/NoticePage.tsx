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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Megaphone, Upload, Send, Plus, Trash2, Loader2, ChevronsUpDown, Check, Users, UserSquare2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { apiGet, apiPost, apiUpload } from '@/lib/api';
import { cn } from '@/lib/utils';

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
  targetGroups?: string[];
  targetGuides?: Array<{ _id: string; name: string }>;
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  academicYear?: string;
  department?: string;
}

interface Mentor {
  _id: string;
  name: string;
  email?: string;
}

interface NoticePageProps {
  role?: UserRole;
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────
interface MultiSelectProps {
  label: string;
  icon: React.ReactNode;
  items: { id: string; label: string; sublabel?: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function MultiSelect({ label, icon, items, selected, onChange, placeholder = 'Search…', disabled }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const selectedLabels = items.filter((i) => selected.includes(i.id)).map((i) => i.label);

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {icon} {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
            {selected.length} selected
          </Badge>
        )}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-sm h-9 truncate"
          >
            <span className="truncate text-left flex-1">
              {selectedLabels.length === 0
                ? <span className="text-muted-foreground">All (broadcast)</span>
                : selectedLabels.slice(0, 2).join(', ') + (selectedLabels.length > 2 ? ` +${selectedLabels.length - 2}` : '')}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList 
              className="max-h-64 overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => toggle(item.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn('mr-2 h-4 w-4', selected.includes(item.id) ? 'opacity-100' : 'opacity-0')}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{item.label}</span>
                      {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ── Audience section (reused in both Manual + Upload) ────────────────────────
interface AudienceSectionProps {
  sendToStudents: boolean;
  onStudents: (v: boolean) => void;
  sendToGuides: boolean;
  onGuides: (v: boolean) => void;
  selectedGroups: string[];
  onGroups: (v: string[]) => void;
  selectedMentors: string[];
  onMentors: (v: string[]) => void;
  groups: Group[];
  mentors: Mentor[];
  idPrefix: string;
}

function AudienceSection({
  sendToStudents, onStudents,
  sendToGuides, onGuides,
  selectedGroups, onGroups,
  selectedMentors, onMentors,
  groups, mentors,
  idPrefix,
}: AudienceSectionProps) {
  const groupItems = groups.map((g) => ({
    id: g._id,
    label: g.name,
    sublabel: [g.department, g.academicYear].filter(Boolean).join(' · '),
  }));
  const mentorItems = mentors.map((m) => ({ id: m._id, label: m.name, sublabel: m.email }));

  return (
    <div className="space-y-3 p-4 bg-muted/40 rounded-lg border">
      <Label className="text-sm font-semibold">Send To *</Label>

      {/* Students row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${idPrefix}-students`}
            checked={sendToStudents}
            onCheckedChange={(c) => { onStudents(!!c); if (!c) onGroups([]); }}
          />
          <label htmlFor={`${idPrefix}-students`} className="text-sm font-medium cursor-pointer">
            Students
          </label>
        </div>
        {sendToStudents && (
          <div className="ml-6">
            <MultiSelect
              label="Specific Groups (leave empty = all students)"
              icon={<Users className="h-3 w-3" />}
              items={groupItems}
              selected={selectedGroups}
              onChange={onGroups}
              placeholder="Search groups…"
            />
          </div>
        )}
      </div>

      {/* Mentors row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`${idPrefix}-mentors`}
            checked={sendToGuides}
            onCheckedChange={(c) => { onGuides(!!c); if (!c) onMentors([]); }}
          />
          <label htmlFor={`${idPrefix}-mentors`} className="text-sm font-medium cursor-pointer">
            Mentors
          </label>
        </div>
        {sendToGuides && (
          <div className="ml-6">
            <MultiSelect
              label="Specific Mentors (leave empty = all mentors)"
              icon={<UserSquare2 className="h-3 w-3" />}
              items={mentorItems}
              selected={selectedMentors}
              onChange={onMentors}
              placeholder="Search mentors…"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function NoticePage({ role = 'admin' }: NoticePageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', purpose: '', startDate: '', dueDate: '' });
  const [sendToStudents, setSendToStudents] = useState(false);
  const [sendToGuides, setSendToGuides] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);

  const [viewNotice, setViewNotice] = useState<Notice | null>(null);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
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
  const [uploadGroups, setUploadGroups] = useState<string[]>([]);
  const [uploadMentors, setUploadMentors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const canManage = role === 'admin' || role === 'itr_coordinator';

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const data = await apiGet<{ success: boolean; count: number; data: Notice[] }>('/notices');
      if (data?.success) setNotices(data.data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch groups + mentors for targeting
  const fetchTargetingData = async () => {
    if (!canManage) return;
    try {
      const data = await apiGet<{ success: boolean; data: { groups: Group[]; mentors: Mentor[] } }>('/notices/targeting-data');
      if (data?.success) {
        setGroups(data.data.groups);
        setMentors(data.data.mentors);
      }
    } catch (error) {
      console.error('Failed to fetch targeting data:', error);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchTargetingData();
  }, []);

  // Reset manual form
  const resetManualForm = () => {
    setNewNotice({ title: '', purpose: '', startDate: '', dueDate: '' });
    setSendToStudents(false);
    setSendToGuides(false);
    setSelectedGroups([]);
    setSelectedMentors([]);
  };

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
        targetGroups: selectedGroups,
        targetGuides: selectedMentors,
      });

      toast({ title: 'Notice Created', description: 'Notice has been created and sent successfully.' });
      setIsAddDialogOpen(false);
      resetManualForm();
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
      // Audience fields — sent as JSON strings since FormData is multipart
      formData.append('sentToStudents', String(uploadSendToStudent));
      formData.append('sentToGuides', String(uploadSendToGuide));
      formData.append('targetGroups', JSON.stringify(uploadGroups));
      formData.append('targetGuides', JSON.stringify(uploadMentors));

      await apiUpload('/notices/upload', formData);

      toast({ title: 'Notice Uploaded', description: 'File notice has been uploaded and sent successfully.' });
      setUploadTitle('');
      setUploadPurpose('');
      setUploadStartDate('');
      setUploadDueDate('');
      setUploadFile(null);
      setUploadSendToStudent(false);
      setUploadSendToGuide(false);
      setUploadGroups([]);
      setUploadMentors([]);
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
    } catch {
      toast({ title: 'Error', description: 'Failed to delete notice.', variant: 'destructive' });
    }
  };

  // Helper: resolve group names — shows name if loaded, else shows count
  const getGroupLabels = (ids: string[]): string[] => {
    if (ids.length === 0) return [];
    const resolved = ids.map((id) => groups.find((g) => g._id === id)?.name);
    // If we don't have group data (e.g. student view), show count instead of raw IDs
    if (resolved.every(Boolean)) return resolved as string[];
    return [`${ids.length} Group${ids.length > 1 ? 's' : ''}`];
  };

  const getSentToDisplay = (notice: Notice) => {
    const targetGroupIds = notice.targetGroups || [];
    const targetMentors = notice.targetGuides || [];
    const groupLabels = getGroupLabels(targetGroupIds);
    const mentorNames = targetMentors.map((m) => typeof m === 'object' ? m.name : '').filter(Boolean);

    const items: React.ReactNode[] = [];

    if (notice.sentToStudents) {
      if (groupLabels.length === 0) {
        items.push(<Badge key="all-students" className="bg-black text-white text-xs">All Students</Badge>);
      } else {
        groupLabels.forEach((lbl) =>
          items.push(<Badge key={lbl} variant="outline" className="text-xs border-black text-black"><Users className="h-2.5 w-2.5 mr-1" />{lbl}</Badge>)
        );
      }
    }

    if (notice.sentToGuides) {
      if (mentorNames.length === 0) {
        items.push(<Badge key="all-mentors" className="bg-black text-white text-xs">All Mentors</Badge>);
      } else {
        mentorNames.forEach((name) =>
          items.push(<Badge key={name} variant="outline" className="text-xs border-black text-black"><UserSquare2 className="h-2.5 w-2.5 mr-1" />{name}</Badge>)
        );
      }
    }

    if (items.length === 0) {
      items.push(<Badge key="draft" variant="secondary">Draft</Badge>);
    }

    return items;
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notice Delivering</h1>
          <p className="text-muted-foreground">Create and send notices to students, groups, and project guides</p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          {/* ── Manual Entry tab ────────────────────────────────────── */}
          <TabsContent value="manual" className="space-y-4">
            {canManage && (
              <div className="flex justify-end">
                <Dialog open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); if (!o) resetManualForm(); }}>
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
                          <Input type="date" value={newNotice.startDate} onChange={(e) => setNewNotice({ ...newNotice, startDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Input type="date" value={newNotice.dueDate} onChange={(e) => setNewNotice({ ...newNotice, dueDate: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Title of Notice *</Label>
                        <Input value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Enter notice title" />
                      </div>
                      <div className="space-y-2">
                        <Label>Purpose of Notice *</Label>
                        <Textarea value={newNotice.purpose} onChange={(e) => setNewNotice({ ...newNotice, purpose: e.target.value })} placeholder="Enter the purpose and details..." rows={4} />
                      </div>

                      <AudienceSection
                        idPrefix="manual"
                        sendToStudents={sendToStudents}
                        onStudents={setSendToStudents}
                        sendToGuides={sendToGuides}
                        onGuides={setSendToGuides}
                        selectedGroups={selectedGroups}
                        onGroups={setSelectedGroups}
                        selectedMentors={selectedMentors}
                        onMentors={setSelectedMentors}
                        groups={groups}
                        mentors={mentors}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                      <Button className="btn-success" onClick={handleAddNotice} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Create &amp; Send Notice
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Megaphone className="h-5 w-5" />All Notices</CardTitle>
                <CardDescription>{notices.length} notices found</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : notices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notices created yet. Click "Create Notice" to add one.</p>
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
                            <TableCell className="font-medium max-w-[150px] truncate">{notice.title}</TableCell>
                            <TableCell className="max-w-[180px] truncate text-muted-foreground text-sm">{notice.purpose}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">{notice.startDate ? new Date(notice.startDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell className="whitespace-nowrap text-sm">{notice.dueDate ? new Date(notice.dueDate).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {getSentToDisplay(notice)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {/* View button — visible to everyone */}
                                <Button variant="ghost" size="sm" onClick={() => setViewNotice(notice)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {/* Delete — only for admin / itr_coordinator */}
                                {canManage && (
                                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(notice._id)}>
                                    <Trash2 className="h-4 w-4" />
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

                {/* View Notice Dialog */}
                <Dialog open={!!viewNotice} onOpenChange={(o) => { if (!o) setViewNotice(null); }}>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />{viewNotice?.title}</DialogTitle>
                      <DialogDescription>
                        <span className="flex flex-wrap gap-1 mt-1">{viewNotice && getSentToDisplay(viewNotice)}</span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      {(viewNotice?.startDate || viewNotice?.dueDate) && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                            <p className="font-medium">{viewNotice.startDate ? new Date(viewNotice.startDate).toLocaleDateString() : '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                            <p className="font-medium">{viewNotice.dueDate ? new Date(viewNotice.dueDate).toLocaleDateString() : '—'}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Purpose / Details</p>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-lg p-4">{viewNotice?.purpose}</p>
                      </div>
                      {viewNotice?.type === 'file' && viewNotice.fileUrl && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Attached File</p>
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${viewNotice.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary underline"
                          >
                            <Upload className="h-4 w-4" />{viewNotice.fileName || 'Download File'}
                          </a>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Posted on {viewNotice ? new Date(viewNotice.createdAt).toLocaleString() : ''}</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setViewNotice(null)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Upload File tab ──────────────────────────────────────── */}
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

                  <AudienceSection
                    idPrefix="upload"
                    sendToStudents={uploadSendToStudent}
                    onStudents={setUploadSendToStudent}
                    sendToGuides={uploadSendToGuide}
                    onGuides={setUploadSendToGuide}
                    selectedGroups={uploadGroups}
                    onGroups={setUploadGroups}
                    selectedMentors={uploadMentors}
                    onMentors={setUploadMentors}
                    groups={groups}
                    mentors={mentors}
                  />

                  <div className="flex gap-2">
                    <Button className="btn-success" onClick={handleUploadNotice} disabled={isUploading}>
                      {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Upload &amp; Send Notice
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
