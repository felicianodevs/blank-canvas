import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Package, DollarSign, TrendingUp } from "lucide-react";

// Mock data
const mockOrdersSummary = {
  pedidosEnviados: [
    { id: "001", date: "2025-01-15", supplier: "Fornecedor ABC", value: 15000, status: "Enviado" },
    { id: "002", date: "2025-01-18", supplier: "Fornecedor XYZ", value: 8500, status: "Enviado" },
    { id: "003", date: "2025-01-20", supplier: "Fornecedor DEF", value: 22000, status: "Enviado" },
  ],
  valoresReceber: [
    { id: "004", date: "2025-01-22", supplier: "Fornecedor GHI", value: 12300, status: "A Receber" },
    { id: "005", date: "2025-01-25", supplier: "Fornecedor JKL", value: 18700, status: "A Receber" },
  ],
  valoresEntregues: [
    { id: "006", date: "2025-01-10", supplier: "Fornecedor ABC", value: 31000, status: "Entregue" },
    { id: "007", date: "2025-01-12", supplier: "Fornecedor XYZ", value: 14500, status: "Entregue" },
  ],
};

interface OrdersSummaryProps {
  onClose: () => void;
}

const OrdersSummary = ({ onClose }: OrdersSummaryProps) => {
  const [activeTab, setActiveTab] = useState("enviados");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalEnviados = mockOrdersSummary.pedidosEnviados.reduce((acc, order) => acc + order.value, 0);
  const totalReceber = mockOrdersSummary.valoresReceber.reduce((acc, order) => acc + order.value, 0);
  const totalEntregues = mockOrdersSummary.valoresEntregues.reduce((acc, order) => acc + order.value, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-0">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Resumo de Pedidos</CardTitle>
              <CardDescription>Visão geral de todos os pedidos e valores</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Pedidos Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalEnviados)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockOrdersSummary.pedidosEnviados.length} pedidos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valores a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent-foreground">
                  {formatCurrency(totalReceber)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockOrdersSummary.valoresReceber.length} pedidos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Valores Entregues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(totalEntregues)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockOrdersSummary.valoresEntregues.length} pedidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs with Details */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="enviados">Enviados</TabsTrigger>
              <TabsTrigger value="receber">A Receber</TabsTrigger>
              <TabsTrigger value="entregues">Entregues</TabsTrigger>
            </TabsList>

            <TabsContent value="enviados" className="mt-4">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrdersSummary.pedidosEnviados.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.value)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="receber" className="mt-4">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrdersSummary.valoresReceber.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.value)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-accent/90 text-accent-foreground">{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="entregues" className="mt-4">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrdersSummary.valoresEntregues.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.value)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSummary;
