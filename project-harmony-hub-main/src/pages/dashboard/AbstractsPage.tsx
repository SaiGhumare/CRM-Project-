import { useState } from 'react';
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
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock abstract data
interface MockAbstract {
  id: string;
  groupName: string;
  title: string;
  description: string;
  status: AbstractStatus;
  submittedAt: string;
  feedback?: string;
}

const mockAbstracts: MockAbstract[] = [
  { 
    id: '1', 
    groupName: 'TechnoVision', 
    title: 'Smart Campus Management System', 
    description: 'A comprehensive system for managing campus resources including classrooms, labs, and equipment using IoT sensors and cloud-based analytics.',
    status: 'pending',
    submittedAt: '2024-01-15',
  },
  { 
    id: '2', 
    groupName: 'CodeCrafters', 
    title: 'AI-based Attendance System', 
    description: 'An automated attendance system using facial recognition technology to mark student attendance in real-time with anti-spoofing measures.',
    status: 'approved',
    submittedAt: '2024-01-10',
    feedback: 'Excellent concept with practical application. Proceed with implementation.',
  },
  { 
    id: '3', 
    groupName: 'DataMiners', 
    title: 'Predictive Analytics Dashboard', 
    description: 'A dashboard that uses machine learning to predict student performance and identify at-risk students for early intervention.',
    status: 'rejected',
    submittedAt: '2024-01-08',
    feedback: 'The scope is too broad. Please narrow down the focus area and resubmit.',
  },
  { 
    id: '4', 
    groupName: 'AI Squad', 
    title: 'Voice-Controlled Home Automation', 
    description: 'A low-cost home automation system with voice commands using natural language processing and IoT devices.',
    status: 'pending',
    submittedAt: '2024-01-14',
  },
];

interface AbstractsPageProps {
  role: 'admin' | 'mentor';
}

export default function AbstractsPage({ role }: AbstractsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showAbstracts, setShowAbstracts] = useState(false);
  const [selectedAbstract, setSelectedAbstract] = useState<MockAbstract | null>(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleView = () => {
    if (academicYear && department) {
      setShowAbstracts(true);
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

  const handleAction = (abstract: MockAbstract, action: 'approve' | 'reject') => {
    setSelectedAbstract(abstract);
    setActionType(action);
    setFeedback('');
    setDialogOpen(true);
  };

  const handleSubmitAction = () => {
    // In a real app, this would call an API
    console.log(`${actionType} abstract:`, selectedAbstract?.id, 'Feedback:', feedback);
    setDialogOpen(false);
    setSelectedAbstract(null);
    setActionType(null);
    setFeedback('');
  };

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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Abstracts - {department} ({mockAbstracts.length} total)
              </h2>
              <div className="flex gap-2">
                <Badge variant="outline">Pending: {mockAbstracts.filter(a => a.status === 'pending').length}</Badge>
                <Badge variant="outline" className="text-success border-success">Approved: {mockAbstracts.filter(a => a.status === 'approved').length}</Badge>
                <Badge variant="outline" className="text-destructive border-destructive">Rejected: {mockAbstracts.filter(a => a.status === 'rejected').length}</Badge>
              </div>
            </div>

            {mockAbstracts.map((abstract) => (
              <Card key={abstract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{abstract.title}</CardTitle>
                      </div>
                      <CardDescription>
                        Group: <span className="font-medium">{abstract.groupName}</span> • 
                        Submitted: {abstract.submittedAt}
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
                        Feedback:
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
            ))}
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
                  ? 'This will approve the abstract and notify the students.'
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
