import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, Upload, Download, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  fileName?: string;
  status: 'not_uploaded' | 'pending' | 'verified' | 'correction_needed';
  feedback?: string;
  uploadedAt?: string;
}

const certificates: Certificate[] = [
  { 
    id: '1', 
    name: 'Paper Published Certificate', 
    fileName: 'PaperCert_23611780192.pdf', 
    status: 'verified', 
    uploadedAt: '2025-01-03' 
  },
  { 
    id: '2', 
    name: 'Udemy Certificate', 
    fileName: 'Udemy_React_23611780192.pdf', 
    status: 'pending', 
    uploadedAt: '2025-01-08' 
  },
  { 
    id: '3', 
    name: 'ITR Completion Certificate', 
    status: 'not_uploaded' 
  },
  { 
    id: '4', 
    name: 'Project Competition Certificate', 
    fileName: 'Competition_23611780192.pdf', 
    status: 'correction_needed',
    feedback: 'Certificate image is not clear. Please upload a higher quality scan.',
    uploadedAt: '2025-01-10' 
  },
];

export default function StudentCertificatesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'correction_needed':
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Correction Needed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Not Uploaded</Badge>;
    }
  };

  const verifiedCount = certificates.filter(c => c.status === 'verified').length;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">Upload and manage your achievement certificates</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{verifiedCount}</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {certificates.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">
                {certificates.filter(c => c.status === 'correction_needed').length}
              </p>
              <p className="text-sm text-muted-foreground">Need Correction</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {certificates.filter(c => c.status === 'not_uploaded').length}
              </p>
              <p className="text-sm text-muted-foreground">Not Uploaded</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certificates List
            </CardTitle>
            <CardDescription>View, upload, and download your certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Certificate Name</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert, index) => (
                    <TableRow key={cert.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-medium">{cert.name}</span>
                        </div>
                        {cert.feedback && (
                          <p className="text-xs text-warning mt-1">Feedback: {cert.feedback}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {cert.fileName ? (
                          <span className="text-sm font-mono">{cert.fileName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No file</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.uploadedAt || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {cert.fileName && (
                            <>
                              <Button variant="ghost" size="sm" className="text-info">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(cert.status === 'not_uploaded' || cert.status === 'correction_needed') && (
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
            <CardTitle className="text-lg">Upload New Certificate</CardTitle>
            <CardDescription>Select certificate type and upload your file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
              <Button className="btn-success">
                <Upload className="h-4 w-4 mr-2" />
                Upload Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
