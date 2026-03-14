import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Briefcase, CalendarCheck, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Interfaces for ITR Data
interface DocStatus {
  url?: string;
  fileName?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ITRRecord {
  _id: string;
  companyName: string;
  startDate: string;
  endDate?: string;
  status: string;
  coordinatorId: { name: string } | null;
  dailyDetails: { date: string, hours: number }[];
  offerLetter?: DocStatus;
  projectReport?: DocStatus;
  certificate?: DocStatus;
}

export default function StudentITRPage() {
  const [itrRecord, setItrRecord] = useState<ITRRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('offerLetter');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchMyITR = async () => {
    try {
      const res = await apiGet<{ success: boolean; data: ITRRecord[] }>('/itr/me');
      if (res.success && res.data.length > 0) {
        setItrRecord(res.data[0]); // Get the most recent ITR
      }
    } catch (error) {
      console.error('Failed to fetch ITR details', error);
      toast({ title: 'Error', description: 'Failed to find ITR details', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyITR();
  }, []);

  const handleUpload = async () => {
    if (!file || !itrRecord) {
      toast({ title: 'No file', description: 'Please select a file to upload', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    try {
      const res = await apiPost<{ success: boolean; data: ITRRecord }>(
        `/itr/${itrRecord._id}/document`,
        formData,
        true // isFormData = true
      );
      if (res.success) {
        setItrRecord(res.data);
        setFile(null);
        toast({ title: 'Success', description: 'Document uploaded successfully', className: 'bg-success text-success-foreground' });
      }
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge className="bg-destructive text-destructive-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending': return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate attendance assuming 6 weeks * 5 days = 30 days total required for 100%
  const presentDays = itrRecord?.dailyDetails?.length || 0;
  const attendancePercentage = Math.min(Math.round((presentDays / 30) * 100), 100);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Dashboard</h1>
          <p className="text-muted-foreground">Manage your Industrial Training records and documents</p>
        </div>

        {!itrRecord ? (
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                No ITR Record Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">You currently do not have an active ITR assigned. Please contact the ITR Coordinator if you believe this is a mistake.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Training Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Training Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                    <p className="text-base font-semibold">{itrRecord.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-base font-semibold">{new Date(itrRecord.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={itrRecord.status === 'completed' ? 'default' : 'secondary'} className={itrRecord.status === 'completed' ? 'bg-success text-success-foreground' : ''}>
                      {itrRecord.status.charAt(0).toUpperCase() + itrRecord.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Coordinator</p>
                    <p className="text-base font-semibold">{itrRecord.coordinatorId?.name || 'Pending'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Attendance Progress
                </CardTitle>
                <CardDescription>Minimum 75% required for successful completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Attendance</span>
                    <span className="text-sm font-medium">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-2" indicatorClassName={attendancePercentage >= 75 ? 'bg-success' : 'bg-primary'} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 border rounded-xl bg-card">
                    <p className="text-3xl font-bold text-primary">{presentDays}</p>
                    <p className="text-xs text-muted-foreground mt-1">Days Present</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-card">
                    <p className="text-3xl font-bold text-muted-foreground">30</p>
                    <p className="text-xs text-muted-foreground mt-1">Days Required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ITR Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Your Documents
                </CardTitle>
                <CardDescription>Track the approval status of your submitted documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Document Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { type: 'Offer Letter', data: itrRecord.offerLetter },
                        { type: 'Project Report', data: itrRecord.projectReport },
                        { type: 'Certificate', data: itrRecord.certificate },
                      ].map((doc, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{doc.type}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.data?.fileName || 'Not uploaded'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doc.data?.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            {doc.data?.url ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={`http://localhost:5000${doc.data.url}`} target="_blank" rel="noreferrer">View</a>
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Document
                </CardTitle>
                <CardDescription>Select document type and upload your file (PDF, DOCX)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="space-y-2 w-full md:w-[250px]">
                    <Label>Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offerLetter">Offer Letter</SelectItem>
                        <SelectItem value="projectReport">Project Report</SelectItem>
                        <SelectItem value="certificate">Completion Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <Label>File</Label>
                    <Input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button 
                    className="btn-success w-full md:w-auto" 
                    onClick={handleUpload}
                    disabled={!file || uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload'}
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
