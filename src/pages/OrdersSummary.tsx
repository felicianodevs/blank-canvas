import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Package, DollarSign, TrendingUp, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_date: string;
  value: number;
  status: string;
  delivery_status: string;
  supplier_id: string;
  supplier_name: string;
}

interface OrdersSummaryProps {
  onClose: () => void;
}

const OrdersSummary = ({ onClose }: OrdersSummaryProps) => {
  const [activeTab, setActiveTab] = useState("enviados");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [dateSort, setDateSort] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_date,
          value,
          status,
          delivery_status,
          supplier_id,
          suppliers (
            name
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;

      const formattedOrders = data.map((order: any) => ({
        id: order.id,
        order_date: order.order_date,
        value: order.value || 0,
        status: order.status,
        delivery_status: order.delivery_status || 'enviado',
        supplier_id: order.supplier_id,
        supplier_name: order.suppliers?.name || 'N/A'
      }));

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Get unique suppliers for filter
  const suppliers = Array.from(new Set(orders.map(o => o.supplier_name))).sort();

  // Filter and sort orders
  const filterOrdersByStatus = (status: string) => {
    let filtered = orders.filter(order => order.delivery_status === status);
    
    // Apply supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(order => order.supplier_name === supplierFilter);
    }

    // Apply date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.order_date).getTime();
      const dateB = new Date(b.order_date).getTime();
      return dateSort === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  };

  const pedidosEnviados = filterOrdersByStatus("enviado");
  const valoresReceber = filterOrdersByStatus("a_receber");
  const valoresEntregues = filterOrdersByStatus("entregue");

  const totalEnviados = pedidosEnviados.reduce((acc, order) => acc + order.value, 0);
  const totalReceber = valoresReceber.reduce((acc, order) => acc + order.value, 0);
  const totalEntregues = valoresEntregues.reduce((acc, order) => acc + order.value, 0);

  const toggleDateSort = () => {
    setDateSort(prev => prev === "asc" ? "desc" : "asc");
  };

  const renderOrdersTable = (ordersList: Order[], statusColor: string) => (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDateSort}
                className="h-8 px-2"
              >
                Data
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Carregando...
              </TableCell>
            </TableRow>
          ) : ordersList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          ) : (
            ordersList.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {new Date(order.order_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>{order.supplier_name}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.value)}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={statusColor}
                  >
                    {order.delivery_status === 'enviado' ? 'Enviado' : 
                     order.delivery_status === 'a_receber' ? 'A Receber' : 
                     'Entregue'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border-0">
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
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Pedidos Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">
                  {formatCurrency(totalEnviados)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pedidosEnviados.length} pedidos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valores a Receber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(totalReceber)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {valoresReceber.length} pedidos
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
                  {valoresEntregues.length} pedidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrar por Fornecedor</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs with Details */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="enviados">Enviados</TabsTrigger>
              <TabsTrigger value="receber">A Receber</TabsTrigger>
              <TabsTrigger value="entregues">Entregues</TabsTrigger>
            </TabsList>

            <TabsContent value="enviados" className="mt-4">
              {renderOrdersTable(pedidosEnviados, "bg-yellow-100 text-yellow-700 hover:bg-yellow-100")}
            </TabsContent>

            <TabsContent value="receber" className="mt-4">
              {renderOrdersTable(valoresReceber, "bg-blue-100 text-blue-700 hover:bg-blue-100")}
            </TabsContent>

            <TabsContent value="entregues" className="mt-4">
              {renderOrdersTable(valoresEntregues, "bg-green-100 text-green-700 hover:bg-green-100")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSummary;