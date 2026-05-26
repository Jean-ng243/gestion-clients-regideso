import React from "react";
import { Link, useParams } from "wouter";
import { useGetClient, useGetClientConsommations, useGetClientFactures, useUpdateClient } from "@workspace/api-client-react";
import { getGetClientQueryKey, getGetClientConsommationsQueryKey, getGetClientFacturesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Phone, Mail, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: client, isLoading: clientLoading } = useGetClient(id, { query: { enabled: !!id, queryKey: getGetClientQueryKey(id) } });
  const { data: consommations, isLoading: consoLoading } = useGetClientConsommations(id, { query: { enabled: !!id, queryKey: getGetClientConsommationsQueryKey(id) } });
  const { data: factures, isLoading: facturesLoading } = useGetClientFactures(id, { query: { enabled: !!id, queryKey: getGetClientFacturesQueryKey(id) } });

  const updateClientStatus = useUpdateClient();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "actif": return "bg-green-500 text-white";
      case "inactif": return "bg-gray-500 text-white";
      case "suspendu": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "payee": return "bg-green-500 text-white";
      case "en_attente": return "bg-yellow-500 text-white";
      case "impayee": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const handleToggleStatus = () => {
    if (!client) return;
    const newStatus = client.statut === "actif" ? "suspendu" : "actif";
    updateClientStatus.mutate(
      { id, data: { statut: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(id) });
          toast({
            title: "Statut mis à jour",
            description: `Le client est maintenant ${newStatus}.`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le statut.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!client) {
    return <div>Client non trouvé.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">Fiche Abonné</h1>
        <Badge className={`${getStatusColor(client.statut)} border-none text-sm px-3 py-1`}>
          {client.statut.toUpperCase()}
        </Badge>
        <Button onClick={handleToggleStatus} variant={client.statut === "actif" ? "destructive" : "default"}>
          {client.statut === "actif" ? "Suspendre" : "Réactiver"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{client.nom} {client.prenom}</CardTitle>
            <CardDescription>Informations de contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{client.numeroAbonnement}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.adresse}, {client.quartier || "-"}, {client.commune || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{client.telephone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Inscrit le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dossier</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="consommations" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-4">
                <TabsTrigger value="consommations" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
                  Consommations
                </TabsTrigger>
                <TabsTrigger value="factures" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
                  Factures
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="consommations" className="m-0">
                {consoLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : consommations && consommations.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Période</TableHead>
                          <TableHead>Date de relevé</TableHead>
                          <TableHead className="text-right">Volume (m³)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consommations.map((conso) => (
                          <TableRow key={conso.id}>
                            <TableCell>{conso.mois.toString().padStart(2, '0')}/{conso.annee}</TableCell>
                            <TableCell>{new Date(conso.dateReleve).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right font-medium">{conso.m3Consommes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">Aucune consommation enregistrée.</div>
                )}
              </TabsContent>
              
              <TabsContent value="factures" className="m-0">
                {facturesLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : factures && factures.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Facture</TableHead>
                          <TableHead>Émission</TableHead>
                          <TableHead>Échéance</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Montant (FC)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {factures.map((facture) => (
                          <TableRow key={facture.id}>
                            <TableCell className="font-mono text-xs">F-{facture.id.toString().padStart(6, '0')}</TableCell>
                            <TableCell>{new Date(facture.dateEmission).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>{facture.dateEcheance ? new Date(facture.dateEcheance).toLocaleDateString('fr-FR') : '-'}</TableCell>
                            <TableCell>
                              <Badge className={`${getPaymentStatusColor(facture.statutPaiement)} border-none text-[10px]`}>
                                {facture.statutPaiement.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{facture.montant.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">Aucune facture émise.</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
