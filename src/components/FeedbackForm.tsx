import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Loader2, Award, Star, ThumbsUp, Hammer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const form = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<string>('');

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    emailjs.sendForm(
      'service_saebo0n',
      'template_nd4lymi',
      form.current!,
      'NwMPwoO6mOuR1IeSD'
    )
    .then((result) => {
      console.log('EmailJS Success:', result.text);
      toast.success('Feedback sent. Thank you for shaping Trackora.');
      if (form.current) form.current.reset();
      setRating('');
      if (onSuccess) onSuccess();
    })
    .catch((error) => {
      console.error('EmailJS Error:', error.text);
      toast.error('Unable to send feedback. Please try again.');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const ratings = [
    { value: 'Elite', icon: Award, color: 'text-emerald-400' },
    { value: 'Strong', icon: Star, color: 'text-blue-400' },
    { value: 'Good', icon: ThumbsUp, color: 'text-amber-400' },
    { value: 'Needs Work', icon: Hammer, color: 'text-red-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-[90%] md:w-1/2 mx-auto"
    >
      <div className="relative overflow-hidden rounded-xl bg-card/70 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-50" />

        <div className="p-8 md:p-12 space-y-10">
          
          {/* Header */}
          <div className="space-y-3 text-center sm:text-left">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Share Your Experience
            </h2>
            <p className="text-sm text-muted-foreground">
              Help us refine Trackora’s discipline engine.
            </p>
          </div>

          <div className="h-px w-full bg-white/5" />

          <form ref={form} onSubmit={sendEmail} className="space-y-10">
            <input type="hidden" name="rating" value={rating} />
            
            {/* Rating Select */}
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-1">
                Rating
              </Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="w-full h-12 bg-background/20 border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl text-sm transition-all duration-300">
                  <SelectValue placeholder="Select rating..." />
                </SelectTrigger>
                
                <SelectContent 
                  position="popper" 
                  style={{ backgroundColor: 'var(--background)' }}
                  className="w-[var(--radix-select-trigger-width)] border border-white/10 shadow-2xl z-[9999] rounded-xl p-1.5"
                >
                  {ratings.map((r) => {
                     const Icon = r.icon;
                     return (
                        <SelectItem 
                          key={r.value} 
                          value={r.value} 
                          className="w-full cursor-pointer rounded-lg px-3 py-3 focus:bg-cyan-500/10 focus:text-cyan-400 data-[state=checked]:bg-cyan-500/15 data-[state=checked]:text-cyan-400 text-sm font-medium transition-all duration-200 my-0.5 pl-3 border-none outline-none group"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className={`w-4 h-4 ${r.color} opacity-70 group-focus:opacity-100 transition-opacity`} />
                            <span className="flex-1">{r.value}</span>
                          </div>
                        </SelectItem>
                     );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <Label htmlFor="user_email" className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-1">
                Email
              </Label>
              <Input
                type="email"
                name="user_email"
                id="user_email"
                placeholder="name@example.com"
                required
                className="h-12 bg-background/20 border-white/10 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 rounded-xl text-sm transition-all duration-300 placeholder:text-muted-foreground/30 px-4"
              />
            </div>

            {/* Feedback Textarea */}
            <div className="space-y-3">
              <Label htmlFor="feedback_message" className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium ml-1">
                Thoughts
              </Label>
              <Textarea
                name="feedback_message"
                id="feedback_message"
                placeholder="Tell us what you love or how we can improve..."
                required
                style={{ minHeight: '150px' }}
                className="min-h-[150px] bg-background/20 border-white/10 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 rounded-xl text-base transition-all duration-300 placeholder:text-muted-foreground/30 resize-none p-4 leading-relaxed"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:via-cyan-400 hover:to-blue-400 text-black font-bold tracking-wider uppercase text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 border-0 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black/70" />
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}