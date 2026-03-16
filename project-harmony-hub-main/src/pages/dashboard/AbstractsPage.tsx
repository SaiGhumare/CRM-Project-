import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DEPARTMENTS, ACADEMIC_YEARS, AbstractStatus } from '@/types';
import { 
  Eye, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend abstract type
interface AbstractRecord {
  _id: string;
  title: string;
  description: string;
  status: AbstractStatus;
  createdAt: string;
  feedback?: string;
  groupId?: {
    _id: string;
    name: string;
    projectTitle: string;
    projectGuide: string;
  };
  submittedBy?: {
    _id: string;
    name: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: string;
}

interface AbstractsPageProps {
  role: 'admin' | 'mentor';
}

export default function AbstractsPage({ role }: AbstractsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showAbstracts, setShowAbstracts] = useState(false);
  const [selectedAbstract, setSelectedAbstract] = useState<AbstractRecord | null>(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  // Real data states
  const [abstracts, setAbstracts] = useState<AbstractRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch abstracts from backend
  const fetchAbstracts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);

      const data = await apiGet<{
        success: boolean;
        count: number;
        data: AbstractRecord[];
      }>(`/abstracts?${params.toString()}`);

      if (data.success) {
        setAbstracts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch abstracts:', error);
      toast({ title: 'Error', description: 'Failed to load abstracts.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // empty — fetch is triggered by handleView directly
  }, []);

  const handleView = () => {
    if (academicYear && department) {
      setShowAbstracts(true);
      fetchAbstracts();
    }
  };

  const getStatusBadge = (status: AbstractStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleAction = (abstract: AbstractRecord, action: 'approve' | 'reject') => {
    setSelectedAbstract(abstract);
    setActionType(action);
    setFeedback('');
    setDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedAbstract) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/abstracts/${selectedAbstract._id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: actionType === 'approve' ? 'approved' : 'rejected', feedback }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Success', description: `Abstract ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.` });
        fetchAbstracts(); // Refresh list
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update abstract.', variant: 'destructive' });
    }
    setDialogOpen(false);
    setSelectedAbstract(null);
    setActionType(null);
    setFeedback('');
  };

  const pendingCount = abstracts.filter(a => a.status === 'pending').length;
  const approvedCount = abstracts.filter(a => a.status === 'approved').length;
  const rejectedCount = abstracts.filter(a => a.status === 'rejected').length;

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abstracts Management</h1>
          <p className="text-muted-foreground">Review and approve student project abstracts</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Abstracts</CardTitle>
            <CardDescription>Select academic year and department to view abstracts</CardDescription>
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

              <Button className="btn-info" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Abstracts List */}
        {showAbstracts && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Abstracts - {department} ({abstracts.length} total)
                  </h2>
                  <div className="flex gap-2">
                    <Badge variant="outline">Pending: {pendingCount}</Badge>
                    <Badge variant="outline" className="text-success border-success">Approved: {approvedCount}</Badge>
                    <Badge variant="outline" className="text-destructive border-destructive">Rejected: {rejectedCount}</Badge>
                  </div>
                </div>

                {abstracts.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No abstracts found for this academic year.
                    </CardContent>
                  </Card>
                ) : (
                  abstracts.map((abstract) => (
                    <Card key={abstract._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              <CardTitle className="text-base">{abstract.title}</CardTitle>
                            </div>
                            <CardDescription>
                              Group: <span className="font-medium">{abstract.groupId?.name}</span> • 
                              Guide: <span className="font-medium">{abstract.groupId?.projectGuide}</span> •
                              Submitted by: <span className="font-medium">{abstract.submittedBy?.name}</span> •
                              Date: {new Date(abstract.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {getStatusBadge(abstract.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{abstract.description}</p>
                        
                        {abstract.feedback && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              <MessageSquare className="h-3 w-3 inline mr-1" />
                              Feedback ({abstract.reviewedBy?.name}):
                            </p>
                            <p className="text-sm">{abstract.feedback}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          {abstract.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="btn-success"
                                onClick={() => handleAction(abstract, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleAction(abstract, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve Abstract' : 'Reject Abstract'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? (abstracts.some(a => a.groupId?._id === selectedAbstract?.groupId?._id && a.status === 'approved' && a._id !== selectedAbstract?._id)
                    ? 'WARNING: This group already has an approved abstract. Approving this will replace the current selection.'
                    : 'This will approve the abstract and automatically reject all other pending submissions for this group.')
                  : 'Please provide feedback explaining why the abstract is being rejected.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Feedback / Comments</Label>
                <Textarea
                  placeholder={actionType === 'approve' 
                    ? 'Optional: Add any comments or suggestions...'
                    : 'Required: Explain why the abstract is rejected...'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className={actionType === 'approve' ? 'btn-success' : ''}
                variant={actionType === 'reject' ? 'destructive' : 'default'}
                onClick={handleSubmitAction}
                disabled={actionType === 'reject' && !feedback.trim()}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
