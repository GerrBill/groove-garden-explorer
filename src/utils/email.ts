
import { supabase } from "@/integrations/supabase/client";

export const sendEmail = async (to: string, subject: string, html: string, token: string) => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      to,
      subject,
      html,
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (error) {
    throw error;
  }

  return data;
};
