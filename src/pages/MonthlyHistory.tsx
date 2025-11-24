import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import { ArrowLeft, FileText, Calendar, MessageSquare, Upload } from "lucide-react";

// Mapping for month abbreviations to full names
const monthNames: { [key: string]: string } = {
  "Jan": "JANEIRO",
  "Fev": "FEVEREIRO",
  "Mar": "MARÇO",
  "Abr": "ABRIL",
  "Mai": "MAIO",
  "Jun": "JUNHO",
  "Jul": "JULHO",
  "Ago": "AGOSTO",
  "Set": "SETEMBRO",
  "Out": "OUTUBRO",
  "Nov": "NOVEMBRO",
  "Dez": "DEZEMBRO",
};

// Mock data for monthly details
const monthlyData: { [key: string]: any[] } = {
  "Jan": [
    { id: 1, data: "05/01/2024", arquivo: "pedido_001.pdf", fornecedor: "Fornecedor ABC", valor: 12500, status: "Aprovado", comentario: "Urgente para produção" },
    { id: 2, data: "12/01/2024", arquivo: "pedido_002.pdf", fornecedor: "Fornecedor XYZ", valor: 8700, status: "Em Análise", comentario: "Aguardando cotação" },
    { id: 3, data: "18/01/2024", arquivo: "pedido_003.pdf", fornecedor: "Fornecedor DEF", valor: 15300, status: "Aprovado", comentario: "Compra de material elétrico" },
  ],
  "Fev": [
    { id: 4, data: "03/02/2024", arquivo: "pedido_004.pdf", fornecedor: "Fornecedor ABC", valor: 9800, status: "Pendente", comentario: "Revisão de preços necessária" },
    { id: 5, data: "15/02/2024", arquivo: "pedido_005.pdf", fornecedor: "Fornecedor GHI", valor: 11200, status: "Aprovado", comentario: "Material para manutenção" },
  ],
  "Mar": [
    { id: 6, data: "08/03/2024", arquivo: "pedido_006.pdf", fornecedor: "Fornecedor XYZ", valor: 18500, status: "Aprovado", comentario: "Peças de reposição" },
    { id: 7, data: "14/03/2024", arquivo: "pedido_007.pdf", fornecedor: "Fornecedor JKL", valor: 7200, status: "Em Análise", comentario: "Aguardando aprovação gerencial" },
    { id: 8, data: "22/03/2024", arquivo: "pedido_008.pdf", fornecedor: "Fornecedor ABC", valor: 13800, status: "Aprovado", comentario: "Compra programada" },
  ],
  "Abr": [
    { id: 9, data: "05/04/2024", arquivo: "pedido_009.pdf", fornecedor: "Fornecedor DEF", valor: 16400, status: "Aprovado", comentario: "Material para novo projeto" },
    { id: 10, data: "19/04/2024", arquivo: "pedido_010.pdf", fornecedor: "Fornecedor GHI", valor: 9300, status: "Pendente", comentario: "Verificar disponibilidade" },
  ],
  "Mai": [
    { id: 11, data: "02/05/2024", arquivo: "pedido_011.pdf", fornecedor: "Fornecedor ABC", valor: 21000, status: "Aprovado", comentario: "Grande volume" },
    { id: 12, data: "11/05/2024", arquivo: "pedido_012.pdf", fornecedor: "Fornecedor XYZ", valor: 14500, status: "Em Análise", comentario: "Cotação em andamento" },
    { id: 13, data: "20/05/2024", arquivo: "pedido_013.pdf", fornecedor: "Fornecedor JKL", valor: 8900, status: "Aprovado", comentario: "Manutenção preventiva" },
  ],
};

const MonthlyHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const month = searchParams.get("month") || "Jan";
  const fullMonthName = monthNames[month] || month;
  
  const orders = monthlyData[month] || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprovado":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50";
      case "Em Análise":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50";
      case "Pendente":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const totalValue = orders.reduce((sum, order) => sum + order.valor, 0);

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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl lg:text-3xl">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                  Histórico Mensal - {fullMonthName}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Todos os pedidos e apontamentos do mês
                </CardDescription>
              </div>
              <div className="text-left lg:text-right w-full lg:w-auto">
                <p className="text-sm text-muted-foreground">Total do Mês</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-muted-foreground">{orders.length} pedidos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">Nenhum pedido encontrado para este mês</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Comentários</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.data}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                            {order.arquivo}
                          </div>
                        </TableCell>
                        <TableCell>{order.fornecedor}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(order.valor)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{order.comentario}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyHistory;
