import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Download, Eye, CheckCircle, AlertCircle, Clock, Loader2, Trash2 } from 'lucide-react';
import { apiGet, apiUpload, apiDelete } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  fileName?: string;
  status: 'not_uploaded' | 'pending' | 'approved' | 'correction_needed';
  feedback?: string;
  uploadedAt?: string;
}

// Type mapping to ensure documents array match exact formats
type DocumentType = 'synopsis' | 'black_book' | 'ppt_final' | 'ppt_stage_one' | 'sponsorship_letter' | 'final_report' | 'first_project_report' | 'weekly_diary';

// Fallback list of required documents if empty
const DEFAULT_REQUIRED_DOCS = [
  { type: 'synopsis', name: 'Synopsis' },
  { type: 'black_book', name: 'Black Book' },
  { type: 'ppt_final', name: 'PPT Final' },
  { type: 'ppt_stage_one', name: 'PPT Stage One' },
  { type: 'sponsorship_letter', name: 'Sponsorship Letter' },
  { type: 'final_report', name: 'Final Report' },
  { type: 'first_project_report', name: 'First Project Report' },
  { type: 'weekly_diary', name: 'Weekly Diary' }
];

export default function StudentDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Extract plain string ID — groupId may be a populated object or a raw string
      const gId = user?.groupId
        ? (typeof user.groupId === 'string'
          ? user.groupId
          : (user.groupId as any)?._id || (user.groupId as any)?.id || String(user.groupId))
        : null;
      const endpoint = gId ? `/documents?groupId=${gId}` : '/documents';
      const data = await apiGet<{ data: any[] }>(endpoint);

      // Merge fetched documents with required list
      const fetchedDocs = data.data || [];
      const formattedDocs = DEFAULT_REQUIRED_DOCS.map((reqDoc, index) => {
        const found = fetchedDocs.find((d: any) => d.type === reqDoc.type);
        if (found) {
          return {
            id: found._id,
            name: reqDoc.name,
            type: found.type,
            fileName: found.fileName,
            status: (found.status === 'verified' ? 'approved' : found.status) as Document['status'],
            feedback: found.feedback,
            uploadedAt: new Date(found.createdAt).toLocaleDateString()
          };
        }
        return {
          id: `req-${index}`,
          name: reqDoc.name,
          type: reqDoc.type,
          status: 'not_uploaded' as const
        };
      });

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Failed to fetch documents', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) {
      toast.error('Please select a file and document type');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);          // matches upload.single('file') in backend
      formData.append('type', uploadType);
      if (user?.groupId) {
        const gId = typeof user.groupId === 'string'
          ? user.groupId
          : (user.groupId as any)?._id || (user.groupId as any)?.id || String(user.groupId);
        formData.append('groupId', gId);
      }

      await apiUpload<{ success: boolean }>('/documents', formData); // POST /api/documents

      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setUploadType('');
      fetchDocuments(); // Refresh list
    } catch (error: any) {
      console.error('Upload failed', error);
      toast.error(error?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  const handleDelete = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"? This will remove it for all users.`)) return;
    try {
      await apiDelete<{ success: boolean }>(`/documents/${docId}`);
      toast.success(`"${docName}" deleted successfully`);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'correction_needed':
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Correction Needed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Not Uploaded</Badge>;
    }
  };

  const handleFileChange = (docId: string, file: File | null) => {
    setSelectedFile(prev => ({ ...prev, [docId]: file }));
  };

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const correctionCount = documents.filter(d => d.status === 'correction_needed').length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Documents</h1>
          <p className="text-muted-foreground">Upload and manage your project documents</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-success">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-muted-foreground">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-warning">{correctionCount}</p>
                  <p className="text-sm text-muted-foreground">Need Correction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{documents.length - approvedCount - pendingCount - correctionCount}</p>
                  <p className="text-sm text-muted-foreground">Not Uploaded</p>
                </CardContent>
              </Card>
            </div>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents List</CardTitle>
                <CardDescription>View, upload, and download your project documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Document Name</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc, index) => (
                        <TableRow key={doc.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                            {doc.feedback && (
                              <p className="text-xs text-warning mt-1">Feedback: {doc.feedback}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {doc.fileName ? (
                              <span className="text-sm font-mono">{doc.fileName}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">No file</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.uploadedAt || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {doc.fileName && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-info"
                                    onClick={async () => {
                                      if (doc.id && !doc.id.startsWith('req-')) {
                                        try {
                                          const res = await apiGet<{ data: { fileUrl: string } }>(`/documents/${doc.id}`);
                                          if (res.data.fileUrl) {
                                            window.open(`http://localhost:5001${res.data.fileUrl}`, '_blank');
                                          }
                                        } catch {
                                          toast.error('Could not open file');
                                        }
                                      }
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {doc.status === 'not_uploaded' || doc.status === 'correction_needed' ? (
                                <Button variant="ghost" size="sm" className="text-success">
                                  <Upload className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {/* Delete button — only for actually uploaded docs */}
                              {doc.fileName && !doc.id.startsWith('req-') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(doc.id, doc.name)}
                                >
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
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload New Document</CardTitle>
                <CardDescription>Select a document type and upload your file</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full md:w-auto">
                    <label className="text-sm font-medium mb-1 block">Document Type</label>
                    <select
                      className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      <option value="">Select Document Type</option>
                      {DEFAULT_REQUIRED_DOCS.map(doc => (
                        <option key={doc.type} value={doc.type}>{doc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">File</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                    />
                  </div>
                  <Button
                    className="btn-success w-full md:w-auto"
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFile || !uploadType}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
