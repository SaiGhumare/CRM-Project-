import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, Shield, LogIn, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, description: 'Upload documents and abstracts' },
  { value: 'mentor', label: 'Project Mentor', icon: <Users className="h-5 w-5" />, description: 'Review and guide students' },
  { value: 'admin', label: 'Administrator (HOD)', icon: <Shield className="h-5 w-5" />, description: 'Full system access' },
  { value: 'itr_coordinator', label: 'ITR Coordinator', icon: <ClipboardCheck className="h-5 w-5" />, description: 'Manage ITR attendance & tracking' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        toast({
          title: 'Login Successful',
          description: `Welcome back! Redirecting to ${role} dashboard...`,
        });
        navigate(`/dashboard/${role}`);
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">
              Project Management System
            </CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select your role" />
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
                <p className="text-xs text-muted-foreground">
                  {ROLE_OPTIONS.find(r => r.value === role)?.description}
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@sandip.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Login Credentials Info */}
              {/* <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium text-muted-foreground mb-1">Login Credentials:</p>
                <p className="text-xs text-muted-foreground">Admin: admin@sandip.edu / admin123</p>
                <p className="text-xs text-muted-foreground">Mentor: vb.ohol@sandip.edu / mentor123</p>
                <p className="text-xs text-muted-foreground">Student: more.lalit.dilip@sandip.edu / student123</p>
                <p className="text-xs text-muted-foreground">ITR: itr@sandip.edu / itr123</p>
              </div> */}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full btn-success" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Are you the HOD?{' '}
                <Link to="/hod-register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        © 2025 Sandip Polytechnic. All rights reserved.
      </footer>
    </div>
  );
}
