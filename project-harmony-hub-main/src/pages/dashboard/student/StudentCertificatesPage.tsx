import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Upload, Eye, CheckCircle, AlertCircle, Clock, Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { apiGet, apiUpload, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

interface CertificateRecord {
  _id: string;
  type: string;
  category: 'project' | 'itr';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'needs_correction';
  feedback?: string;
  createdAt: string;
}

const CERT_TYPES = [
  // ITR Certs
  { value: 'itr_certificate', label: 'ITR Completion Certificate', category: 'itr' },
  // Project Certs
  { value: 'published_paper', label: 'Paper Published Certificate', category: 'project' },
  { value: 'project_competition', label: 'Project Competition Certificate', category: 'project' },
  { value: 'udemy_course', label: 'Udemy Course Certificate', category: 'project' },
];

export default function StudentCertificatesPage() {
  const [certs, setCerts] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'project' | 'itr'>('project');
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ data: CertificateRecord[] }>('/certificates/me');
      setCerts(res.data || []);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'needs_correction':
        return <Badge className="bg-warning text-warning-foreground"><AlertCircle className="h-3 w-3 mr-1" />Needs Correction</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file');
    if (!selectedType) return toast.error('Please select a certificate type');
    
    // Safety check for max 10 for Project certificates only
    if (activeTab === 'project' && projectCerts.length >= 10) return toast.error('Maximum limit of 10 project certificates reached.');

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', selectedType);
      formData.append('category', activeTab);

      await apiUpload('/certificates', formData);
      toast.success('Certificate uploaded successfully');
      
      setSelectedFile(null);
      setSelectedType('');
      fetchCerts();
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await apiDelete(`/certificates/${id}`);
      toast.success('Certificate deleted');
      fetchCerts();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const projectCerts = certs.filter(c => c.category === 'project');
  const itrCerts = certs.filter(c => c.category === 'itr');
  const displayedCerts = activeTab === 'project' ? projectCerts : itrCerts;
  const availableTypes = CERT_TYPES.filter(t => t.category === activeTab);

  const approvedCount = projectCerts.filter(c => c.status === 'approved').length;
  const pendingCount = projectCerts.filter(c => c.status === 'pending').length;
  const correctionCount = projectCerts.filter(c => c.status === 'needs_correction').length;

  const getTypeName = (val: string) => CERT_TYPES.find(t => t.value === val)?.label || val;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">Upload and manage your achievement certificates</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v: string) => { setActiveTab(v as 'project'|'itr'); setSelectedType(''); }}>
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="project">Project Certificates</TabsTrigger>
              <TabsTrigger value="itr">ITR Certificates</TabsTrigger>
            </TabsList>
            
            <div className="mt-6 space-y-6">
              {/* Limit Warning (Only for Project) */}
              {activeTab === 'project' && projectCerts.length < 5 && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-warning bg-warning/10 text-warning-foreground">
                  <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-warning" />
                  <div>
                    <p className="font-semibold text-warning">Minimum Requirement Not Met</p>
                    <p className="text-sm text-muted-foreground">
                      You have currently uploaded {projectCerts.length} project certificates. You are required to upload a minimum of 5 certificates (maximum 10).
                    </p>
                  </div>
                </div>
              )}

              {/* Summary (Only for Project) */}
              {activeTab === 'project' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-success">{approvedCount}</p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-muted-foreground">{pendingCount}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-warning">{correctionCount}</p>
                      <p className="text-sm text-muted-foreground">Need Correction</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">
                        <span className={projectCerts.length >= 10 ? 'text-destructive' : 'text-primary'}>
                          {projectCerts.length}
                        </span>
                        <span className="text-muted-foreground text-lg">/10</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Uploaded (Max 10)</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Certificates Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    {activeTab === 'project' ? 'Your Project Certificates' : 'Your ITR Certificates'}
                  </CardTitle>
                  <CardDescription>View, upload, and download your certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  {displayedCerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No certificates uploaded yet. Use the form below to add them.
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Certificate Type</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedCerts.map((cert, index) => (
                            <TableRow key={cert._id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-primary shrink-0" />
                                  <div>
                                    <p className="font-medium text-sm">{getTypeName(cert.type)}</p>
                                    {cert.feedback && (
                                      <p className="text-xs text-warning flex items-center gap-1 mt-0.5">
                                        <AlertCircle className="h-3 w-3" /> {cert.feedback}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px] block">
                                  {cert.fileName}
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(cert.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(cert.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {cert.fileUrl && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-info"
                                      onClick={() => window.open(`http://localhost:5001${cert.fileUrl}`, '_blank')}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive"
                                    onClick={() => handleDelete(cert._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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

              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload New {activeTab === 'project' ? 'Project' : 'ITR'} Certificate</CardTitle>
                  <CardDescription>
                    {activeTab === 'project' ? 'Select certificate type and upload your file (Min 5, Max 10)' : 'Upload your official ITR completion certificate.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeTab === 'project' && projectCerts.length >= 10 ? (
                    <div className="p-4 bg-muted text-center rounded-lg text-muted-foreground border border-dashed">
                      You have reached the maximum allowed limit of 10 project certificates.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1 w-full sm:min-w-[200px] space-y-1.5">
                        <label className="text-sm font-medium">Type</label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTypes.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 w-full sm:min-w-[200px] space-y-1.5">
                        <label className="text-sm font-medium">File</label>
                        <Input 
                          type="file" 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                          key={selectedFile ? 'has-file' : 'no-file'}
                        />
                      </div>
                      <Button 
                        className="btn-success w-full sm:w-auto mt-4 sm:mt-0"
                        disabled={!selectedFile || !selectedType || uploading}
                        onClick={handleUpload}
                      >
                        {uploading ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" /> Upload</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
