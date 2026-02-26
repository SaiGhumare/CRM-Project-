import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Plus, Save, Upload, Download, Eye, Edit, Trash2, Users, ClipboardCheck, CalendarCheck, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ITRCoordinator {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  confirmationForm: string;
}

interface AssignedStudent {
  id: string;
  enrollmentNumber: string;
  name: string;
  technology: string;
  coordinator: string;
  company: string;
}

interface AttendanceRecord {
  id: string;
  enrollmentNumber: string;
  name: string;
  totalDays: number;
  presentDays: number;
  percentage: number;
  date: string;
  status: 'present' | 'absent' | 'leave';
}

const mockCoordinators: ITRCoordinator[] = [
  { id: '1', name: 'Prof. R. S. More', contactNumber: '9876543220', email: 'rsmore@sandip.edu', confirmationForm: 'confirmed' },
  { id: '2', name: 'Prof. M. N. Kale', contactNumber: '9876543221', email: 'mnkale@sandip.edu', confirmationForm: 'confirmed' },
];

const mockAssignedStudents: AssignedStudent[] = [
  { id: '1', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', technology: 'Node.js', coordinator: 'Prof. R. S. More', company: 'Tech Mahindra, Pune' },
  { id: '2', enrollmentNumber: '23611780234', name: 'Arpita Sanjay Galankar', technology: 'React', coordinator: 'Prof. R. S. More', company: 'Persistent, Nashik' },
  { id: '3', enrollmentNumber: '23611780356', name: 'Sneha Patil', technology: 'Python', coordinator: 'Prof. M. N. Kale', company: 'Infosys, Pune' },
];

const mockAttendance: AttendanceRecord[] = [
  { id: '1', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', totalDays: 30, presentDays: 28, percentage: 93, date: '2025-01-20', status: 'present' },
  { id: '2', enrollmentNumber: '23611780234', name: 'Arpita Sanjay Galankar', totalDays: 30, presentDays: 24, percentage: 80, date: '2025-01-20', status: 'present' },
  { id: '3', enrollmentNumber: '23611780356', name: 'Sneha Patil', totalDays: 30, presentDays: 20, percentage: 67, date: '2025-01-20', status: 'absent' },
];

export default function ITRCoordinatorPage() {
  const [activeTab, setActiveTab] = useState('assign');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCoordinator, setNewCoordinator] = useState({ name: '', contactNumber: '', email: '' });
  const { toast } = useToast();

  const handleAddCoordinator = () => {
    setIsAddDialogOpen(false);
    setNewCoordinator({ name: '', contactNumber: '', email: '' });
    toast({ title: 'Coordinator Added', description: 'ITR Coordinator has been assigned successfully.' });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage ITR coordinators, view assignments, and attendance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="assign">Assign Coordinator</TabsTrigger>
            <TabsTrigger value="view">View Assignments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="assign" className="space-y-4">
            <Tabs defaultValue="manual">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-success"><Plus className="h-4 w-4 mr-2" />Add ITR Coordinator</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign ITR Coordinator</DialogTitle>
                        <DialogDescription>Enter ITR coordinator details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={newCoordinator.name} onChange={(e) => setNewCoordinator({...newCoordinator, name: e.target.value})} placeholder="Prof. Name" /></div>
                        <div className="space-y-2"><Label>Contact Number</Label><Input value={newCoordinator.contactNumber} onChange={(e) => setNewCoordinator({...newCoordinator, contactNumber: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={newCoordinator.email} onChange={(e) => setNewCoordinator({...newCoordinator, email: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Confirmation Form</Label><Input type="file" accept=".pdf,.doc,.docx" /></div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="btn-success" onClick={handleAddCoordinator}><Save className="h-4 w-4 mr-2" />Save</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Card>
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ClipboardCheck className="h-5 w-5" />Assigned ITR Coordinators</CardTitle></CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Email</TableHead><TableHead>Confirmation</TableHead><TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockCoordinators.map(coord => (
                            <TableRow key={coord.id}>
                              <TableCell className="font-medium">{coord.name}</TableCell>
                              <TableCell>{coord.contactNumber}</TableCell>
                              <TableCell>{coord.email}</TableCell>
                              <TableCell><Badge className="bg-success text-success-foreground">Confirmed</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-info"><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upload">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Upload Coordinator List</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <Input type="file" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx" className="max-w-xs mx-auto" />
                      </div>
                      <Button className="btn-success"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Students with Assigned Coordinators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Enrollment No.</TableHead><TableHead>Name</TableHead><TableHead>Technology</TableHead><TableHead>Company</TableHead><TableHead>ITR Coordinator</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAssignedStudents.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono">{s.enrollmentNumber}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell><Badge variant="secondary">{s.technology}</Badge></TableCell>
                          <TableCell>{s.company}</TableCell>
                          <TableCell>{s.coordinator}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Attendance Records</CardTitle>
                <CardDescription>View attendance marked by ITR Coordinators. 75%+ required for certificate eligibility.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Enrollment No.</TableHead><TableHead>Name</TableHead><TableHead>Total Days</TableHead><TableHead>Present</TableHead><TableHead>Attendance %</TableHead><TableHead>Eligible</TableHead><TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAttendance.map(record => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono">{record.enrollmentNumber}</TableCell>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>{record.totalDays}</TableCell>
                          <TableCell>{record.presentDays}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress value={record.percentage} className="h-2 flex-1" />
                              <span className={`text-sm font-medium ${record.percentage >= 75 ? 'text-success' : 'text-destructive'}`}>{record.percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.percentage >= 75 ? <Badge className="bg-success text-success-foreground">Yes</Badge> : <Badge variant="destructive">No</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge className={record.status === 'present' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
