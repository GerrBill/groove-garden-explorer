
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const SendEmailDialog = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user, session } = useAuth();

  const resetForm = () => {
    setTo("");
    setSubject("");
    setBody("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to send emails.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSending(true);
      toast({
        title: "Sending email...",
        description: "Your email is being processed."
      });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          from: user.email,
          to,
          subject,
          html: body
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent successfully!",
        description: "Your message has been delivered.",
        variant: "default"
      });
      
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-theme-color hover:text-white">
          <Mail size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              required
              disabled={isSending}
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              disabled={isSending}
            />
          </div>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here"
              className="min-h-[100px]"
              required
              disabled={isSending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailDialog;
