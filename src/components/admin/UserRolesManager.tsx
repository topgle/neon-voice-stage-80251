import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, UserCog, Trash2, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type UserRole = 'admin' | 'moderator' | 'user';

interface UserWithRoles {
  id: string;
  email: string;
  display_name: string | null;
  roles: UserRole[];
}

export const UserRolesManager = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .order('email');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        display_name: profile.display_name,
        roles: (userRoles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as UserRole)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (userId: string, role: UserRole) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          assigned_by: user.id
        });

      if (error) throw error;

      toast.success('Permissão adicionada com sucesso');
      loadUsers();
    } catch (error: any) {
      console.error('Error adding role:', error);
      if (error.code === '23505') {
        toast.error('Usuário já possui esta permissão');
      } else {
        toast.error('Erro ao adicionar permissão');
      }
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success('Permissão removida com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Erro ao remover permissão');
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'moderator':
        return <UserCog className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciamento de Permissões
        </CardTitle>
        <CardDescription>
          Gerencie as permissões de acesso dos usuários do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Role Section */}
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione um usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => selectedUser && addRole(selectedUser, selectedRole)}
            disabled={!selectedUser}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <Separator />

        {/* Users List */}
        <div className="space-y-4">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <div className="font-medium">{user.display_name || user.email}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>

              <div className="flex items-center gap-2">
                {user.roles.length === 0 ? (
                  <Badge variant="secondary">Sem permissões</Badge>
                ) : (
                  user.roles.map(role => (
                    <div key={role} className="flex items-center gap-1">
                      <Badge variant={getRoleBadgeVariant(role)} className="gap-1">
                        {getRoleIcon(role)}
                        {role}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeRole(user.id, role)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
