import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getOrCreateUserRole = async (
    userId: string,
    userMetadata?: Record<string, any>
  ): Promise<"empresa" | "fornecedor"> => {
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleError) {
      throw roleError;
    }

    if (roleData?.role) {
      return roleData.role as "empresa" | "fornecedor";
    }

    const metadataRole =
      (userMetadata?.userType as "empresa" | "fornecedor" | undefined) ?? "fornecedor";

    const { data: newRoleData, error: insertError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: metadataRole })
      .select("role")
      .single();

    if (insertError || !newRoleData?.role) {
      throw insertError || new Error("Não foi possível definir o papel do usuário.");
    }

    return newRoleData.role as "empresa" | "fornecedor";
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const role = await getOrCreateUserRole(
            session.user.id,
            session.user.user_metadata
          );

          if (role === "empresa") {
            navigate("/dashboard");
          } else if (role === "fornecedor") {
            navigate("/supplier-dashboard");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão do usuário:", error);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao fazer login");
      }

      // Get or create user role based on metadata
      const role = await getOrCreateUserRole(
        authData.user.id,
        authData.user.user_metadata
      );

      // Show success modal
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (role === "empresa") {
          navigate("/dashboard");
        } else if (role === "fornecedor") {
          navigate("/supplier-dashboard");
        }
      }, 2000);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage("VOCÊ ERROU A Senha ou o Email tente novamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
        <CardHeader className="space-y-4 sm:space-y-6 text-center pb-6 sm:pb-8">
          <div className="flex justify-center">
            <img src={logo} alt="Unimaq Logo" className="h-24 sm:h-32 w-auto" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Bem-vindo</CardTitle>
            <CardDescription className="text-sm sm:text-base">Entre com suas credenciais</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-center font-medium">{errorMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-2xl border-0 animate-in fade-in zoom-in">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Login efetuado com sucesso</h3>
                <p className="text-muted-foreground mt-2">Bem vindo!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Login;
