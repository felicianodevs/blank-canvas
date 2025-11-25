import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, FileText, LogOut, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import OrdersSummary from "./OrdersSummary";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, loading: authLoading, user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showOrdersSummary, setShowOrdersSummary] = useState(false);

  // Mock data - will be replaced with real data from Supabase
  const monthlyData = [
    { month: "Jan", value: 45000 },
    { month: "Fev", value: 52000 },
    { month: "Mar", value: 48000 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get or create supplier ID
      let { data: supplierData, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (supplierError) throw supplierError;

      // If supplier doesn't exist, create it
      if (!supplierData) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("empresa, cnpj")
          .eq("id", user.id)
          .single();

        const { data: newSupplier, error: createError } = await supabase
          .from("suppliers")
          .insert({
            user_id: user.id,
            name: profileData?.empresa || "Fornecedor",
            cnpj: profileData?.cnpj || "",
          })
          .select("id")
          .single();

        if (createError) throw createError;
        supplierData = newSupplier;
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("purchase_orders")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("purchase_orders")
        .getPublicUrl(filePath);

      // Insert order record with "enviado" status
      const { error: insertError } = await supabase
        .from("orders")
        .insert({
          supplier_id: supplierData.id,
          file_url: publicUrl,
          file_name: selectedFile.name,
          status: "enviado",
          delivery_status: "enviado",
          value: 0, // User can update this later
        });

      if (insertError) throw insertError;

      toast({
        title: "Pedido enviado ao fornecedor",
        description: `${selectedFile.name} foi enviado com sucesso.`,
      });
      
      setSelectedFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Ocorreu um erro ao enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8 relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <img src={logo} alt="Unimaq Logo" className="h-16 sm:h-20 w-auto" />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowOrdersSummary(true)}
              className="bg-background/80 hover:bg-background"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Resumo
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-background/80 hover:bg-background"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Notas Fiscais</CardTitle>
              <CardDescription>Total de notas emitidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Valor Entregue</CardTitle>
              <CardDescription>Total já recebido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(145000)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">A Receber</CardTitle>
              <CardDescription>Valor pendente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(52000)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Pedidos Pendentes</CardTitle>
              <CardDescription>Aguardando processamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">8</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
              <CardDescription>Valores por mês (R$)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barSize={60} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Upload de Pedido</CardTitle>
              <CardDescription>Envie novos pedidos de compra</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Selecione o arquivo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      className="flex-1"
                    />
                    {selectedFile && (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Enviando..." : "Enviar Pedido"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Summary Modal */}
      {showOrdersSummary && <OrdersSummary onClose={() => setShowOrdersSummary(false)} />}
    </div>
  );
};

export default SupplierDashboard;
