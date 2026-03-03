import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Upload, Briefcase, CalendarCheck } from 'lucide-react';

export default function StudentITRPage() {
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
            <p className="text-sm text-muted-foreground text-center py-4">
              Your training details will appear here once ITR records are created by the coordinator.
            </p>
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
            <p className="text-sm text-muted-foreground text-center py-4">
              No attendance records available yet.
            </p>
          </CardContent>
        </Card>

        {/* Assignments Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assignments</CardTitle>
            <CardDescription>View your assignment approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No assignments to display.
            </p>
          </CardContent>
        </Card>

        {/* ITR Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ITR Documents</CardTitle>
            <CardDescription>View, upload, and download your ITR documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No documents uploaded yet.
            </p>
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
