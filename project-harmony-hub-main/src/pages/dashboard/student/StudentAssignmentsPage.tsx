import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  ClipboardList, Upload, Eye, CheckCircle, XCircle, Clock,
  Loader2, Trash2, AlertCircle, Download, FileText
} from 'lucide-react';
import { apiGet, apiUpload, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  dueDate?: string;
  createdBy?: { name: string };
  createdAt: string;
}

interface Submission {
  _id: string;
  assignmentId: { _id: string; title: string };
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-assignment upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignRes, subRes] = await Promise.all([
        apiGet<{ success: boolean; data: Assignment[] }>('/assignments'),
        apiGet<{ success: boolean; data: Submission[] }>('/assignments/submissions/me'),
      ]);
      setAssignments(assignRes.data || []);
      setSubmissions(subRes.data || []);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getSubmissionForAssignment = (assignmentId: string) =>
    submissions.find(s => s.assignmentId?._id === assignmentId);

  const handleFileChange = (assignmentId: string, file: File | undefined) => {
    if (!file) return;
    setSelectedFiles(prev => ({ ...prev, [assignmentId]: file }));
  };

  const handleUpload = async (assignment: Assignment) => {
    const file = selectedFiles[assignment._id];
    if (!file) return toast.error('Please select a file to submit');

    try {
      setUploadingFor(assignment._id);
      const formData = new FormData();
      formData.append('file', file);
      await apiUpload(`/assignments/${assignment._id}/submit`, formData);
      toast.success('Assignment submitted successfully!');
      setSelectedFiles(prev => { const n = { ...prev }; delete n[assignment._id]; return n; });
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Submission failed');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!window.confirm('Delete this submission? You can then re-upload.')) return;
    try {
      await apiDelete(`/assignments/submissions/${submissionId}`);
      toast.success('Submission deleted');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">Download and submit your assignments posted by the ITR Coordinator.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <ClipboardList className="h-10 w-10" />
              <p className="text-sm">No assignments posted yet. Check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const submission = getSubmissionForAssignment(assignment._id);
              const isRejected = submission?.status === 'rejected';
              const isApproved = submission?.status === 'approved';

              return (
                <Card key={assignment._id} className={isRejected ? 'border-destructive/50' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {assignment.title}
                        </CardTitle>
                        {assignment.description && (
                          <CardDescription className="mt-1">{assignment.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {assignment.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {submission && getStatusBadge(submission.status)}
                        {!submission && <Badge variant="outline">Not Submitted</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Download Assignment */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{assignment.fileName}</p>
                        <p className="text-xs text-muted-foreground">Assignment PDF from ITR Coordinator</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`http://localhost:5001${assignment.fileUrl}`} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </a>
                      </Button>
                    </div>

                    {/* Rejection Feedback */}
                    {isRejected && submission?.feedback && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Rejected — Please re-submit</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{submission.feedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Your Submission */}
                    {submission && !isRejected && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{submission.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {new Date(submission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {submission.fileUrl && (
                            <Button variant="ghost" size="sm" className="text-info" asChild>
                              <a href={`http://localhost:5001${submission.fileUrl}`} target="_blank" rel="noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {!isApproved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDelete(submission._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upload / Re-upload Section */}
                    {(!submission || isRejected) && !isApproved && (
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        {isRejected && submission && (
                          <div className="text-xs text-muted-foreground sm:hidden">
                            Delete the rejected submission above, then re-upload your corrected file.
                          </div>
                        )}
                        {/* If rejected, must delete first */}
                        {isRejected && submission ? (
                          <div className="flex-1 p-3 rounded-lg bg-muted/30 border text-sm text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Delete your rejected submission above, then upload a new file here.
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 space-y-1.5">
                              <label className="text-sm font-medium">Your Submission (PDF)</label>
                              <Input
                                type="file"
                                accept=".pdf"
                                onChange={e => handleFileChange(assignment._id, e.target.files?.[0])}
                                key={selectedFiles[assignment._id] ? 'has-file' : 'no-file'}
                              />
                            </div>
                            <Button
                              className="btn-success w-full sm:w-auto"
                              disabled={!selectedFiles[assignment._id] || uploadingFor === assignment._id}
                              onClick={() => handleUpload(assignment)}
                            >
                              {uploadingFor === assignment._id ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                              ) : (
                                <><Upload className="h-4 w-4 mr-2" />Submit</>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
