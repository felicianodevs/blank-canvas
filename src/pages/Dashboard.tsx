import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import background from "@/assets/background.webp";
import { Upload, FileText, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      toast.success(`Pedido "${selectedFile.name}" enviado com sucesso!`);
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" />
      
      <div className="w-full max-w-3xl relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <img src={logo} alt="Unimaq Logo" className="h-20 w-auto" />
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">Sistema de Pedidos</CardTitle>
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
    </div>
  );
};

export default Dashboard;
