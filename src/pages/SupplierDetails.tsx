import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import { ArrowLeft, Package, CheckCircle, Clock, TruckIcon } from "lucide-react";

// Mock data por fornecedor
const supplierOrders: Record<string, any[]> = {
  "Fornecedor ABC": [
    { id: "PC-001", date: "2024-01-15", file: "pedido_janeiro_001.pdf", valor: 12500, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-002", date: "2024-02-10", file: "pedido_fevereiro_002.pdf", valor: 18000, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-003", date: "2024-03-05", file: "pedido_marco_003.pdf", valor: 15000, status: "finalizado", deliveryStatus: "para_receber" },
    { id: "PC-004", date: "2024-04-12", file: "pedido_abril_004.pdf", valor: 23000, status: "pendente", deliveryStatus: "pendente" },
  ],
  "Fornecedor XYZ": [
    { id: "PC-005", date: "2024-01-20", file: "pedido_janeiro_005.pdf", valor: 9500, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-006", date: "2024-02-15", file: "pedido_fevereiro_006.pdf", valor: 12000, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-007", date: "2024-03-25", file: "pedido_marco_007.pdf", valor: 14500, status: "finalizado", deliveryStatus: "para_receber" },
    { id: "PC-008", date: "2024-05-10", file: "pedido_maio_008.pdf", valor: 12000, status: "pendente", deliveryStatus: "pendente" },
  ],
  "Fornecedor DEF": [
    { id: "PC-009", date: "2024-02-05", file: "pedido_fevereiro_009.pdf", valor: 8300, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-010", date: "2024-03-15", file: "pedido_marco_010.pdf", valor: 11000, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-011", date: "2024-04-20", file: "pedido_abril_011.pdf", valor: 13000, status: "finalizado", deliveryStatus: "para_receber" },
  ],
  "Fornecedor GHI": [
    { id: "PC-012", date: "2024-01-25", file: "pedido_janeiro_012.pdf", valor: 7200, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-013", date: "2024-03-10", file: "pedido_marco_013.pdf", valor: 9500, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-014", date: "2024-04-05", file: "pedido_abril_014.pdf", valor: 12000, status: "finalizado", deliveryStatus: "para_receber" },
  ],
  "Fornecedor JKL": [
    { id: "PC-015", date: "2024-02-20", file: "pedido_fevereiro_015.pdf", valor: 6500, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-016", date: "2024-03-30", file: "pedido_marco_016.pdf", valor: 8000, status: "finalizado", deliveryStatus: "entregue" },
    { id: "PC-017", date: "2024-05-05", file: "pedido_maio_017.pdf", valor: 10000, status: "finalizado", deliveryStatus: "para_receber" },
  ],
};

const SupplierDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierName = searchParams.get("supplier") || "";

  const orders = supplierOrders[supplierName] || [];

  const finalizados = orders.filter(o => o.status === "finalizado");
  const entregues = finalizados.filter(o => o.deliveryStatus === "entregue");
  const paraReceber = finalizados.filter(o => o.deliveryStatus === "para_receber");
  const pendentes = orders.filter(o => o.status === "pendente");

  const valorTotalNotas = finalizados.reduce((sum, o) => sum + o.valor, 0);
  const valorEntregue = entregues.reduce((sum, o) => sum + o.valor, 0);
  const valorParaReceber = paraReceber.reduce((sum, o) => sum + o.valor, 0);
  const valorPendente = pendentes.reduce((sum, o) => sum + o.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDeliveryBadge = (deliveryStatus: string) => {
    switch (deliveryStatus) {
      case "entregue":
        return <Badge className="bg-primary/20 text-primary border-primary">Entregue</Badge>;
      case "para_receber":
        return <Badge className="bg-accent/20 text-accent border-accent">Para Receber</Badge>;
      case "pendente":
        return <Badge className="bg-muted text-muted-foreground">Pendente</Badge>;
      default:
        return null;
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
          <Button 
            variant="secondary" 
            onClick={() => navigate("/dashboard")}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">{supplierName}</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Histórico completo de pedidos do fornecedor
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Resumo de Valores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-xl border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total de Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(valorTotalNotas)}</div>
              <p className="text-xs text-muted-foreground mt-1">{finalizados.length} pedidos finalizados</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Entregues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(valorEntregue)}</div>
              <p className="text-xs text-muted-foreground mt-1">{entregues.length} pedidos</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-accent" />
                Para Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{formatCurrency(valorParaReceber)}</div>
              <p className="text-xs text-muted-foreground mt-1">{paraReceber.length} pedidos</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(valorPendente)}</div>
              <p className="text-xs text-muted-foreground mt-1">{pendentes.length} pedidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pedidos Finalizados e Entregues */}
        {entregues.length > 0 && (
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Pedidos Entregues
              </CardTitle>
              <CardDescription>Pedidos finalizados e já entregues à empresa</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entregues.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{order.file}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.valor)}</TableCell>
                      <TableCell>{getDeliveryBadge(order.deliveryStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Pedidos Para Receber */}
        {paraReceber.length > 0 && (
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-accent" />
                Pedidos Para Receber
              </CardTitle>
              <CardDescription>Pedidos finalizados aguardando entrega</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paraReceber.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{order.file}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.valor)}</TableCell>
                      <TableCell>{getDeliveryBadge(order.deliveryStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Pedidos Pendentes */}
        {pendentes.length > 0 && (
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Pedidos Pendentes
              </CardTitle>
              <CardDescription>Pedidos ainda não finalizados</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6 overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendentes.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{order.file}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.valor)}</TableCell>
                      <TableCell>{getDeliveryBadge(order.deliveryStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {orders.length === 0 && (
          <Card className="shadow-2xl border-0">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado para este fornecedor.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupplierDetails;
