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
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No ITR coordinators assigned yet. Click "Add ITR Coordinator" to assign one.
                    </p>
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
                <p className="text-sm text-muted-foreground text-center py-8">
                  No students assigned to coordinators yet.
                </p>
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
              <p className="text-sm text-muted-foreground text-center py-8">
                No attendance records available yet.
              </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
