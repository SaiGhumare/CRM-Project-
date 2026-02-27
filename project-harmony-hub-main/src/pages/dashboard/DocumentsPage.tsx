import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Download, Upload, FolderOpen, CheckCircle, Clock, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend types
interface DocumentRecord {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  stage: number;
  createdAt: string;
  uploadedBy?: {
    _id: string;
    name: string;
    enrollmentNumber?: string;
  };
  groupId?: {
    _id: string;
    name: string;
    projectTitle: string;
    projectGuide: string;
    members?: { _id: string; name: string }[];
  };
}

interface DocumentsPageProps {
  role: 'admin' | 'mentor';
}

export default function DocumentsPage({ role }: DocumentsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showDocuments, setShowDocuments] = useState(false);
  const [docTab, setDocTab] = useState('current');
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);

      const data = await apiGet<{
        success: boolean;
        count: number;
        data: DocumentRecord[];
      }>(`/documents?${params.toString()}`);

      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast({ title: 'Error', description: 'Failed to load documents.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch triggered directly by handleView
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'needs_correction': return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      case 'pending': return <Badge className="bg-info text-info-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="secondary">Not Submitted</Badge>;
    }
  };

  // Group documents by group for summary view
  const groupSummaries = documents.reduce<Record<string, { groupName: string; projectTitle: string; projectGuide: string; docs: DocumentRecord[] }>>((acc, doc) => {
    const gid = doc.groupId?._id || 'unknown';
    if (!acc[gid]) {
      acc[gid] = {
        groupName: doc.groupId?.name || 'Unknown',
        projectTitle: doc.groupId?.projectTitle || '',
        projectGuide: doc.groupId?.projectGuide || '',
        docs: [],
      };
    }
    acc[gid].docs.push(doc);
    return acc;
  }, {});

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground">Review and manage student project documents</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Documents</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => { setShowDocuments(true); fetchDocuments(); }}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showDocuments && (
          loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={docTab} onValueChange={setDocTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="current">All Documents ({documents.length})</TabsTrigger>
                <TabsTrigger value="group_submitted">Group Summary ({Object.keys(groupSummaries).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Documents - {academicYear}</CardTitle>
                    <CardDescription>{documents.length} documents found</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No documents found for this academic year.</p>
                    ) : (
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[60px]">S.No.</TableHead>
                              <TableHead>Group</TableHead>
                              <TableHead>Uploaded By</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead>Guide</TableHead>
                              <TableHead>Stage</TableHead>
                              <TableHead>Document Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {documents.map((doc, idx) => (
                              <TableRow key={doc._id} className="hover:bg-muted/30">
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{doc.groupId?.name || '-'}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{doc.uploadedBy?.name || '-'}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{doc.groupId?.projectTitle || '-'}</TableCell>
                                <TableCell>{doc.groupId?.projectGuide || '-'}</TableCell>
                                <TableCell>Stage {doc.stage}</TableCell>
                                <TableCell>
                                  <Button variant="link" className="p-0 h-auto text-primary underline">{doc.type}</Button>
                                </TableCell>
                                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="text-info"><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                    {doc.status === 'pending' && (
                                      <>
                                        <Button size="sm" className="btn-success">Approve</Button>
                                        <Button size="sm" variant="destructive">Reject</Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="group_submitted" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(groupSummaries).map(([gid, group]) => {
                    const approvedDocs = group.docs.filter(d => d.status === 'approved').length;
                    const progressPercent = group.docs.length > 0 ? Math.round((approvedDocs / group.docs.length) * 100) : 0;
                    return (
                      <Card key={gid} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              {group.groupName}
                            </CardTitle>
                            <Badge variant="secondary">{approvedDocs}/{group.docs.length} docs</Badge>
                          </div>
                          <CardDescription className="text-sm">{group.projectTitle}</CardDescription>
                          <p className="text-xs text-muted-foreground">Guide: {group.projectGuide}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Documents Progress</span>
                                <span className="font-medium">{progressPercent}%</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-success flex items-center gap-1 mb-1"><CheckCircle className="h-3 w-3" />Approved</p>
                              <div className="flex flex-wrap gap-1">
                                {group.docs.filter(d => d.status === 'approved').length > 0 ? group.docs.filter(d => d.status === 'approved').map((d) => (
                                  <Badge key={d._id} className="bg-success text-success-foreground text-xs">{d.type}</Badge>
                                )) : <span className="text-xs text-muted-foreground">None</span>}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-warning flex items-center gap-1 mb-1"><Clock className="h-3 w-3" />Pending</p>
                              <div className="flex flex-wrap gap-1">
                                {group.docs.filter(d => d.status !== 'approved').map((d) => (
                                  <Badge key={d._id} variant="outline" className="text-warning border-warning text-xs">{d.type}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
