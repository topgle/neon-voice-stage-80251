import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setIsModerator(false);
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      if (roles && roles.length > 0) {
        // Check for highest role
        const hasAdmin = roles.some(r => r.role === 'admin');
        const hasModerator = roles.some(r => r.role === 'moderator');
        
        if (hasAdmin) {
          setRole('admin');
          setIsAdmin(true);
          setIsModerator(true);
        } else if (hasModerator) {
          setRole('moderator');
          setIsAdmin(false);
          setIsModerator(true);
        } else {
          setRole('user');
          setIsAdmin(false);
          setIsModerator(false);
        }
      } else {
        setRole('user');
        setIsAdmin(false);
        setIsModerator(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole(null);
      setIsAdmin(false);
      setIsModerator(false);
    } finally {
      setLoading(false);
    }
  };

  return { role, isAdmin, isModerator, loading, refetch: checkUserRole };
};
