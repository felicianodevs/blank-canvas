import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    empresa: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    estado: "",
    senha: "",
    confirmarSenha: "",
    userType: "empresa" as "empresa" | "fornecedor",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.senha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create user account with Supabase Auth
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: formData.nome,
            empresa: formData.empresa,
            cnpj: formData.cnpj,
            telefone: formData.telefone,
            endereco: formData.endereco,
            cidade: formData.cidade,
            estado: formData.estado,
            userType: formData.userType,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você será redirecionado para o login.",
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative py-8 sm:py-12"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      
      <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-0">
        <CardHeader className="space-y-3 sm:space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="Unimaq Logo" className="h-20 sm:h-24 w-auto" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription className="text-sm sm:text-base">Preencha os dados para se cadastrar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Tipo de Usuário *</Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) =>
                  setFormData({ ...formData, userType: value as "empresa" | "fornecedor" })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empresa" id="empresa" />
                  <Label htmlFor="empresa" className="cursor-pointer font-normal">
                    Empresa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fornecedor" id="fornecedor" />
                  <Label htmlFor="fornecedor" className="cursor-pointer font-normal">
                    Fornecedor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Input
                  id="empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/" className="text-primary font-medium hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
