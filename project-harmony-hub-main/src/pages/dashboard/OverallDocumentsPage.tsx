import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, Search, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

interface OverallDocument {
  id: string;
  groupName: string;
  groupNumber: string;
  studentNames: string;
  documentType: 'black_book' | 'sponsorship_letter';
  fileName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_correction';
  uploadedAt: string;
}

// Mock document data
const mockDocuments: Record<string, OverallDocument[]> = {
  '2023-24': [
    { id: '1', groupName: 'TechVision', groupNumber: 'G01', studentNames: 'Rahul, Priya, Amit', documentType: 'black_book', fileName: 'BlackBook_G01.pdf', status: 'approved', uploadedAt: '2023-11-15' },
    { id: '2', groupName: 'TechVision', groupNumber: 'G01', studentNames: 'Rahul, Priya, Amit', documentType: 'sponsorship_letter', fileName: 'Sponsorship_G01.pdf', status: 'approved', uploadedAt: '2023-11-10' },
  ],
  '2024-25': [
    { id: '3', groupName: 'CodeMasters', groupNumber: 'G02', studentNames: 'Sneha, Rohan, Anjali', documentType: 'black_book', fileName: 'BlackBook_G02.pdf', status: 'approved', uploadedAt: '2024-10-20' },
  ],
  '2025-26': [
    { id: '4', groupName: 'DataMiners', groupNumber: 'G03', studentNames: 'Purva, Arpita, Rohit', documentType: 'black_book', fileName: 'BlackBook_G03.pdf', status: 'pending', uploadedAt: '2025-01-10' },
    { id: '5', groupName: 'DataMiners', groupNumber: 'G03', studentNames: 'Purva, Arpita, Rohit', documentType: 'sponsorship_letter', fileName: 'Sponsorship_G03.pdf', status: 'needs_correction', uploadedAt: '2025-01-08' },
    { id: '6', groupName: 'AI Squad', groupNumber: 'G04', studentNames: 'Vikram, Neha, Akash', documentType: 'black_book', fileName: 'BlackBook_G04.pdf', status: 'approved', uploadedAt: '2025-01-05' },
    { id: '7', groupName: 'WebWizards', groupNumber: 'G05', studentNames: 'Mayur, Sakshi, Varun', documentType: 'sponsorship_letter', fileName: 'Sponsorship_G05.pdf', status: 'rejected', uploadedAt: '2025-01-03' },
  ],
};

const documentTypeLabels = {
  'black_book': 'Black Book',
  'sponsorship_letter': 'Sponsorship Letter',
};

interface OverallDocumentsPageProps {
  role: 'admin' | 'mentor';
}

export default function OverallDocumentsPage({ role }: OverallDocumentsPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [documentType, setDocumentType] = useState<string>('all');
  const [showDocuments, setShowDocuments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentYearDocuments = mockDocuments[academicYear] || [];
  const isCurrentYear = academicYear === '2025-26';

  const filteredDocuments = currentYearDocuments.filter(doc => {
    const matchesSearch = doc.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.studentNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.groupNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = documentType === 'all' || doc.documentType === documentType;
    return matchesSearch && matchesType;
  });

  const handleView = () => {
    if (academicYear && department) {
      setShowDocuments(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'needs_correction':
        return <Badge className="bg-warning text-warning-foreground">Needs Correction</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overall Documents</h1>
          <p className="text-muted-foreground">Manage Black Book and Sponsorship Letter documents</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Documents</CardTitle>
            <CardDescription>Select academic year, department and document type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label} ({dept.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Documents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="black_book">Black Book</SelectItem>
                    <SelectItem value="sponsorship_letter">Sponsorship Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-info" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {showDocuments && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Documents - {academicYear}</CardTitle>
                  <CardDescription>{filteredDocuments.length} documents found</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by group..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[250px]"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Group</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium">{doc.groupName}</div>
                          <div className="text-xs text-muted-foreground">{doc.groupNumber}</div>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{doc.studentNames}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <FileText className="h-3 w-3" />
                            {documentTypeLabels[doc.documentType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{doc.fileName}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{doc.uploadedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="text-info">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {isCurrentYear && doc.status === 'pending' && (
                              <>
                                <Button variant="ghost" size="sm" className="text-success">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-warning">
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              </>
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
        )}
      </div>
    </DashboardLayout>
  );
}
