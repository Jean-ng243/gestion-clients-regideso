import { Router } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, clientsTable, facturesTable, reclamationsTable, consommationsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [totalClients] = await db.select({ count: count() }).from(clientsTable);
  const [clientsActifs] = await db
    .select({ count: count() })
    .from(clientsTable)
    .where(eq(clientsTable.statut, "actif"));
  const [clientsSuspendus] = await db
    .select({ count: count() })
    .from(clientsTable)
    .where(eq(clientsTable.statut, "suspendu"));
  const [totalFactures] = await db.select({ count: count() }).from(facturesTable);
  const [facturesImpayees] = await db
    .select({ count: count() })
    .from(facturesTable)
    .where(eq(facturesTable.statutPaiement, "impayee"));
  const [montantImpaye] = await db
    .select({ total: sum(facturesTable.montant) })
    .from(facturesTable)
    .where(eq(facturesTable.statutPaiement, "impayee"));
  const [reclamationsOuvertes] = await db
    .select({ count: count() })
    .from(reclamationsTable)
    .where(eq(reclamationsTable.statut, "ouverte"));
  const [totalConsommationMois] = await db
    .select({ total: sum(consommationsTable.m3Consommes) })
    .from(consommationsTable)
    .where(
      sql`${consommationsTable.mois} = ${currentMonth} AND ${consommationsTable.annee} = ${currentYear}`
    );

  return res.json({
    totalClients: totalClients.count,
    clientsActifs: clientsActifs.count,
    clientsSuspendus: clientsSuspendus.count,
    totalFactures: totalFactures.count,
    facturesImpayees: facturesImpayees.count,
    montantImpaye: Number(montantImpaye.total ?? 0),
    reclamationsOuvertes: reclamationsOuvertes.count,
    totalConsommationMois: Number(totalConsommationMois.total ?? 0),
  });
});

router.get("/dashboard/consommations-mensuelles", async (req, res) => {
  const MOIS_LABELS = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
    "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
  ];

  const rows = await db
    .select({
      mois: consommationsTable.mois,
      annee: consommationsTable.annee,
      totalM3: sum(consommationsTable.m3Consommes),
    })
    .from(consommationsTable)
    .groupBy(consommationsTable.annee, consommationsTable.mois)
    .orderBy(consommationsTable.annee, consommationsTable.mois)
    .limit(12);

  return res.json(
    rows.map((r) => ({
      mois: r.mois,
      annee: r.annee,
      totalM3: Number(r.totalM3 ?? 0),
      label: `${MOIS_LABELS[r.mois - 1]} ${r.annee}`,
    }))
  );
});

router.get("/dashboard/reclamations-par-type", async (req, res) => {
  const rows = await db
    .select({
      type: reclamationsTable.type,
      count: count(),
    })
    .from(reclamationsTable)
    .groupBy(reclamationsTable.type);

  return res.json(
    rows.map((r) => ({
      type: r.type,
      count: r.count,
    }))
  );
});

export default router;
