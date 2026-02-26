import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react';

interface Abstract {
  id: number;
  title: string;
  description: string;
  fileName?: string;
  status: 'not_submitted' | 'pending' | 'approved' | 'correction_needed';
  feedback?: string;
}

const initialAbstracts: Abstract[] = [
  { 
    id: 1, 
    title: 'Smart Campus Management System', 
    description: 'A comprehensive system for managing campus activities including attendance, library, and events.',
    fileName: 'Abstract_1_SmartCampus.pdf',
    status: 'approved',
    feedback: 'Well written abstract. Proceed with implementation.'
  },
  { 
    id: 2, 
    title: 'AI-Based Attendance System', 
    description: 'Using facial recognition for automated attendance marking.',
    fileName: 'Abstract_2_AIAttendance.pdf',
    status: 'correction_needed',
    feedback: 'Please add more technical details about the AI model to be used.'
  },
  { 
    id: 3, 
    title: '', 
    description: '',
    status: 'not_submitted'
  },
];

export default function StudentAbstractsPage() {
  const [abstracts, setAbstracts] = useState<Abstract[]>(initialAbstracts);

  const handleAbstractChange = (id: number, field: 'title' | 'description', value: string) => {
    setAbstracts(prev => prev.map(abs => 
      abs.id === id ? { ...abs, [field]: value } : abs
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'correction_needed':
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Correction Needed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  const canEdit = (status: string) => status === 'not_submitted' || status === 'correction_needed';

  // Find the finalized abstract
  const finalizedAbstract = abstracts.find(abs => abs.status === 'approved');

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abstract Submission</h1>
          <p className="text-muted-foreground">Submit up to 3 abstract proposals for your project</p>
        </div>

        {/* Status Overview */}
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

        {/* Abstract Forms */}
        <div className="space-y-6">
          {abstracts.map((abstract, index) => (
            <Card key={abstract.id} className={abstract.status === 'approved' ? 'border-success' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    Abstract {index + 1}
                  </CardTitle>
                  {getStatusBadge(abstract.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feedback if any */}
                {abstract.feedback && (
                  <div className={`p-3 rounded-lg ${
                    abstract.status === 'approved' ? 'bg-success/10 border border-success/20' : 
                    'bg-warning/10 border border-warning/20'
                  }`}>
                    <p className="text-sm font-medium mb-1">Feedback from Mentor:</p>
                    <p className="text-sm text-muted-foreground">{abstract.feedback}</p>
                  </div>
                )}

                {/* Abstract Title */}
                <div className="space-y-2">
                  <Label>Abstract Title</Label>
                  <Input
                    placeholder="Enter your abstract title"
                    value={abstract.title}
                    onChange={(e) => handleAbstractChange(abstract.id, 'title', e.target.value)}
                    disabled={!canEdit(abstract.status)}
                  />
                </div>

                {/* Abstract Description */}
                <div className="space-y-2">
                  <Label>Abstract Description</Label>
                  <Textarea
                    placeholder="Describe your project idea in detail..."
                    value={abstract.description}
                    onChange={(e) => handleAbstractChange(abstract.id, 'description', e.target.value)}
                    disabled={!canEdit(abstract.status)}
                    rows={4}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Abstract Document (Optional)</Label>
                  {abstract.fileName ? (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm font-medium">{abstract.fileName}</span>
                      <Button variant="ghost" size="sm" className="text-info">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      disabled={!canEdit(abstract.status)}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                {canEdit(abstract.status) && (
                  <div className="flex gap-2 pt-2">
                    <Button className="btn-success">
                      <Save className="h-4 w-4 mr-2" />
                      {abstract.status === 'not_submitted' ? 'Submit Abstract' : 'Resubmit'}
                    </Button>
                    {abstract.fileName && (
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Replace File
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>You can submit up to 3 abstract proposals</li>
              <li>At least one abstract must be approved to proceed with the project</li>
              <li>Your mentor will review and provide feedback on each submission</li>
              <li>If corrections are needed, update the abstract and resubmit</li>
              <li>Once approved, you can view and download your finalized abstract</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
