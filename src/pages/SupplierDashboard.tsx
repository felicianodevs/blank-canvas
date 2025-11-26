import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [orderValue, setOrderValue] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [showOrdersSummary, setShowOrdersSummary] = useState(false);
  const [monthlyOrdersModal, setMonthlyOrdersModal] = useState<{ isOpen: boolean; month: string; orders: any[] }>({
    isOpen: false,
    month: "",
    orders: []
  });
  const [viewPhotoModal, setViewPhotoModal] = useState<{ isOpen: boolean; photoUrl: string | null }>({
    isOpen: false,
    photoUrl: null
  });
  const [viewFileModal, setViewFileModal] = useState<{ isOpen: boolean; fileUrl: string | null; fileName: string | null }>({
    isOpen: false,
    fileUrl: null,
    fileName: null
  });
  const [totalPedidosMes, setTotalPedidosMes] = useState(0);
  const [valorEntregue, setValorEntregue] = useState(0);
  const [valorReceber, setValorReceber] = useState(0);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; value: number }>>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Get supplier ID
      const { data: supplierData } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!supplierData) return;

      // Get current month orders
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      
      // Total pedidos no mês atual
      const { count: totalPedidos } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .eq("supplier_id", supplierData.id)
        .gte("order_date", firstDayOfMonth);
      
      setTotalPedidosMes(totalPedidos || 0);

      // Valor entregue no mês atual
      const { data: entregueData } = await supabase
        .from("orders")
        .select("value")
        .eq("supplier_id", supplierData.id)
        .eq("delivery_status", "entregue")
        .gte("order_date", firstDayOfMonth);
      
      const totalEntregue = entregueData?.reduce((sum, order) => sum + (order.value || 0), 0) || 0;
      setValorEntregue(totalEntregue);

      // Valor a receber (todos os pedidos não entregues do ano)
      const firstDayOfYear = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      const { data: receberData } = await supabase
        .from("orders")
        .select("value")
        .eq("supplier_id", supplierData.id)
        .neq("delivery_status", "entregue")
        .gte("order_date", firstDayOfYear);
      
      const totalReceber = receberData?.reduce((sum, order) => sum + (order.value || 0), 0) || 0;
      setValorReceber(totalReceber);

      // Pedidos pendentes
      const { count: pendentesCount } = await supabase
        .from("orders")
        .select("*", { count: 'exact', head: true })
        .eq("supplier_id", supplierData.id)
        .eq("status", "pendente");
      
      setPedidosPendentes(pendentesCount || 0);

      // Fetch monthly data for chart (current year) - all orders with value
      const { data: allOrders } = await supabase
        .from("orders")
        .select("order_date, value")
        .eq("supplier_id", supplierData.id)
        .gte("order_date", firstDayOfYear)
        .not("value", "is", null);

      // Group by month
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthlyValues = new Array(12).fill(0);
      
      allOrders?.forEach(order => {
        const orderDate = new Date(order.order_date);
        const month = orderDate.getMonth();
        monthlyValues[month] += order.value || 0;
      });

      const chartData = monthlyValues
        .map((value, index) => ({
          month: monthNames[index],
          value: value,
          monthIndex: index
        }))
        .filter(item => item.monthIndex <= currentMonth || item.value > 0);

      setMonthlyData(chartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
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

      // Get public URL for file
      const { data: { publicUrl } } = supabase.storage
        .from("purchase_orders")
        .getPublicUrl(filePath);

      // Upload photo if selected
      let photoUrl = null;
      let photoName = null;
      if (selectedPhoto) {
        const photoExt = selectedPhoto.name.split('.').pop();
        const photoFileName = `photo-${user.id}-${Date.now()}.${photoExt}`;
        const photoFilePath = `${photoFileName}`;

        const { error: photoUploadError } = await supabase.storage
          .from("purchase_orders")
          .upload(photoFilePath, selectedPhoto);

        if (photoUploadError) throw photoUploadError;

        const { data: { publicUrl: photoPublicUrl } } = supabase.storage
          .from("purchase_orders")
          .getPublicUrl(photoFilePath);

        photoUrl = photoPublicUrl;
        photoName = selectedPhoto.name;
      }

      // Insert order record with "enviado" status
      const valueToInsert = orderValue ? parseFloat(orderValue.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
      
      const { error: insertError } = await supabase
        .from("orders")
        .insert({
          supplier_id: supplierData.id,
          file_url: publicUrl,
          file_name: selectedFile.name,
          photo_url: photoUrl,
          photo_name: photoName,
          status: "enviado",
          delivery_status: "enviado",
          value: valueToInsert,
        });

      if (insertError) throw insertError;

      toast({
        title: "Pedido enviado ao fornecedor",
        description: `${selectedFile.name}${selectedPhoto ? ' e foto' : ''} enviado com sucesso.`,
      });
      
      setSelectedFile(null);
      setSelectedPhoto(null);
      setOrderValue("");
      const fileInput = document.getElementById('file') as HTMLInputElement;
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      if (photoInput) photoInput.value = '';
      
      // Refresh dashboard data
      fetchDashboardData();
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

  const handleBarClick = async (data: any) => {
    if (!user) return;

    try {
      const { data: supplierData } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!supplierData) return;

      // Get month index from clicked data
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthIndex = monthNames.indexOf(data.month);
      
      if (monthIndex === -1) return;

      const currentYear = new Date().getFullYear();
      const firstDay = new Date(currentYear, monthIndex, 1).toISOString().split('T')[0];
      const lastDay = new Date(currentYear, monthIndex + 1, 0).toISOString().split('T')[0];

      // Fetch orders for this month
      const { data: orders } = await supabase
        .from("orders")
        .select("*, suppliers(name)")
        .eq("supplier_id", supplierData.id)
        .gte("order_date", firstDay)
        .lte("order_date", lastDay)
        .order("order_date", { ascending: false });

      setMonthlyOrdersModal({
        isOpen: true,
        month: data.month,
        orders: orders || []
      });
    } catch (error) {
      console.error("Error fetching monthly orders:", error);
    }
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
              <CardTitle className="text-lg">Total de Pedidos no Mês</CardTitle>
              <CardDescription>Pedidos do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPedidosMes}</div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Valor Entregue</CardTitle>
              <CardDescription>Faturamento do mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(valorEntregue)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">A Receber</CardTitle>
              <CardDescription>Valor pendente do ano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(valorReceber)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Pedidos Pendentes</CardTitle>
              <CardDescription>Aguardando processamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pedidosPendentes}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
              <CardDescription>Valores entregues por mês (R$)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barCategoryGap="20%" maxBarSize={80}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    cursor="pointer"
                    onClick={handleBarClick}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="photo">Anexar foto (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="photo"
                      type="file"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="flex-1"
                    />
                    {selectedPhoto && (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {selectedPhoto && (
                    <p className="text-sm text-muted-foreground">
                      Foto selecionada: {selectedPhoto.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor do pedido (R$)</Label>
                  <Input
                    id="value"
                    type="text"
                    placeholder="Ex: 1500,00"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    className="flex-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite o valor para testar os cálculos
                  </p>
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

      {/* Monthly Orders Modal */}
      <Dialog open={monthlyOrdersModal.isOpen} onOpenChange={(open) => setMonthlyOrdersModal({ ...monthlyOrdersModal, isOpen: open })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedidos de {monthlyOrdersModal.month}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {monthlyOrdersModal.orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado neste mês.</p>
            ) : (
              <div className="grid gap-4">
                {monthlyOrdersModal.orders.map((order, index) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <CardTitle className="text-base">Pedido {index + 1}</CardTitle>
                      <CardDescription>
                        Data: {new Date(order.order_date).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor:</span>
                        <span className="font-semibold">{formatCurrency(order.value || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className="font-semibold">{order.delivery_status}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {order.photo_url && (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setViewPhotoModal({ isOpen: true, photoUrl: order.photo_url })}
                          >
                            Ver foto
                          </Button>
                        )}
                        {order.file_url && (
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setViewFileModal({ 
                              isOpen: true, 
                              fileUrl: order.file_url, 
                              fileName: order.file_name 
                            })}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Ver arquivo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo View Modal */}
      <Dialog open={viewPhotoModal.isOpen} onOpenChange={(open) => setViewPhotoModal({ ...viewPhotoModal, isOpen: open })}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foto do Pedido</DialogTitle>
          </DialogHeader>
          {viewPhotoModal.photoUrl && (
            <img 
              src={viewPhotoModal.photoUrl} 
              alt="Foto do pedido" 
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* File View Modal */}
      <Dialog open={viewFileModal.isOpen} onOpenChange={(open) => setViewFileModal({ ...viewFileModal, isOpen: open })}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{viewFileModal.fileName || 'Arquivo do Pedido'}</DialogTitle>
          </DialogHeader>
          {viewFileModal.fileUrl && (
            <div className="space-y-4">
              <iframe 
                src={viewFileModal.fileUrl} 
                className="w-full h-[70vh] rounded-lg border"
                title="Visualização do arquivo"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(viewFileModal.fileUrl!, '_blank')}
              >
                Abrir em nova aba / Baixar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDashboard;
