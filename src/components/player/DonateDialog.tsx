import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DonateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId?: string | null;
  songTitle?: string;
}

const PRESETS = [3, 5, 10, 25];

const DonateDialog: React.FC<DonateDialogProps> = ({ open, onOpenChange, songId, songTitle }) => {
  const [amount, setAmount] = useState<string>('5');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const dollars = parseFloat(amount);
    if (!dollars || dollars <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from('donations').insert({
        amount_cents: Math.round(dollars * 100),
        donor_name: name.trim() || null,
        song_id: songId || null,
        source: 'player',
        metadata: { song_title: songTitle || null },
      });
      if (error) throw error;
      toast.success('Thank you for your support! ❤️');
      onOpenChange(false);
      setAmount('5');
      setName('');
    } catch (e: any) {
      toast.error(e.message || 'Could not submit donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" /> Support Fund
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Tip the artist any amount you'd like.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={`rounded-lg py-2 text-sm border transition-colors ${
                amount === String(p)
                  ? 'bg-pink-500/20 border-pink-400/60 text-white'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              ${p}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-white/60">Custom amount (USD)</Label>
          <Input
            type="number"
            min="1"
            step="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-white/60">Your name (optional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <Button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white border-0"
        >
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
          Donate ${amount || '0'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DonateDialog;
