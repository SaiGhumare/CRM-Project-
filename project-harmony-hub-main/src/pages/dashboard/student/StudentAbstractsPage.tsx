import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, CheckCircle, XCircle, AlertCircle, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiUpload, apiDelete } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AbstractRecord {
  _id: string;
  title: string;
  description: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
  groupId?: {
    _id: string;
    name: string;
    projectTitle: string;
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

export default function StudentAbstractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [abstracts, setAbstracts] = useState<AbstractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New abstract form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groupId = (user as any)?.groupId?._id || (user as any)?.groupId;

  // Fetch abstracts for the student's group
  const fetchAbstracts = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<{ success: boolean; count: number; data: AbstractRecord[] }>(
        `/abstracts/group/${groupId}`
      );
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
    fetchAbstracts();
  }, [groupId]);

  // Submit a new abstract
  const handleSubmit = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast({ title: 'Missing Fields', description: 'Please fill in both title and description.', variant: 'destructive' });
      return;
    }
    if (!groupId) {
      toast({ title: 'No Group', description: 'You must be assigned to a group before submitting an abstract.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      if (selectedFile) {
        // Upload with file
        const formData = new FormData();
        formData.append('title', newTitle.trim());
        formData.append('description', newDescription.trim());
        formData.append('groupId', groupId);
        formData.append('file', selectedFile);
        await apiUpload('/abstracts', formData);
      } else {
        // Submit without file
        await apiPost('/abstracts', {
          title: newTitle.trim(),
          description: newDescription.trim(),
          groupId,
        });
      }

      toast({ title: 'Abstract Submitted', description: 'Your abstract has been submitted for review.' });
      setNewTitle('');
      setNewDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      fetchAbstracts();
    } catch (error: any) {
      console.error('Failed to submit abstract:', error);
      toast({ title: 'Error', description: error.message || 'Failed to submit abstract.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (abstractId: string) => {
    if (!window.confirm("Are you sure you want to delete this abstract?")) return;
    try {
      await apiDelete(`/abstracts/${abstractId}`);
      toast({ title: 'Abstract Deleted', description: 'Your abstract has been successfully deleted.' });
      fetchAbstracts();
    } catch (error: any) {
      console.error('Failed to delete abstract:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete abstract.', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Pending Review</Badge>;
    }
  };

  const finalizedAbstract = abstracts.find(abs => abs.status === 'approved');
  const hasApproved = !!finalizedAbstract;
  const abstractLimit = 3;
  const canSubmit = !hasApproved && abstracts.length < abstractLimit;

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Abstract Submission</h1>
            <p className="text-muted-foreground text-sm">Submit up to {abstractLimit} abstract proposals for your project</p>
          </div>
          {groupId && (
            <div className="flex flex-col items-end gap-2">
              <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                Submitted: {abstracts.length} / {abstractLimit}
              </div>
              {!showForm && canSubmit && (
                <Button className="btn-success" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Abstract
                </Button>
              )}
            </div>
          )}
        </div>

        {/* No group warning */}
        {!groupId && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-warning mb-2" />
              <p className="font-medium">You are not assigned to any group yet.</p>
              <p className="text-sm text-muted-foreground">Contact your mentor or HOD to be assigned to a group before submitting abstracts.</p>
            </CardContent>
          </Card>
        )}

        {/* Approved banner */}
        {finalizedAbstract && (
          <Card className="border-success bg-success/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                Abstract Finalized
              </CardTitle>
              <CardDescription>
                Your abstract "{finalizedAbstract.title}" has been approved. You can now proceed with document submissions.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* New Abstract Form */}
        {showForm && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submit New Abstract
              </CardTitle>
              <CardDescription>Fill in your project abstract details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Abstract Title *</Label>
                <Input
                  placeholder="Enter your abstract title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Abstract Description *</Label>
                <Textarea
                  placeholder="Describe your project idea in detail..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Attach Document (Optional)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="btn-success" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Submit Abstract
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setNewTitle(''); setNewDescription(''); setSelectedFile(null); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Existing Abstracts List */}
        {!loading && abstracts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Abstracts ({abstracts.length})</h2>
            {abstracts.map((abstract, index) => (
              <Card key={abstract._id} className={abstract.status === 'approved' ? 'border-success' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      {abstract.title}
                    </CardTitle>
                    {getStatusBadge(abstract.status)}
                  </div>
                  <CardDescription>
                    Submitted on {new Date(abstract.createdAt).toLocaleDateString()} by {abstract.submittedBy?.name || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Feedback */}
                  {abstract.feedback && (
                    <div className={`p-3 rounded-lg ${
                      abstract.status === 'approved' ? 'bg-success/10 border border-success/20' :
                      'bg-destructive/10 border border-destructive/20'
                    }`}>
                      <p className="text-sm font-medium mb-1">
                        Feedback from {abstract.reviewedBy?.name || 'Reviewer'}:
                      </p>
                      <p className="text-sm text-muted-foreground">{abstract.feedback}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{abstract.description}</p>
                  </div>

                  {/* File download */}
                  {abstract.fileUrl && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm font-medium">Attached Document</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`${API_BASE.replace('/api', '')}${abstract.fileUrl}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`${API_BASE.replace('/api', '')}${abstract.fileUrl}`} download>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(abstract._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Abstract
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && groupId && abstracts.length === 0 && !showForm && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium text-lg mb-1">No abstracts submitted yet</p>
              <p className="text-sm text-muted-foreground mb-4">Click "New Abstract" to submit your first project abstract.</p>
              <Button className="btn-success" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Abstract
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>You can submit up to <strong>{abstractLimit}</strong> abstract proposals for your project.</li>
              <li>Any group member can submit an abstract, but the limit applies to the whole group.</li>
              <li>Your assigned mentor will review and provide feedback.</li>
              <li>Once <strong>any one</strong> abstract is approved:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li>It becomes your final project title.</li>
                  <li>All other submitted abstracts for your group will be automatically rejected.</li>
                  <li>Your project progress will increase by 10%.</li>
                </ul>
              </li>
              <li>If all abstracts are rejected and you have remaining attempts, you can submit new ones.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
