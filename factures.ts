import { pgTable, serial, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";
import { consommationsTable } from "./consommations";

export const statutPaiementEnum = pgEnum("statut_paiement", ["payee", "impayee", "en_attente"]);

export const facturesTable = pgTable("factures", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientsTable.id, { onDelete: "cascade" }),
  consommationId: integer("consommation_id").references(() => consommationsTable.id, { onDelete: "set null" }),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  statutPaiement: statutPaiementEnum("statut_paiement").notNull().default("en_attente"),
  dateEmission: timestamp("date_emission").notNull().defaultNow(),
  dateEcheance: timestamp("date_echeance"),
  datePaiement: timestamp("date_paiement"),
});

export const insertFactureSchema = createInsertSchema(facturesTable).omit({ id: true });

export type InsertFacture = z.infer<typeof insertFactureSchema>;
export type Facture = typeof facturesTable.$inferSelect;
