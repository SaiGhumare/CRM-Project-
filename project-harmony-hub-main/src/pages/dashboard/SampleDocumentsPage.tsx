import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SAMPLE_DOCUMENT_TYPES } from '@/types';
import { Upload, Download, FileDown, FileText, Trash2 } from 'lucide-react';
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

// Real sample documents — files are served from the backend
const sampleDocs: SampleDocument[] = [
  { id: '1', type: 'PPT Stage One', fileName: 'Sample_ppt_template.pptx', fileUrl: '/uploads/samples/Sample_ppt_template.pptx', uploadedAt: '2026-02-27', uploadedBy: 'Admin' },
  { id: '2', type: 'Sponsorship Letter', fileName: 'Sponsorship_letter.doc', fileUrl: '/uploads/samples/Sponsorship_letter.doc', uploadedAt: '2026-02-27', uploadedBy: 'Admin' },
  { id: '3', type: 'Project Competition Certificate', fileName: 'Project_cert.doc', fileUrl: '/uploads/samples/Project_cert.doc', uploadedAt: '2026-02-27', uploadedBy: 'Admin' },
  { id: '4', type: 'Weekly Diary Format', fileName: 'Prog_weekly_assesment.doc', fileUrl: '/uploads/samples/Prog_weekly_assesment.doc', uploadedAt: '2026-02-27', uploadedBy: 'Admin' },
];

export default function SampleDocumentsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const filteredDocs = selectedType === 'all' ? sampleDocs : sampleDocs.filter(d => d.type === selectedType);

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
                <Select>
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
                <Input type="file" accept=".pdf,.doc,.docx,.pptx,.ppt" />
              </div>
              <Button className="btn-success">
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
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
                  {filteredDocs.map((doc) => (
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
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
