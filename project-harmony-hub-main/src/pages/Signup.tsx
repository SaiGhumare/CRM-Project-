import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, ClipboardCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// HOD can create accounts for these roles only
const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'mentor', label: 'Project Guide', icon: <Users className="h-4 w-4" /> },
  { value: 'itr_coordinator', label: 'ITR Coordinator', icon: <ClipboardCheck className="h-4 w-4" /> },
];

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    enrollmentNumber: '',
    rollNumber: '',
    department: '',
    division: '',
    className: '',
    academicYear: '',
    role: 'student' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { createUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        enrollmentNumber: formData.enrollmentNumber || undefined,
        rollNumber: formData.rollNumber || undefined,
        department: formData.department || undefined,
        division: formData.division || undefined,
        className: formData.className || undefined,
        academicYear: formData.academicYear || undefined,
      });

      if (result.success) {
        toast({
          title: 'Account Created',
          description: `${formData.role} account for ${formData.name} has been created successfully.`,
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          enrollmentNumber: '',
          rollNumber: '',
          department: '',
          division: '',
          className: '',
          academicYear: '',
          role: 'student',
        });
      } else {
        toast({
          title: 'Failed to Create Account',
          description: result.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Create User Account
          </CardTitle>
          <CardDescription>
            Create accounts for mentors, students, and ITR coordinators.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role to create" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@sandip.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNumber">Enrollment No.</Label>
                    <Input
                      id="enrollmentNumber"
                      type="text"
                      placeholder="23611780XXX"
                      value={formData.enrollmentNumber}
                      onChange={(e) => handleChange('enrollmentNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll No.</Label>
                    <Input
                      id="rollNumber"
                      type="text"
                      placeholder="01"
                      value={formData.rollNumber}
                      onChange={(e) => handleChange('rollNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleChange('department', value)}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
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
                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Input
                      id="division"
                      type="text"
                      placeholder="A / B"
                      value={formData.division}
                      onChange={(e) => handleChange('division', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class</Label>
                    <Input
                      id="className"
                      type="text"
                      placeholder="e.g. SE / TE / BE"
                      value={formData.className}
                      onChange={(e) => handleChange('className', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      type="text"
                      placeholder="e.g. 2025-26"
                      value={formData.academicYear}
                      onChange={(e) => handleChange('academicYear', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Department for mentor */}
            {formData.role === 'mentor' && (
              <div className="space-y-2">
                <Label htmlFor="dept-mentor">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                >
                  <SelectTrigger id="dept-mentor">
                    <SelectValue placeholder="Select department" />
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
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Set a password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm the password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full btn-success"
              disabled={isLoading}
            >
              {isLoading ? (
                'Creating Account...'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
