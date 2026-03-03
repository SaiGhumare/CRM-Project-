import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SAMPLE_DOCUMENT_TYPES } from '@/types';
import { Upload, Download, FileDown, FileText, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BASE_URL = API_URL.replace('/api', '');

interface SampleDocument {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export default function SampleDocumentsPage() {
  const [documents, setDocuments] = useState<SampleDocument[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  // Fetch documents from the backend
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/sample-documents`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to load documents', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not connect to server', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = selectedType === 'all' ? documents : documents.filter(d => d.type === selectedType);

  // Download a document
  const handleDownload = (doc: SampleDocument) => {
    const link = document.createElement('a');
    link.href = `${BASE_URL}${doc.fileUrl}`;
    link.download = doc.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Download Started', description: `Downloading ${doc.fileName}` });
  };

  // Delete a document
  const handleDelete = async (doc: SampleDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.fileName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/sample-documents/${encodeURIComponent(doc.fileName)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        toast({ title: 'Document Deleted', description: `${doc.fileName} has been removed.` });
      } else {
        toast({ title: 'Error', description: data.message || 'Failed to delete', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not connect to server', variant: 'destructive' });
    }
  };

  // Upload a new document
  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: 'Missing File', description: 'Please select a file to upload', variant: 'destructive' });
      return;
    }
    if (!uploadType) {
      toast({ title: 'Missing Type', description: 'Please select a document type', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    try {
      setUploading(true);
      const res = await fetch(`${API_URL}/sample-documents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => [data.data, ...prev]);
        toast({ title: 'Uploaded!', description: `${file.name} uploaded successfully.` });
        // Reset form
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadType('');
      } else {
        toast({ title: 'Upload Failed', description: data.message || 'Something went wrong', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not connect to server', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sample Documents (Format)</h1>
          <p className="text-muted-foreground">Upload and manage document format templates for students</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Sample Document</CardTitle>
            <CardDescription>Select document type and upload the format template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[250px]">
                <Label>Document Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[250px]">
                <Label>File</Label>
                <Input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.pptx,.ppt" />
              </div>
              <Button className="btn-success" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading…</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Upload Template</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter & List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Uploaded Templates
                </CardTitle>
                <CardDescription>{filteredDocs.length} templates available</CardDescription>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Document Types</SelectItem>
                  {SAMPLE_DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Uploaded Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No sample documents found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocs.map((doc) => (
                        <TableRow key={doc.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <FileText className="h-3 w-3" />
                              {doc.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{doc.fileName}</TableCell>
                          <TableCell>{doc.uploadedBy}</TableCell>
                          <TableCell>{doc.uploadedAt}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
