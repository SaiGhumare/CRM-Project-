import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, Search, FileText } from 'lucide-react';

const documentTypeLabels: Record<string, string> = {
  'black_book': 'Black Book',
  'sponsorship_letter': 'Sponsorship Letter',
};

interface OverallDocumentsPageProps {
  role: 'admin' | 'mentor';
}

export default function OverallDocumentsPage({ role }: OverallDocumentsPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [documentType, setDocumentType] = useState<string>('all');
  const [showDocuments, setShowDocuments] = useState(false);

  const handleView = () => {
    if (academicYear && department) {
      setShowDocuments(true);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overall Documents</h1>
          <p className="text-muted-foreground">Manage Black Book and Sponsorship Letter documents</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Documents</CardTitle>
            <CardDescription>Select academic year, department and document type</CardDescription>
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

              <div className="space-y-2 min-w-[200px]">
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Documents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="black_book">Black Book</SelectItem>
                    <SelectItem value="sponsorship_letter">Sponsorship Letter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-info" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {showDocuments && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents - {academicYear}</CardTitle>
              <CardDescription>No documents found for the selected filters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No documents have been uploaded yet for this academic year and department.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
