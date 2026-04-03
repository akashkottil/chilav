'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePartner } from '@/context/PartnerContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Mail, UserPlus, RefreshCw } from 'lucide-react';
import { CategoryList } from '@/components/categories/CategoryList';

export default function SettingsPage() {
  const { user } = useAuth();
  const { partner, refreshPartner } = usePartner();
  const supabase = createClient();

  const [invitationEmail, setInvitationEmail] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateInvitationToken = () => {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !invitationEmail) return;

    setError('');
    setSendingInvitation(true);
    setInvitationSent(false);

    try {
      if (partner) {
        setError('You already have a partner linked. Please remove the existing partnership first.');
        setSendingInvitation(false);
        return;
      }

      if (invitationEmail.toLowerCase() === user.email?.toLowerCase()) {
        setError('You cannot invite yourself.');
        setSendingInvitation(false);
        return;
      }

      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitationEmail)) {
        setError('Please enter a valid email address.');
        setSendingInvitation(false);
        return;
      }

      const { data, error: invError } = await supabase
        .from('partner_invitations')
        .insert({
          from_user_id: user.id,
          to_email: invitationEmail.toLowerCase().trim(),
          token: token,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })
        .select()
        .single();

      if (invError) {
        console.error('Supabase error details:', invError);
        throw invError;
      }

      if (!data) {
        throw new Error('No data returned from invitation creation');
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const link = `${baseUrl}/signup?token=${token}`;
      setInvitationLink(link);
      setInvitationSent(true);
      setInvitationEmail('');
    } catch (err: unknown) {
      console.error('Error sending invitation:', err);
      let errorMessage = 'Failed to send invitation. Please try again.';

      if (err && typeof err === 'object') {
        const errorObj = err as { code?: string; message?: string; error?: { message?: string } };
        if (errorObj.code === '23505') {
          errorMessage = 'An invitation with this token already exists. Please try again.';
        } else if (errorObj.code === '42501') {
          errorMessage = 'Permission denied. Please check your database permissions.';
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error?.message) {
          errorMessage = errorObj.error.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSendingInvitation(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Settings</h1>
        <p className="text-[var(--muted)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Partner Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[var(--primary)]" />
            Partner Management
          </CardTitle>
          <CardDescription>
            {partner
              ? 'You are linked with your partner. You can view and manage shared expenses.'
              : 'Invite your partner to start sharing expenses together'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partner ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--success)]/5 border border-[var(--success)]/20">
                <div className="h-10 w-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-[var(--success)]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--success)]">Partner Linked</p>
                  <p className="text-sm text-[var(--muted)]">
                    You can now share expenses and view analytics together.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await refreshPartner();
                  window.location.reload();
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Partner Status
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  await refreshPartner();
                  const { data: partnerData } = await supabase
                    .from('partners')
                    .select('*')
                    .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
                    .eq('status', 'active')
                    .single();

                  if (partnerData) {
                    await refreshPartner();
                    alert('Partner found! Refreshing page...');
                    window.location.reload();
                  } else {
                    alert('No partner linked yet. Make sure your partner has signed up using the invitation link.');
                  }
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Partner Status
              </Button>

              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invitationEmail">Partner Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invitationEmail"
                      type="email"
                      placeholder="partner@example.com"
                      value={invitationEmail}
                      onChange={(e) => setInvitationEmail(e.target.value)}
                      required
                      disabled={sendingInvitation}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={sendingInvitation}>
                      {sendingInvitation ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 p-4">
                    <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
                    <p className="text-xs text-[var(--muted)] mt-2">
                      Check the browser console (F12) for detailed error information.
                    </p>
                  </div>
                )}

                {invitationSent && invitationLink && (
                  <div className="rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/15 p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">Invitation Created!</p>
                        <p className="text-sm text-[var(--muted)] mb-3">
                          Share this link with your partner to get started.
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={invitationLink}
                            readOnly
                            className="flex-1 font-mono text-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="shrink-0"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-1 text-[var(--success)]" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <div className="rounded-xl bg-[var(--surface-hover)] p-4">
                <p className="text-xs text-[var(--muted)]">
                  Your partner will need to create an account using the invitation link.
                  Once they sign up, you&apos;ll be automatically linked.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage your expense categories and subcategories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList />
        </CardContent>
      </Card>
    </div>
  );
}
