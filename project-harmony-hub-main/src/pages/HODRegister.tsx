import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

export default function HODRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { registerHOD } = useAuth();
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
      const result = await registerHOD({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretCode: formData.secretCode,
      });

      if (result.success) {
        toast({
          title: 'HOD Account Created',
          description: 'Welcome! Redirecting to your dashboard...',
        });
        navigate('/dashboard/admin');
      } else {
        toast({
          title: 'Registration Failed',
          description: result.message || 'Invalid secret code or account already exists.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create HOD account. Please try again.',
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
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              HOD Registration
            </CardTitle>
            <CardDescription>
              Create the Head of Department account. A valid secret code is required.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
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
                  placeholder="hod@kbtcoe.org"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Secret Code */}
              <div className="space-y-2">
                <Label htmlFor="secretCode" className="flex items-center gap-1">
                  <KeyRound className="h-4 w-4" />
                  HOD Secret Code
                </Label>
                <Input
                  id="secretCode"
                  type="password"
                  placeholder="Enter the HOD secret code"
                  value={formData.secretCode}
                  onChange={(e) => handleChange('secretCode', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This code is provided by your system administrator.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full btn-success"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Creating HOD Account...'
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create HOD Account
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        © 2025 KBTCOE. All rights reserved.
      </footer>
    </div>
  );
}
