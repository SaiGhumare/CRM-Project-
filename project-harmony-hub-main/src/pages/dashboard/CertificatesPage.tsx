import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Award, Download, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend response type
interface CertificateRecord {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  verified: boolean;
  createdAt: string;
  uploadedBy?: {
    _id: string;
    name: string;
    enrollmentNumber?: string;
    rollNumber?: string;
    groupId?: string;
  };
  verifiedBy?: {
    _id: string;
    name: string;
  };
}

interface CertificatesPageProps {
  role: 'admin' | 'mentor';
}

export default function CertificatesPage({ role }: CertificatesPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showCertificates, setShowCertificates] = useState(false);
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);

      const data = await apiGet<{
        success: boolean;
        count: number;
        data: CertificateRecord[];
      }>(`/certificates?${params.toString()}`);

      if (data.success) {
        setCertificates(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast({ title: 'Error', description: 'Failed to load certificates.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showCertificates) {
      fetchCertificates();
    }
  }, [showCertificates]);

  const getStatusBadge = (verified: boolean) => {
    if (verified) return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  // Group by type
  const paperCerts = certificates.filter(c => c.type === 'paper_presentation');
  const competitionCerts = certificates.filter(c => c.type === 'project_competition');
  const otherCerts = certificates.filter(c => !['paper_presentation', 'project_competition'].includes(c.type));

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificate Management</h1>
          <p className="text-muted-foreground">Manage student certificates</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Certificates</CardTitle></CardHeader>
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
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowCertificates(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showCertificates && (
          loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Award className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{certificates.length}</p>
                    <p className="text-sm text-muted-foreground">Total Certificates</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold">{certificates.filter(c => c.verified).length}</p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 mx-auto text-warning mb-2" />
                    <p className="text-2xl font-bold">{certificates.filter(c => !c.verified).length}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
              </div>

              {/* Certificates Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />All Certificates — {academicYear}</CardTitle>
                  <CardDescription>{certificates.length} certificates found</CardDescription>
                </CardHeader>
                <CardContent>
                  {certificates.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No certificates found for this academic year.</p>
                  ) : (
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">S.No.</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Verified By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.map((cert, idx) => (
                            <TableRow key={cert._id} className="hover:bg-muted/30">
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell className="font-medium">{cert.uploadedBy?.name || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{cert.type.replace(/_/g, ' ')}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm max-w-[150px] truncate">{cert.fileName}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{new Date(cert.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(cert.verified)}</TableCell>
                              <TableCell>{cert.verifiedBy?.name || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
