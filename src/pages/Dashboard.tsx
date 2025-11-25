import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import { Upload, FileText, LogOut, BarChart3, FileStack, ClipboardList, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import OrdersSummary from "./OrdersSummary";

// Mock data for charts
const monthlyOrdersData = [
  { month: "Jan", pedidos: 12, valor: 120000 },
  { month: "Fev", pedidos: 8, valor: 85000 },
  { month: "Mar", pedidos: 15, valor: 145000 },
  { month: "Abr", pedidos: 10, valor: 98000 },
  { month: "Mai", pedidos: 18, valor: 175000 },
  { month: "Jun", pedidos: 0, valor: 0 },
  { month: "Jul", pedidos: 0, valor: 0 },
  { month: "Ago", pedidos: 0, valor: 0 },
  { month: "Set", pedidos: 0, valor: 0 },
  { month: "Out", pedidos: 0, valor: 0 },
  { month: "Nov", pedidos: 0, valor: 0 },
  { month: "Dez", pedidos: 0, valor: 0 },
];

const supplierData = [
  { name: "Fornecedor ABC", valor: 68500 },
  { name: "Fornecedor XYZ", valor: 48000 },
  { name: "Fornecedor DEF", valor: 32300 },
  { name: "Fornecedor GHI", valor: 28700 },
  { name: "Fornecedor JKL", valor: 24500 },
];

const statusData = [
  { name: "Aprovados", value: 45, color: "hsl(var(--primary))" },
  { name: "Em Análise", value: 30, color: "hsl(var(--accent))" },
  { name: "Pendentes", value: 25, color: "hsl(var(--muted))" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOrdersSummary, setShowOrdersSummary] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Filter only months with orders
  const activeMonthsData = monthlyOrdersData.filter(month => month.pedidos > 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      toast.success("Pedido enviado ao fornecedor");
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      toast.error("Por favor, selecione um arquivo");
    }
  };

  const handleLogout = () => {
    toast.success("Logout realizado com sucesso!");
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleBarClick = (data: any) => {
    if (data && data.month) {
      setSelectedMonth(data.month);
      setShowMonthModal(true);
    }
  };

  const handleSupplierClick = (data: any) => {
    if (data && data.name) {
      navigate(`/supplier-details?supplier=${data.name}`);
    }
  };

  return (
    <div 
      className="min-h-screen p-4 relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
      
      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <img src={logo} alt="Unimaq Logo" className="h-16 sm:h-20 w-auto" />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button 
              variant="secondary" 
              onClick={() => setShowOrdersSummary(true)}
              className="gap-2 w-full sm:w-auto"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Resumo</span>
              <span className="sm:hidden">Resumo</span>
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate("/orders")}
              className="gap-2 w-full sm:w-auto"
            >
              <FileStack className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Todos os Pedidos</span>
              <span className="sm:hidden">Pedidos</span>
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleLogout}
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Orders Chart */}
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Pedidos por Mês
              </CardTitle>
              <CardDescription>Total de pedidos realizados nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <BarChart data={activeMonthsData} barSize={80} barCategoryGap="1%" barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="pedidos" 
                    fill="hsl(var(--primary))" 
                    name="Quantidade"
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Values Chart */}
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Valores por Mês (R$)
              </CardTitle>
              <CardDescription>Total em reais gastos por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <LineChart data={activeMonthsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis 
                    stroke="hsl(var(--foreground))"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    name="Valor Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Supplier Values Chart */}
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Valores por Fornecedor
              </CardTitle>
              <CardDescription>Total de compras por fornecedor no mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <BarChart data={supplierData} layout="vertical" barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--foreground))"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" width={80} className="text-xs sm:text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar 
                    dataKey="valor" 
                    fill="hsl(var(--accent))" 
                    name="Valor Total"
                    onClick={handleSupplierClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution Chart */}
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Status dos Pedidos
              </CardTitle>
              <CardDescription>Distribuição dos pedidos por status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={130}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Enviar Novo Pedido</CardTitle>
            <CardDescription className="text-base">
              Envie seu pedido de compra para análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="fileInput" className="text-base">
                  Pedido de Compra
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <Label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-4">
                    {selectedFile ? (
                      <>
                        <FileText className="w-16 h-16 text-primary" />
                        <div>
                          <p className="font-medium text-lg">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-lg">Clique para selecionar</p>
                          <p className="text-sm text-muted-foreground">
                            PDF, DOC, DOCX, XLS, XLSX
                          </p>
                        </div>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg h-14 gap-2"
              >
                <Upload className="w-5 h-5" />
                ANEXAR PEDIDO DE COMPRA
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Orders Summary Modal */}
      {showOrdersSummary && <OrdersSummary onClose={() => setShowOrdersSummary(false)} />}

      {/* Monthly Billing Modal */}
      {showMonthModal && selectedMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border-0">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Faturamentos de {selectedMonth}</CardTitle>
                  <CardDescription>Todos os pedidos e valores do mês</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowMonthModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {activeMonthsData.find(m => m.month === selectedMonth)?.pedidos || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(activeMonthsData.find(m => m.month === selectedMonth)?.valor || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">#001</TableCell>
                        <TableCell>15/01/2025</TableCell>
                        <TableCell>Fornecedor ABC</TableCell>
                        <TableCell className="text-right">{formatCurrency(15000)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#002</TableCell>
                        <TableCell>18/01/2025</TableCell>
                        <TableCell>Fornecedor XYZ</TableCell>
                        <TableCell className="text-right">{formatCurrency(8500)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#003</TableCell>
                        <TableCell>20/01/2025</TableCell>
                        <TableCell>Fornecedor DEF</TableCell>
                        <TableCell className="text-right">{formatCurrency(22000)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
