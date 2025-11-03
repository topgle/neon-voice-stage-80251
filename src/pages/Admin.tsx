import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { UserRolesManager } from "@/components/admin/UserRolesManager";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie permissões e controle de acesso</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso Administrativo</AlertTitle>
            <AlertDescription>
              Você tem permissões de administrador. Use com responsabilidade.
              Administradores podem gerenciar todas as músicas e permissões de usuários.
            </AlertDescription>
          </Alert>

          <UserRolesManager />
        </div>
      </div>
    </div>
  );
};

export default Admin;
