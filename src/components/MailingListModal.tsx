import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useArtistProfile } from '@/hooks/useArtistProfile';

const STORAGE_KEY = 'mailingListPromptSeen';

const schema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email' }).max(255),
  phone: z
    .string()
    .trim()
    .max(32, { message: 'Phone number is too long' })
    .optional()
    .or(z.literal('')),
  zip: z
    .string()
    .trim()
    .max(16, { message: 'Zip code is too long' })
    .optional()
    .or(z.literal('')),
});

const MailingListModal: React.FC = () => {
  const { profile } = useArtistProfile();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const modalEnabled = profile?.mailing_modal_enabled ?? true;
  const required = profile?.mailing_required ?? false;
  const hasSeen = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    if (!profile) return;
    if (required && !hasSeen) {
      setOpen(true);
      return;
    }
    if (modalEnabled && !hasSeen) {
      setOpen(true);
    }
  }, [profile, required, modalEnabled, hasSeen]);

  // Block audio playback while a required signup is pending
  useEffect(() => {
    if (!required || hasSeen) return;
    const pauseAll = () => {
      document.querySelectorAll('audio').forEach((a) => {
        try { (a as HTMLAudioElement).pause(); } catch {}
      });
    };
    pauseAll();
    const id = window.setInterval(pauseAll, 400);
    return () => window.clearInterval(id);
  }, [required, hasSeen, open]);

  const dismiss = () => {
    if (required && !success) return; // cannot dismiss when required
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, phone, zip });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('mailing-signup', {
      body: {
        email: parsed.data.email,
        phone: parsed.data.phone ? parsed.data.phone : null,
        zip_code: parsed.data.zip ? parsed.data.zip : null,
      },
    });
    setSubmitting(false);
    const errMsg = (data as any)?.error || error?.message;

    if (errMsg) {
      toast.error('Something went wrong. Please try again.');
      return;
    }

    setSuccess(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => setOpen(false), 1600);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
    >
      <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Mail size={18} className="text-pink-400" />
            Stay in the loop
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Drop your info to get updates on new music, releases, and exclusive drops.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center text-white/90 text-base">
            You're on the list 🎵
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ml-email" className="text-sm text-white/80">Email</Label>
              <Input
                id="ml-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ml-phone" className="text-sm text-white/80">
                Phone <span className="text-white/40">(optional)</span>
              </Label>
              <Input
                id="ml-phone"
                type="tel"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ml-zip" className="text-sm text-white/80">
                Zip code <span className="text-white/40">(optional)</span>
              </Label>
              <Input
                id="ml-zip"
                type="text"
                inputMode="text"
                placeholder="Zip / postal code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              >
                {submitting ? 'Joining…' : 'Join the list'}
              </Button>
              {!required && (
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  Maybe later
                </button>
              )}
              {required && (
                <p className="text-xs text-white/50 text-center">
                  Join the list to start listening.
                </p>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MailingListModal;
