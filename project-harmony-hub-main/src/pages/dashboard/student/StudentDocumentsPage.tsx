import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Download, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  fileName?: string;
  status: 'not_uploaded' | 'pending' | 'approved' | 'correction_needed';
  feedback?: string;
  uploadedAt?: string;
}

const documents: Document[] = [
  { id: '1', name: 'Synopsis', type: 'synopsis', fileName: 'Synopsis_G01.pdf', status: 'approved', uploadedAt: '2025-01-10' },
  { id: '2', name: 'Black Book', type: 'black_book', status: 'not_uploaded' },
  { id: '3', name: 'PPT Final', type: 'ppt_final', status: 'not_uploaded' },
  { id: '4', name: 'PPT Stage One', type: 'ppt_stage1', fileName: 'PPT_Stage1_G01.pptx', status: 'approved', uploadedAt: '2025-01-05' },
  { id: '5', name: 'Sponsorship Letter', type: 'sponsorship', fileName: 'Sponsorship_G01.pdf', status: 'correction_needed', feedback: 'Please include company letterhead', uploadedAt: '2025-01-08' },
  { id: '6', name: 'Final Report', type: 'final_report', status: 'not_uploaded' },
  { id: '7', name: 'First Project Report', type: 'first_report', fileName: 'FirstReport_G01.pdf', status: 'pending', uploadedAt: '2025-01-12' },
  { id: '8', name: 'Weekly Diary', type: 'weekly_diary', fileName: 'WeeklyDiary_G01.pdf', status: 'approved', uploadedAt: '2025-01-01' },
];

export default function StudentDocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});

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
                              <Button variant="ghost" size="sm" className="text-info">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(doc.status === 'not_uploaded' || doc.status === 'correction_needed') && (
                            <Button variant="ghost" size="sm" className="text-success">
                              <Upload className="h-4 w-4" />
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
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" />
              </div>
              <Button className="btn-success">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
