import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Upload, Eye, CheckCircle, AlertCircle, Clock, Loader2, Trash2,
  Lock, Unlock, AlertTriangle,
} from 'lucide-react';
import { apiGet, apiUpload, apiDelete, apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ---------- Constants ----------

interface DocConfig {
  type: string;
  name: string;
  stage: 1 | 2 | 3;
}

const STAGE_1_DOCS: DocConfig[] = [
  { type: 'synopsis',            name: 'Synopsis',           stage: 1 },
  { type: 'ppt_stage_one',       name: 'PPT (Stage 1)',      stage: 1 },
  { type: 'first_project_report',name: 'Report',             stage: 1 },
  { type: 'weekly_diary',        name: 'Daily Diary',        stage: 1 },
];

const STAGE_2_DOCS: DocConfig[] = [
  { type: 'ppt_final',           name: 'PPT (Stage 2)',      stage: 2 },
  { type: 'weekly_diary',        name: 'Daily Diary',        stage: 2 },
  { type: 'final_report',        name: 'Report',             stage: 2 },
  { type: 'black_book',          name: 'Black Book',         stage: 2 },
  { type: 'sponsorship_letter',  name: 'Sponsorship Letter', stage: 2 },
];

const STAGE_3_DOCS: DocConfig[] = [
  { type: 'github_link', name: 'GitHub Repository Link', stage: 3 }
];

// ---------- Types ----------

interface DocRecord {
  id: string;
  name: string;
  type: string;
  stage: 1 | 2 | 3;
  fileName?: string;
  fileUrl?: string;
  status: 'not_uploaded' | 'pending' | 'approved' | 'needs_correction' | 'verified';
  feedback?: string;
  uploadedAt?: string;
}

// ---------- Helper: Status Badge ----------

function StatusBadge({ status }: { status: DocRecord['status'] }) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'needs_correction':
      return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
    case 'pending':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    default:
      return <Badge variant="outline">Not Uploaded</Badge>;
  }
}

// ---------- Helper: resolve groupId ----------

function resolveGroupId(groupId: unknown): string | null {
  if (!groupId) return null;
  if (typeof groupId === 'string') return groupId;
  const obj = groupId as any;
  return obj?._id || obj?.id || String(groupId);
}

// ---------- Main Component ----------

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('stage1');

  // Per-row upload state
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { fetchDocuments(); }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const gId = resolveGroupId(user?.groupId);
      const endpoint = gId ? `/documents?groupId=${gId}` : '/documents';
      const data = await apiGet<{ data: any[] }>(endpoint);
      const fetched = data.data || [];

      const mapDoc = (cfg: DocConfig, stageHint: 1 | 2 | 3): DocRecord => {
        const found = fetched.find((d: any) => d.type === cfg.type && d.stage === stageHint);
        if (found) {
          return {
            id: found._id,
            name: cfg.name,
            type: cfg.type,
            stage: stageHint,
            fileName: found.fileName,
            fileUrl: found.fileUrl,
            status: found.status === 'verified' ? 'approved' : found.status,
            feedback: found.feedback,
            uploadedAt: new Date(found.createdAt).toLocaleDateString(),
          };
        }
        return { id: `${cfg.type}-${stageHint}`, name: cfg.name, type: cfg.type, stage: stageHint, status: 'not_uploaded' };
      };

      setDocs([
        ...STAGE_1_DOCS.map(c => mapDoc(c, 1)),
        ...STAGE_2_DOCS.map(c => mapDoc(c, 2)),
        ...STAGE_3_DOCS.map(c => mapDoc(c, 3)),
      ]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const stage1Docs = docs.filter(d => d.stage === 1);
  const stage2Docs = docs.filter(d => d.stage === 2);
  const stage3Docs = docs.filter(d => d.stage === 3);

  const stage1AllUploaded = stage1Docs.every(d => d.status !== 'not_uploaded');
  
  // For stage 2 completion, weekly_diary is an ongoing submission, so we exclude it from the required completion check
  const requiredStage2Docs = stage2Docs.filter(d => d.type !== 'weekly_diary');
  const stage2AllApproved = requiredStage2Docs.every(d => d.status === 'approved' || d.status === 'verified');

  const stage1ApprovedCount = stage1Docs.filter(d => d.status === 'approved' || d.status === 'verified').length;
  const stage2ApprovedCount = stage2Docs.filter(d => d.status === 'approved' || d.status === 'verified').length;

  const handleFileSelect = (key: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [key]: file }));
  };

  const [githubLink, setGithubLink] = useState('');
  
  const handleLinkUpload = async (doc: DocRecord) => {
    if (!githubLink.trim()) { toast.error('Please enter a valid GitHub link'); return; }
    
    const gId = resolveGroupId(user?.groupId);
    if (!gId) { toast.error('No group found. Please join a group first.'); return; }

    try {
      setUploading(prev => ({ ...prev, [`${doc.type}-3`]: true }));
      await apiPost<{ success: boolean }>('/documents/link', {
        type: doc.type,
        groupId: gId,
        stage: 3,
        link: githubLink.trim()
      });
      toast.success(`${doc.name} submitted successfully`);
      setGithubLink('');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err?.message || 'Link submission failed');
    } finally {
      setUploading(prev => ({ ...prev, [`${doc.type}-3`]: false }));
    }
  };

  const handleUpload = async (doc: DocRecord) => {
    const key = `${doc.type}-${doc.stage}`;
    const file = selectedFiles[key];
    if (!file) { toast.error('Please select a file first'); return; }

    const gId = resolveGroupId(user?.groupId);
    if (!gId) { toast.error('No group found. Please join a group first.'); return; }

    try {
      setUploading(prev => ({ ...prev, [key]: true }));
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', doc.type);
      formData.append('groupId', gId);
      formData.append('stage', String(doc.stage));

      await apiUpload<{ success: boolean }>('/documents', formData);
      toast.success(`${doc.name} uploaded successfully`);
      setSelectedFiles(prev => ({ ...prev, [key]: null }));
      if (fileInputRefs.current[key]) fileInputRefs.current[key]!.value = '';
      fetchDocuments();
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (doc: DocRecord) => {
    if (doc.id.startsWith(`${doc.type}-`)) return; // placeholder
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    try {
      await apiDelete<{ success: boolean }>(`/documents/${doc.id}`);
      toast.success(`"${doc.name}" deleted`);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const handleView = async (doc: DocRecord) => {
    if (doc.id.startsWith(`${doc.type}-`)) return;
    if (doc.type === 'github_link' && doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
      return;
    }
    // General check for external links
    if (doc.fileUrl?.startsWith('http')) {
      window.open(doc.fileUrl, '_blank');
      return;
    }

    try {
      const res = await apiGet<{ data: { fileUrl: string } }>(`/documents/${doc.id}`);
      if (res.data?.fileUrl) window.open(`http://localhost:5001${res.data.fileUrl}`, '_blank');
    } catch { toast.error('Could not open file'); }
  };

  const DocTable = ({ rows, stage }: { rows: DocRecord[]; stage: 1 | 2 }) => {
    const locked = stage === 2 && !stage1AllUploaded;
    return (
      <div className="space-y-4">
        {locked && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-warning-foreground">
            <Lock className="h-5 w-5 mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-warning">Stage 2 Locked</p>
              <p className="text-sm text-muted-foreground">
                You must upload all Stage 1 documents before you can upload Stage 2 documents.
              </p>
            </div>
          </div>
        )}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-8">#</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((doc, idx) => {
                const key = `${doc.type}-${doc.stage}`;
                const isLocked = locked;
                const canUpload = !isLocked && (doc.status === 'not_uploaded' || doc.status === 'needs_correction');
                const file = selectedFiles[key];
                const isUploading = uploading[key];
                const isReal = !doc.id.startsWith(`${doc.type}-`);

                return (
                  <TableRow key={key} className={`hover:bg-muted/30 ${isLocked ? 'opacity-50' : ''}`}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          {doc.feedback && (
                            <p className="text-xs text-warning flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3" /> {doc.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {doc.fileName || <span className="italic">—</span>}
                    </TableCell>
                    <TableCell><StatusBadge status={doc.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.uploadedAt || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 items-end">
                        {/* View / Delete for uploaded docs */}
                        <div className="flex gap-1">
                          {isReal && (
                            <>
                              <Button variant="ghost" size="sm" className="text-info h-8 px-2" onClick={() => handleView(doc)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleDelete(doc)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        {/* Upload row */}
                        {canUpload && (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.ppt,.pptx"
                              className="text-xs max-w-[180px]"
                              ref={el => { fileInputRefs.current[key] = el; }}
                              onChange={e => handleFileSelect(key, e.target.files?.[0] || null)}
                            />
                            <Button
                              size="sm"
                              className="btn-success h-8"
                              disabled={!file || isUploading}
                              onClick={() => handleUpload(doc)}
                            >
                              {isUploading
                                ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading</>
                                : <><Upload className="h-3.5 w-3.5 mr-1" />Upload</>}
                            </Button>
                          </div>
                        )}
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Documents</h1>
          <p className="text-muted-foreground">Upload and manage your Stage 1 and Stage 2 project documents</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-success">{stage1ApprovedCount}</p>
                  <p className="text-sm text-muted-foreground">Stage 1 Approved</p>
                  <Progress value={(stage1ApprovedCount / STAGE_1_DOCS.length) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-info">{stage2ApprovedCount}</p>
                  <p className="text-sm text-muted-foreground">Stage 2 Approved</p>
                  <Progress value={(stage2ApprovedCount / STAGE_2_DOCS.length) * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-warning">
                    {docs.filter(d => d.status === 'needs_correction').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Need Correction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {stage1AllUploaded
                      ? <Unlock className="h-5 w-5 text-success" />
                      : <Lock className="h-5 w-5 text-warning" />}
                  </div>
                  <p className="text-sm font-medium">
                    {stage1AllUploaded ? 'Stage 2 Unlocked' : 'Stage 2 Locked'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stage1Docs.filter(d => d.status !== 'not_uploaded').length}/{STAGE_1_DOCS.length} uploaded
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="stage1" className="gap-2">
                  Stage 1 Documents
                  <Badge variant="secondary">{STAGE_1_DOCS.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="stage2" className="gap-2">
                  {stage1AllUploaded ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  Stage 2 Documents
                  <Badge variant="secondary">{STAGE_2_DOCS.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="stage3" className="gap-2">
                  {stage2AllApproved ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  Stage 3 (GitHub Link)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stage1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stage 1 Documents</CardTitle>
                    <CardDescription>
                      Synopsis, PPT, Report, and Daily Diary — upload all 4 to unlock Stage 2.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocTable rows={stage1Docs} stage={1} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stage2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Stage 2 Documents
                      {stage1AllUploaded
                        ? <Badge className="bg-success text-success-foreground text-xs">Unlocked</Badge>
                        : <Badge className="bg-warning text-warning-foreground text-xs">Locked</Badge>}
                    </CardTitle>
                    <CardDescription>
                      PPT, Daily Diary, Report, Black Book, and Sponsorship Letter — available after all Stage 1 uploads.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocTable rows={stage2Docs} stage={2} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stage3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Stage 3 — GitHub Link
                      {stage2AllApproved
                        ? <Badge className="bg-success text-success-foreground text-xs">Unlocked</Badge>
                        : <Badge className="bg-warning text-warning-foreground text-xs">Locked</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Submit your project's GitHub repository link once all Stage 2 documents are approved.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!stage2AllApproved ? (
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-warning-foreground mb-4">
                        <Lock className="h-5 w-5 mt-0.5 shrink-0 text-warning" />
                        <div>
                          <p className="font-semibold text-warning">Stage 3 Locked</p>
                          <p className="text-sm text-muted-foreground">
                            You must obtain approval for all required Stage 2 documents before submitting your GitHub link.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-lg border overflow-hidden mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-8">#</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stage3Docs.map((doc, idx) => {
                            const key = `${doc.type}-${doc.stage}`;
                            const isLocked = !stage2AllApproved;
                            const canUpload = !isLocked && (doc.status === 'not_uploaded' || doc.status === 'needs_correction');
                            const isUploading = uploading[key];
                            const isReal = doc.status !== 'not_uploaded';

                            return (
                              <TableRow key={key} className={`hover:bg-muted/30 ${isLocked ? 'opacity-50' : ''}`}>
                                <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <div>
                                      <p className="font-medium text-sm">{doc.name}</p>
                                      {doc.feedback && (
                                        <p className="text-xs text-warning flex items-center gap-1 mt-0.5">
                                          <AlertTriangle className="h-3 w-3" /> {doc.feedback}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground font-mono">
                                  {isReal && doc.fileUrl ? (
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                                      {doc.fileUrl.length > 30 ? doc.fileUrl.substring(0, 30) + '...' : doc.fileUrl}
                                    </a>
                                  ) : <span className="italic">—</span>}
                                </TableCell>
                                <TableCell><StatusBadge status={doc.status} /></TableCell>
                                <TableCell className="text-sm text-muted-foreground">{doc.uploadedAt || '—'}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-1">
                                      {isReal && (
                                        <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => handleDelete(doc)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    {canUpload && (
                                      <div className="flex items-center gap-2 flex-wrap justify-end">
                                        <input
                                          type="url"
                                          placeholder="https://github.com/..."
                                          className="text-sm px-2 py-1 max-w-[220px] border rounded"
                                          value={githubLink}
                                          onChange={(e) => setGithubLink(e.target.value)}
                                        />
                                        <Button
                                          size="sm"
                                          className="btn-success h-8"
                                          disabled={!githubLink || isUploading}
                                          onClick={() => handleLinkUpload(doc)}
                                        >
                                          {isUploading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Submitting</> : 'Submit'}
                                        </Button>
                                      </div>
                                    )}
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
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
