import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Download, Eye, CheckCircle, AlertCircle, Clock, Briefcase, XCircle, CalendarCheck } from 'lucide-react';

interface ITRDocument {
  id: string;
  name: string;
  fileName?: string;
  status: 'not_uploaded' | 'pending' | 'approved' | 'correction_needed';
  feedback?: string;
  uploadedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  submittedAt: string;
  status: 'approved' | 'rejected' | 'pending';
  feedback?: string;
}

const itrDocuments: ITRDocument[] = [
  { id: '1', name: 'Offer Letter', fileName: 'OfferLetter_23611780192.pdf', status: 'approved', uploadedAt: '2025-01-05' },
  { id: '2', name: 'ITR Report', fileName: 'ITR_Report_23611780192.pdf', status: 'correction_needed', feedback: 'Please include weekly progress details in the report', uploadedAt: '2025-01-10' },
];

const attendanceData = {
  totalDays: 120,
  presentDays: 98,
  absentDays: 22,
  percentage: 81.67,
};

const assignments: Assignment[] = [
  { id: '1', title: 'Week 1 - Introduction & Setup', submittedAt: '2025-06-10', status: 'approved' },
  { id: '2', title: 'Week 2 - Database Design', submittedAt: '2025-06-17', status: 'approved' },
  { id: '3', title: 'Week 3 - API Development', submittedAt: '2025-06-24', status: 'rejected', feedback: 'Incomplete API documentation. Please add endpoint details.' },
  { id: '4', title: 'Week 4 - Frontend Integration', submittedAt: '2025-07-01', status: 'pending' },
];

export default function StudentITRPage() {
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

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Documents</h1>
          <p className="text-muted-foreground">Upload and manage your Industrial Training documents</p>
        </div>

        {/* Training Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Training Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">Tech Mahindra, Pune</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Technology</p>
                <p className="font-medium">Node.js, React</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">June 2025 - Dec 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Attendance
            </CardTitle>
            <CardDescription>Your ITR attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Attendance</span>
                <span className="font-bold">{attendanceData.percentage}%</span>
              </div>
              <Progress value={attendanceData.percentage} className="h-3" />
              {attendanceData.percentage < 75 && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Below 75% — certificate generation not eligible
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-foreground">{attendanceData.totalDays}</p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-success">{attendanceData.presentDays}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold text-destructive">{attendanceData.absentDays}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assignments</CardTitle>
            <CardDescription>View your assignment approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a, i) => (
                    <TableRow key={a.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.submittedAt}</TableCell>
                      <TableCell>
                        {a.status === 'approved' && <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>}
                        {a.status === 'rejected' && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                        {a.status === 'pending' && <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.feedback || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ITR Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ITR Documents</CardTitle>
            <CardDescription>View, upload, and download your ITR documents</CardDescription>
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
                  {itrDocuments.map((doc, index) => (
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
            <CardTitle className="text-lg">Upload ITR Document</CardTitle>
            <CardDescription>Select document type and upload your file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input type="file" accept=".pdf,.doc,.docx" />
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
