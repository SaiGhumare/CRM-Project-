import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS, DocumentStatus } from '@/types';
import { 
  Eye, 
  FileText, 
  CheckCircle, 
  Clock, 
  Download,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

// Mock ITR data
interface MockITRDocument {
  id: string;
  studentName: string;
  enrollmentNumber: string;
  type: 'itr_report' | 'offer_letter';
  fileName: string;
  status: DocumentStatus;
  uploadedAt: string;
  companyName?: string;
}

const mockITRDocuments: MockITRDocument[] = [
  { id: '1', studentName: 'John Doe', enrollmentNumber: '2021CO001', type: 'offer_letter', fileName: 'offer_letter_techcorp.pdf', status: 'approved', uploadedAt: '2024-01-10', companyName: 'TechCorp Solutions' },
  { id: '2', studentName: 'John Doe', enrollmentNumber: '2021CO001', type: 'itr_report', fileName: 'itr_report_final.pdf', status: 'pending', uploadedAt: '2024-01-15', companyName: 'TechCorp Solutions' },
  { id: '3', studentName: 'Jane Smith', enrollmentNumber: '2021CO002', type: 'offer_letter', fileName: 'offer_letter_innovate.pdf', status: 'approved', uploadedAt: '2024-01-08', companyName: 'Innovate Labs' },
  { id: '4', studentName: 'Jane Smith', enrollmentNumber: '2021CO002', type: 'itr_report', fileName: 'itr_report.pdf', status: 'needs_correction', uploadedAt: '2024-01-12', companyName: 'Innovate Labs' },
  { id: '5', studentName: 'Bob Wilson', enrollmentNumber: '2021CO003', type: 'offer_letter', fileName: 'offer_letter.pdf', status: 'pending', uploadedAt: '2024-01-18', companyName: 'DataSoft Inc' },
];

interface ITRPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRPage({ role }: ITRPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);

  const handleView = () => {
    if (academicYear && department) {
      setShowDocuments(true);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'needs_correction':
        return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      default:
        return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeLabel = (type: 'itr_report' | 'offer_letter') => {
    return type === 'itr_report' ? 'ITR Report' : 'Offer Letter';
  };

  const getTypeIcon = (type: 'itr_report' | 'offer_letter') => {
    return type === 'itr_report' ? (
      <FileText className="h-5 w-5 text-primary" />
    ) : (
      <Briefcase className="h-5 w-5 text-info" />
    );
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Industrial Training (ITR)</h1>
          <p className="text-muted-foreground">Review ITR reports and offer letters</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter ITR Documents</CardTitle>
            <CardDescription>Select academic year and department to view ITR documents</CardDescription>
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

        {/* ITR Documents List */}
        {showDocuments && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                ITR Documents - {department}
              </CardTitle>
              <CardDescription>
                Industrial Training Reports and Offer Letters ({mockITRDocuments.length} documents)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockITRDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <p className="font-medium">{getTypeLabel(doc.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.studentName} ({doc.enrollmentNumber})
                        </p>
                        {doc.companyName && (
                          <p className="text-sm text-primary">
                            Company: {doc.companyName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {doc.status === 'pending' && (
                        <>
                          <Button size="sm" className="btn-success">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-warning border-warning hover:bg-warning/10">
                            Correction
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
