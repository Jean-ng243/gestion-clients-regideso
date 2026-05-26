import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clientsTable } from "./clients";

export const typeReclamationEnum = pgEnum("type_reclamation", ["fuite", "facturation", "coupure", "qualite", "autre"]);
export const statutReclamationEnum = pgEnum("statut_reclamation", ["ouverte", "en_cours", "resolue", "fermee"]);

export const reclamationsTable = pgTable("reclamations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clientsTable.id, { onDelete: "cascade" }),
  type: typeReclamationEnum("type").notNull(),
  description: text("description").notNull(),
  statut: statutReclamationEnum("statut").notNull().default("ouverte"),
  dateCreation: timestamp("date_creation").notNull().defaultNow(),
  dateResolution: timestamp("date_resolution"),
});

export const insertReclamationSchema = createInsertSchema(reclamationsTable).omit({ id: true, dateCreation: true });

export type InsertReclamation = z.infer<typeof insertReclamationSchema>;
export type Reclamation = typeof reclamationsTable.$inferSelect;
