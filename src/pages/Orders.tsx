import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import { ArrowLeft, FileText, Download, Eye, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for orders
const mockOrders = [
  { id: "001", date: "2025-01-15", supplier: "Fornecedor ABC", value: 15000.00, status: "pending", file: "pedido_001.pdf" },
  { id: "002", date: "2025-01-18", supplier: "Fornecedor XYZ", value: 8500.00, status: "approved", file: "pedido_002.pdf" },
  { id: "003", date: "2025-01-20", supplier: "Fornecedor ABC", value: 22000.00, status: "pending", file: "pedido_003.xlsx" },
  { id: "004", date: "2025-01-22", supplier: "Fornecedor DEF", value: 12300.00, status: "approved", file: "pedido_004.pdf" },
  { id: "005", date: "2025-01-25", supplier: "Fornecedor GHI", value: 18700.00, status: "processing", file: "pedido_005.pdf" },
  { id: "006", date: "2025-01-28", supplier: "Fornecedor XYZ", value: 9500.00, status: "pending", file: "pedido_006.docx" },
  { id: "007", date: "2025-01-30", supplier: "Fornecedor ABC", value: 31000.00, status: "approved", file: "pedido_007.pdf" },
  { id: "008", date: "2025-02-02", supplier: "Fornecedor JKL", value: 14500.00, status: "processing", file: "pedido_008.pdf" },
];

const statusLabels = {
  pending: { label: "Pendente", variant: "secondary" as const },
  processing: { label: "Em Análise", variant: "default" as const },
  approved: { label: "Aprovado", variant: "default" as const },
};

const Orders = () => {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [observation, setObservation] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedOrders = [...mockOrders].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleViewOrder = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setObservation('');
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
      
      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <img src={logo} alt="Unimaq Logo" className="h-20 w-auto" />
          <Button 
            variant="secondary" 
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Pedidos de Compra</CardTitle>
            <CardDescription className="text-base">
              Todos os pedidos anexados e seu status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Data
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleSortOrder}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{order.file}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.value)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[order.status].variant}>
                          {statusLabels[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Visualize o pedido de compra e adicione observações
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{selectedOrder.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusLabels[selectedOrder.status].variant}>
                    {statusLabels[selectedOrder.status].label}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedOrder.file}</p>
                    <p className="text-sm text-muted-foreground">Arquivo do pedido de compra</p>
                  </div>
                </div>
                <div className="bg-background rounded border p-8 min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>Pré-visualização do arquivo</p>
                    <p className="text-xs mt-1">{selectedOrder.file}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  placeholder="Adicione observações sobre este pedido..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  console.log('Observação salva:', observation);
                  setSelectedOrder(null);
                }}>
                  Salvar Observação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
