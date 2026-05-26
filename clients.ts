import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const statutClientEnum = pgEnum("statut_client", ["actif", "inactif", "suspendu"]);

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  numeroAbonnement: text("numero_abonnement").notNull().unique(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  adresse: text("adresse").notNull(),
  telephone: text("telephone").notNull(),
  email: text("email"),
  statut: statutClientEnum("statut").notNull().default("actif"),
  quartier: text("quartier"),
  commune: text("commune"),
  dateInscription: timestamp("date_inscription").notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({
  id: true,
  dateInscription: true,
  numeroAbonnement: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
