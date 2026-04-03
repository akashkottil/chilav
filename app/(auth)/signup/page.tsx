'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SignupPageContent() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingInvitation, setCheckingInvitation] = useState(true);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<{ fromEmail?: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const invitationToken = searchParams?.get('token') || null;

  useEffect(() => {
    checkInvitationRequirement();
  }, []);

  const checkInvitationRequirement = async () => {
    try {
      if (invitationToken) {
        const { data: invitation, error: invError } = await supabase
          .from('partner_invitations')
          .select('*, from_user_id, to_email, expires_at, status')
          .eq('token', invitationToken)
          .single();

        if (invError || !invitation) {
          setInvitationValid(false);
          setError('Invalid or expired invitation token.');
        } else {
          const now = new Date();
          const expiresAt = new Date(invitation.expires_at);

          if (invitation.status !== 'pending') {
            setInvitationValid(false);
            setError(`This invitation has been ${invitation.status}.`);
          } else if (expiresAt < now) {
            setInvitationValid(false);
            setError('This invitation has expired.');
          } else {
            setInvitationValid(true);
            if (invitation.to_email) {
              setEmail(invitation.to_email);
            }
            setInvitationInfo({});
          }
        }
      } else {
        setInvitationValid(true);
      }
    } catch (err) {
      console.error('Error checking invitation:', err);
      setInvitationValid(true);
    } finally {
      setCheckingInvitation(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (invitationToken && !invitationValid) {
        setError('Please use a valid invitation link to sign up.');
        setLoading(false);
        return;
      }

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      if (!signupData.user) {
        setError('Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      if (invitationToken && invitationValid) {
        const { data: invitation } = await supabase
          .from('partner_invitations')
          .select('from_user_id')
          .eq('token', invitationToken)
          .single();

        if (invitation) {
          const userId1 = invitation.from_user_id < signupData.user.id
            ? invitation.from_user_id
            : signupData.user.id;
          const userId2 = invitation.from_user_id < signupData.user.id
            ? signupData.user.id
            : invitation.from_user_id;

          const { data: partnerData, error: partnerError } = await supabase
            .from('partners')
            .insert({
              user1_id: userId1,
              user2_id: userId2,
              status: 'active',
              initiated_by: invitation.from_user_id,
            })
            .select()
            .single();

          if (partnerError) {
            console.error('Error creating partner relationship:', partnerError);
            setError('Account created successfully, but partner linking failed. Please contact support or try linking manually from Settings.');
          }

          await supabase
            .from('partner_invitations')
            .update({ status: 'accepted' })
            .eq('token', invitationToken);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (checkingInvitation) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Validating invitation...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--primary)]/30 border-t-[var(--primary)] animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitationToken && !invitationValid) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-3 text-sm text-[var(--danger)]">
            {error || 'Please contact your partner for a new invitation link.'}
          </div>
          <div className="text-center">
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Account Created!</CardTitle>
          <CardDescription>Redirecting to dashboard...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          {invitationToken
            ? invitationInfo?.fromEmail
              ? `You've been invited by ${invitationInfo.fromEmail}`
              : 'Create your account with your invitation'
            : 'Start tracking your expenses today'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!invitationToken && (
          <div className="mb-5 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/10 p-4">
            <p className="text-sm text-[var(--primary)]">
              <strong>Note:</strong> This site is invitation-only. If you already have an account, please{' '}
              <Link href="/login" className="underline font-semibold">
                sign in
              </Link>
              . To invite your partner, sign up first, then send them an invitation from settings.
            </p>
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          {error && (
            <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </Button>
          <div className="text-center text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--primary)]/30 border-t-[var(--primary)] animate-spin" />
          </div>
        </CardContent>
      </Card>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
