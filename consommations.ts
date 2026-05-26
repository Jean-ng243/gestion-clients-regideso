import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export const consommationsTable = pgTable("consommations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientsTable.id, { onDelete: "cascade" }),
  mois: integer("mois").notNull(),
  annee: integer("annee").notNull(),
  m3Consommes: numeric("m3_consommes", { precision: 10, scale: 2 }).notNull(),
  dateReleve: timestamp("date_releve").notNull(),
});

export const insertConsommationSchema = createInsertSchema(consommationsTable).omit({ id: true });

export type InsertConsommation = z.infer<typeof insertConsommationSchema>;
export type Consommation = typeof consommationsTable.$inferSelect;
