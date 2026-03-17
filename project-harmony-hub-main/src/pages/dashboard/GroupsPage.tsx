import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import {
  Eye, Users, Search, ArrowLeft, FolderOpen,
  Loader2, CheckCircle, XCircle, FileText, AlertTriangle,
  Clock, Download, Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiGet, apiPut } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// ---------- Types ----------

interface GroupMember {
  _id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  rollNumber: string;
  department: string;
}

interface GroupRecord {
  _id: string;
  name: string;
  projectTitle: string;
  projectGuide: string;
  overallProgress: number;
  academicYear: string;
  department: string;
  mentorId?: { _id: string; name: string };
  members: GroupMember[];
}

interface DocRecord {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  stage: 1 | 2 | 3;
  status: 'pending' | 'approved' | 'needs_correction' | 'verified' | 'verifying' | 'not_submitted';
  feedback?: string;
  uploadedBy?: { name: string };
  reviewedBy?: { name: string };
  createdAt: string;
}

interface CertificateRecord {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'needs_correction';
  feedback?: string;
  uploadedBy?: { name: string; _id: string };
  createdAt: string;
}

interface GroupsPageProps {
  role: 'admin' | 'mentor';
}

// ---------- Helpers ----------

const DOC_LABELS: Record<string, string> = {
  synopsis: 'Synopsis',
  ppt_stage_one: 'PPT (Stage 1)',
  first_project_report: 'Report',
  weekly_diary: 'Daily Diary',
  ppt_final: 'PPT (Stage 2)',
  final_report: 'Report',
  black_book: 'Black Book',
  report: 'Report',
  ppt: 'PPT',
  itr_report: 'ITR Report',
  offer_letter: 'Offer Letter',
  github_link: 'GitHub Repository Link',
};

function DocStatusBadge({ status }: { status: DocRecord['status'] }) {
  switch (status) {
    case 'approved':
    case 'verified':
      return <Badge className="bg-success text-success-foreground text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'needs_correction':
      return <Badge className="bg-warning text-warning-foreground text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Not Submitted</Badge>;
  }
}

// ---------- Component ----------

export default function GroupsPage({ role }: GroupsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);
  const [groupProgress, setGroupProgress] = useState(0);
  const { toast } = useToast();

  // Groups
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Documents for the selected group
  const [groupDocs, setGroupDocs] = useState<DocRecord[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('stage1');

  // Per-document review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Certificates for the selected group
  const [groupCerts, setGroupCerts] = useState<CertificateRecord[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  
  // Per-certificate review state
  const [reviewingCertId, setReviewingCertId] = useState<string | null>(null);
  const [certFeedbackText, setCertFeedbackText] = useState('');
  const [submittingCertReview, setSubmittingCertReview] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);
      const data = await apiGet<{ success: boolean; count: number; data: GroupRecord[] }>(
        `/groups?${params.toString()}`
      );
      if (data.success) {
        const sorted = data.data.sort((a, b) => {
          const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
          return numA - numB;
        });
        setGroups(sorted);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load groups.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDocuments = async (groupId: string) => {
    setDocsLoading(true);
    try {
      const data = await apiGet<{ success: boolean; data: DocRecord[] }>(`/documents/group/${groupId}`);
      if (data.success) setGroupDocs(data.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'mentor') { setShowGroups(true); fetchGroups(); }
    else if (showGroups) fetchGroups();
  }, [searchQuery, role]);

  const handleSelectGroup = (group: GroupRecord) => {
    setSelectedGroup(group);
    setGroupProgress(group.overallProgress);
    fetchGroupDocuments(group._id);
    fetchGroupCertificates(group);
  };

  const fetchGroupCertificates = async (group: GroupRecord) => {
    setCertsLoading(true);
    try {
      // Fetch only project certificates
      const data = await apiGet<{ success: boolean; data: CertificateRecord[] }>(`/certificates?category=project`);
      if (data.success && data.data) {
        const studentIds = group.members.map(m => m._id);
        const filtered = data.data.filter(c => c.uploadedBy && studentIds.includes(c.uploadedBy._id));
        setGroupCerts(filtered);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load certificates.', variant: 'destructive' });
    } finally {
      setCertsLoading(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = () => {
    if (academicYear && department) { setShowGroups(true); fetchGroups(); }
  };

  // Document review
  const submitReview = async (docId: string, status: 'approved' | 'needs_correction') => {
    if (status === 'needs_correction' && !feedbackText.trim()) {
      toast({ title: 'Feedback required', description: 'Please provide feedback for correction.', variant: 'destructive' });
      return;
    }
    try {
      setSubmittingReview(true);
      await apiPut<{ success: boolean; data: any }>(`/documents/${docId}/review`, {
        status,
        feedback: feedbackText,
      });
      toast({ title: 'Review submitted', description: `Document marked as ${status === 'approved' ? 'Approved' : 'Needs Correction'}.` });
      setReviewingId(null);
      setFeedbackText('');
      // Re-fetch docs and updated progress
      if (selectedGroup) {
        await fetchGroupDocuments(selectedGroup._id);
        // Refresh group progress from backend
        const gData = await apiGet<{ success: boolean; data: GroupRecord[] }>(`/groups?academicYear=${selectedGroup.academicYear}&department=${selectedGroup.department}`);
        if (gData.success) {
          const updated = gData.data.find(g => g._id === selectedGroup._id);
          if (updated) setGroupProgress(updated.overallProgress);
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to submit review.', variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Certificate review
  const submitCertReview = async (certId: string, status: 'approved' | 'needs_correction') => {
    if (status === 'needs_correction' && !certFeedbackText.trim()) {
      toast({ title: 'Feedback required', description: 'Please provide feedback for correction.', variant: 'destructive' });
      return;
    }
    try {
      setSubmittingCertReview(true);
      await apiPut<{ success: boolean; data: any }>(`/certificates/${certId}/review`, {
        status,
        feedback: certFeedbackText,
      });
      toast({ title: 'Review submitted', description: `Certificate marked as ${status === 'approved' ? 'Approved' : 'Needs Correction'}.` });
      setReviewingCertId(null);
      setCertFeedbackText('');
      if (selectedGroup) fetchGroupCertificates(selectedGroup);
    } catch {
      toast({ title: 'Error', description: 'Failed to submit certificate review.', variant: 'destructive' });
    } finally {
      setSubmittingCertReview(false);
    }
  };

  const stage1Docs = groupDocs.filter(d => d.stage === 1);
  const stage2Docs = groupDocs.filter(d => d.stage === 2);
  const stage3Docs = groupDocs.filter(d => d.stage === 3);

  const DocReviewTable = ({ docs }: { docs: DocRecord[] }) => {
    if (docs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
          <FolderOpen className="h-8 w-8" />
          <p className="text-sm">No documents uploaded yet.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>#</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc, idx) => {
              const label = DOC_LABELS[doc.type] || doc.type;
              const isReviewing = reviewingId === doc._id;
              const canReview = doc.status === 'pending' || doc.status === 'verifying';

              return (
                <>
                  <TableRow key={doc._id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          {doc.feedback && (
                            <p className="text-xs text-warning">{doc.feedback}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {doc.fileName || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.uploadedBy?.name || '—'}
                    </TableCell>
                    <TableCell><DocStatusBadge status={doc.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {/* View file */}
                        {doc.fileUrl && (
                          <Button
                            variant="ghost" size="sm" className="text-info h-8 px-2"
                            onClick={() => {
                              if (doc.fileUrl.startsWith('http')) {
                                window.open(doc.fileUrl, '_blank');
                              } else {
                                window.open(`http://localhost:5001${doc.fileUrl}`, '_blank');
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Review buttons for pending docs */}
                        {canReview && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success text-success-foreground h-8 text-xs"
                              disabled={submittingReview}
                              onClick={() => submitReview(doc._id, 'approved')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-warning text-warning h-8 text-xs"
                              onClick={() => {
                                setReviewingId(isReviewing ? null : doc._id);
                                setFeedbackText('');
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Needs Correction
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Inline feedback row */}
                  {isReviewing && (
                    <TableRow key={`${doc._id}-feedback`} className="bg-warning/5">
                      <TableCell colSpan={6}>
                        <div className="flex gap-3 items-end py-2 px-2">
                          <div className="flex-1">
                            <Label className="text-xs mb-1 block text-warning">Feedback for student (required)</Label>
                            <Textarea
                              rows={2}
                              placeholder="Describe what needs to be corrected..."
                              value={feedbackText}
                              onChange={e => setFeedbackText(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="border-warning text-warning h-9"
                              variant="outline"
                              disabled={submittingReview || !feedbackText.trim()}
                              onClick={() => submitReview(doc._id, 'needs_correction')}
                            >
                              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9" onClick={() => setReviewingId(null)}>
                              Cancel
                            </Button>
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
    );
  };

  const CertReviewTable = ({ certs }: { certs: CertificateRecord[] }) => {
    if (certs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
          <FolderOpen className="h-8 w-8" />
          <p className="text-sm">No certificates uploaded by this group yet.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>#</TableHead>
              <TableHead>Certificate Type</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.map((cert, idx) => {
              const friendlyType = cert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const isReviewing = reviewingCertId === cert._id;
              const canReview = cert.status === 'pending';

              return (
                <>
                  <TableRow key={cert._id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{friendlyType}</p>
                          {cert.feedback && (
                            <p className="text-xs text-warning">{cert.feedback}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cert.fileName || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {cert.uploadedBy?.name || '—'}
                    </TableCell>
                    <TableCell><DocStatusBadge status={cert.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {cert.fileUrl && (
                          <Button
                            variant="ghost" size="sm" className="text-info h-8 px-2"
                            onClick={() => window.open(`http://localhost:5001${cert.fileUrl}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canReview && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success text-success-foreground h-8 text-xs"
                              disabled={submittingCertReview}
                              onClick={() => submitCertReview(cert._id, 'approved')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-warning text-warning h-8 text-xs"
                              onClick={() => {
                                setReviewingCertId(isReviewing ? null : cert._id);
                                setCertFeedbackText('');
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Needs Correction
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isReviewing && (
                    <TableRow key={`${cert._id}-feedback`} className="bg-warning/5">
                      <TableCell colSpan={6}>
                        <div className="flex gap-3 items-end py-2 px-2">
                          <div className="flex-1">
                            <Label className="text-xs mb-1 block text-warning">Feedback for student (required)</Label>
                            <Textarea
                              rows={2}
                              placeholder="Describe what needs to be corrected in this certificate..."
                              value={certFeedbackText}
                              onChange={e => setCertFeedbackText(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="border-warning text-warning h-9"
                              variant="outline"
                              disabled={submittingCertReview || !certFeedbackText.trim()}
                              onClick={() => submitCertReview(cert._id, 'needs_correction')}
                            >
                              {submittingCertReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9" onClick={() => setReviewingCertId(null)}>
                              Cancel
                            </Button>
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
    );
  };

  // ---------- Group Detail View ----------
  if (selectedGroup) {
    const stage1Approved = stage1Docs.filter(d => d.status === 'approved' || d.status === 'verified').length;
    const stage2Approved = stage2Docs.filter(d => d.status === 'approved' || d.status === 'verified').length;
    const stage3Approved = stage3Docs.filter(d => d.status === 'approved' || d.status === 'verified').length;

    return (
      <DashboardLayout role={role}>
        <div className="space-y-6 animate-fade-in">
          {/* Back + Title */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(null); setGroupDocs([]); setReviewingId(null); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Groups
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedGroup.name} — Group Details</h1>
              <p className="text-muted-foreground">{selectedGroup.projectTitle}</p>
            </div>
          </div>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Completion Progress</CardTitle>
              <CardDescription>
                Stage 1: {stage1Approved}/{stage1Docs.length} approved ·
                Stage 2: {stage2Approved}/{stage2Docs.length} approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-bold text-lg">{groupProgress}%</span>
                </div>
                <Progress value={groupProgress} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>0%</span>
                  <span className="text-warning">50% — Stage 1 Complete</span>
                  <span className="text-info">99% — Stage 2 Complete</span>
                  <span className="text-success">100% — Stage 3 Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Enrollment No.</TableHead>
                        <TableHead>Roll No.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGroup.members.map(m => (
                        <TableRow key={m._id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="font-mono">{m.enrollmentNumber}</TableCell>
                          <TableCell>{m.rollNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Academic Year', value: selectedGroup.academicYear },
                    { label: 'Department', value: selectedGroup.department },
                    { label: 'Project Guide', value: selectedGroup.projectGuide },
                    { label: 'Members', value: `${selectedGroup.members.length} students` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Review Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />Document Review
              </CardTitle>
              <CardDescription>
                Review and approve documents submitted by this group. Approving all Stage 1 docs sets progress to 50%, all Stage 2 docs sets it to 99%.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading documents…</span>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="stage1" className="gap-2">
                      Stage 1 Documents
                      <Badge variant="secondary">{stage1Docs.length}</Badge>
                      {stage1Approved > 0 && (
                        <Badge className="bg-success text-success-foreground text-xs">{stage1Approved} approved</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="stage2" className="gap-2">
                      Stage 2 Documents
                      <Badge variant="secondary">{stage2Docs.length}</Badge>
                      {stage2Approved > 0 && (
                        <Badge className="bg-success text-success-foreground text-xs">{stage2Approved} approved</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="stage3" className="gap-2">
                      Stage 3 (GitHub Link)
                      {stage3Docs.length > 0 && <Badge variant="secondary">{stage3Docs.length}</Badge>}
                      {stage3Approved > 0 && (
                        <Badge className="bg-success text-success-foreground text-xs">{stage3Approved} approved</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="gap-2">
                      Certificates
                      <Badge variant="secondary">{groupCerts.length}</Badge>
                      {groupCerts.filter(c => c.status === 'approved').length > 0 && (
                        <Badge className="bg-success text-success-foreground text-xs">
                          {groupCerts.filter(c => c.status === 'approved').length} approved
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="stage1">
                    <DocReviewTable docs={stage1Docs} />
                  </TabsContent>
                  <TabsContent value="stage2">
                    <DocReviewTable docs={stage2Docs} />
                  </TabsContent>
                  <TabsContent value="stage3">
                    <DocReviewTable docs={stage3Docs} />
                  </TabsContent>
                  <TabsContent value="certificates">
                    {certsLoading ? (
                      <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading certificates…</span>
                      </div>
                    ) : (
                      <CertReviewTable certs={groupCerts} />
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // ---------- Groups List View ----------
  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups Management</h1>
          <p className="text-muted-foreground">View and manage student groups</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Groups</CardTitle>
            <CardDescription>Select academic year and department to view groups</CardDescription>
          </CardHeader>
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
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={handleView}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showGroups && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    {role === 'mentor' ? 'My Allotted Groups' : 'Groups List'}
                  </CardTitle>
                  <CardDescription>
                    {role === 'mentor'
                      ? `You have ${filteredGroups.length} assigned groups`
                      : `${department} - A.Y. ${academicYear} (${filteredGroups.length} groups)`}
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading groups...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGroups.map(group => (
                    <Card
                      key={group._id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectGroup(group)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {group.name}
                          </CardTitle>
                          <Badge variant="secondary">{group.members.length} members</Badge>
                        </div>
                        <CardDescription className="text-sm">{group.projectTitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{group.overallProgress}%</span>
                            </div>
                            <Progress value={group.overallProgress} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            {group.members.map(m => (
                              <div key={m._id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                                <span>{m.name}</span>
                                <span className="text-xs text-muted-foreground">Roll: {m.rollNumber}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Guide: {group.projectGuide}</p>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" />View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
