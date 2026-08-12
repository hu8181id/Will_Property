import { z } from "zod";
import { and, desc, eq, gte, like, lte, or } from "drizzle-orm";
import { propertyListings, propertyReviews } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

export const propertyDraftSchema = z.object({
  title: z.string().trim().min(3, "Judul listing minimal 3 karakter"),
  description: z.string().trim().min(10, "Deskripsi listing minimal 10 karakter"),
  propertyType: z.string().trim().min(1),
  transactionType: z.string().trim().min(1).default("dijual"),
  price: z.number().int().positive(),
  location: z.string().trim().min(1),
  address: z.string().trim().optional(),
  area: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  floor: z.string().trim().optional(),
  tower: z.string().trim().optional(),
  view: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  certificate: z.string().trim().optional(),
  facilities: z.array(z.string().trim()).max(20).default([]),
  images: z.array(z.string().min(1)).min(1).max(5),
});

export const propertyFilterSchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  propertyType: z.string().trim().optional(),
  transactionType: z.string().trim().optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  status: z.string().trim().optional(),
  sortBy: z.enum(["terbaru", "harga-rendah", "harga-tinggi"]).default("terbaru"),
});

const legacyPropertySchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  location: z.string(),
  price: z.number(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  area: z.number().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

function toStorageBytes(value: string) {
  return Buffer.from(value.replace(/^data:[^;]+;base64,/, ""), "base64");
}

function isBase64Image(value: string) {
  return value.startsWith("data:image/");
}

async function uploadLegacyImage(value: string, index: number) {
  if (!isBase64Image(value)) return value;
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  const contentType = match?.[1] ?? "image/jpeg";
  const buffer = toStorageBytes(value);
  if (buffer.byteLength > 10 * 1024 * 1024) {
    throw new Error("Legacy image exceeds the upload limit");
  }
  const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const uploaded = await storagePut(
    `properties/migrated-${Date.now()}-${index}.${extension}`,
    buffer,
    contentType,
  );
  return uploaded.url;
}

function databaseError(error: unknown, context: string): never {
  console.error(`[Property ${context}]`, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Listing gagal disimpan. Silakan coba lagi.",
  });
}

export const propertyRouter = router({
  list: publicProcedure
    .input(propertyFilterSchema.optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const filters = { sortBy: "terbaru" as const, ...input };
      const conditions = [eq(propertyListings.status, filters.status ?? "active")];

      if (filters.propertyType && filters.propertyType !== "semua") {
        conditions.push(eq(propertyListings.propertyType, filters.propertyType));
      }
      if (filters.transactionType && filters.transactionType !== "semua") {
        conditions.push(eq(propertyListings.transactionType, filters.transactionType));
      }
      if (filters.location) {
        conditions.push(like(propertyListings.location, `%${filters.location}%`));
      }
      if (filters.search) {
        conditions.push(
          or(
            like(propertyListings.title, `%${filters.search}%`),
            like(propertyListings.location, `%${filters.search}%`),
            like(propertyListings.description, `%${filters.search}%`),
          )!,
        );
      }
      if (filters.priceMin !== undefined) {
        conditions.push(gte(propertyListings.price, filters.priceMin));
      }
      if (filters.priceMax !== undefined) {
        conditions.push(lte(propertyListings.price, filters.priceMax));
      }
      if (filters.bedrooms !== undefined) {
        conditions.push(gte(propertyListings.bedrooms, filters.bedrooms));
      }

      const orderBy = filters.sortBy === "harga-rendah"
        ? propertyListings.price
        : filters.sortBy === "harga-tinggi"
          ? desc(propertyListings.price)
          : desc(propertyListings.createdAt);

      return db
        .select()
        .from(propertyListings)
        .where(and(...conditions))
        .orderBy(orderBy);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(propertyListings).where(eq(propertyListings.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  create: adminProcedure
    .input(propertyDraftSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "Create");

      try {
        const [result] = await db.insert(propertyListings).values({
          ...input,
          address: input.address || null,
          area: input.area ?? null,
          bedrooms: input.bedrooms ?? null,
          bathrooms: input.bathrooms ?? null,
          floor: input.floor || null,
          tower: input.tower || null,
          view: input.view || null,
          condition: input.condition || null,
          certificate: input.certificate || null,
          status: "active",
        });

        try {
          await notifyOwner({
            title: `Listing Baru: ${input.title}`,
            content: `Listing properti baru berhasil ditambahkan di ${input.location} dengan harga Rp ${input.price.toLocaleString("id-ID")}.`,
          });
        } catch (e) {
          console.warn("[NotifyOwner] Gagal mengirim notifikasi pemilik:", e);
        }

        return { success: true, id: result.insertId };
      } catch (error) {
        return databaseError(error, "Create");
      }
    }),

  update: adminProcedure
    .input(propertyDraftSchema.extend({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "Update");

      try {
        const { id, ...values } = input;
        await db
          .update(propertyListings)
          .set({
            ...values,
            address: values.address || null,
            area: values.area ?? null,
            bedrooms: values.bedrooms ?? null,
            bathrooms: values.bathrooms ?? null,
            floor: values.floor || null,
            tower: values.tower || null,
            view: values.view || null,
            condition: values.condition || null,
            certificate: values.certificate || null,
          })
          .where(eq(propertyListings.id, id));
        return { success: true };
      } catch (error) {
        return databaseError(error, "Update");
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "Delete");

      try {
        await db.delete(propertyListings).where(eq(propertyListings.id, input.id));
        return { success: true };
      } catch (error) {
        return databaseError(error, "Delete");
      }
    }),

  uploadImage: adminProcedure
    .input(
      z.object({
        fileName: z.string().trim().min(1),
        base64Data: z.string().min(1),
        contentType: z.string().regex(/^image\//),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const buffer = toStorageBytes(input.base64Data);
        if (buffer.byteLength > 10 * 1024 * 1024) {
          throw new Error("Image exceeds the upload limit");
        }
        const extension = input.fileName.split(".").pop()?.toLowerCase() || "jpg";
        const uploaded = await storagePut(
          `properties/${Date.now()}-${crypto.randomUUID()}.${extension}`,
          buffer,
          input.contentType,
        );
        return { success: true, url: uploaded.url };
      } catch (error) {
        console.error("[Property Upload]", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengupload foto. Silakan coba lagi.",
        });
      }
    }),

  migrateLegacy: adminProcedure
    .input(z.object({ properties: z.array(legacyPropertySchema).max(100) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "Migration");
      if (input.properties.length === 0) return { success: true, migrated: 0 };

      const existing = await db.select({ id: propertyListings.id }).from(propertyListings).limit(1);
      if (existing.length > 0) {
        return { success: true, migrated: 0, skipped: true };
      }

      try {
        let migrated = 0;
        for (let propertyIndex = 0; propertyIndex < input.properties.length; propertyIndex += 1) {
          const item = input.properties[propertyIndex];
          const rawImages = item.images?.length ? item.images : item.image ? [item.image] : [];
          const images = [] as string[];
          for (let imageIndex = 0; imageIndex < rawImages.length; imageIndex += 1) {
            images.push(await uploadLegacyImage(rawImages[imageIndex], propertyIndex * 5 + imageIndex));
          }
          if (images.length === 0) continue;

          await db.insert(propertyListings).values({
            title: item.title,
            description: item.description || "Informasi properti tersedia melalui tim Primedeal.",
            propertyType: item.type || "lainnya",
            transactionType: "dijual",
            price: Math.max(0, Math.round(item.price)),
            location: item.location,
            address: null,
            area: item.area ?? null,
            bedrooms: item.beds ?? null,
            bathrooms: item.baths ?? null,
            facilities: [],
            images,
            status: "active",
          });
          migrated += 1;
        }
        return { success: true, migrated };
      } catch (error) {
        return databaseError(error, "Migration");
      }
    }),

  seedDefault: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { success: false, count: 0 };
    const existing = await db.select({ id: propertyListings.id }).from(propertyListings).limit(1);
    if (existing.length > 0) return { success: true, count: 0, skipped: true };

    const defaults = [
      {
        title: "Rumah Modern Mewah di Pondok Indah",
        description: "Hunian mewah berkonsep modern contemporary dengan kolam renang pribadi, taman luas, dan keamanan 24 jam di kawasan elite Jakarta Selatan.",
        propertyType: "rumah",
        transactionType: "dijual",
        price: 2500000000,
        location: "Jakarta Selatan",
        address: "Jl. Metro Pondok Indah No. 12",
        area: 250,
        bedrooms: 4,
        bathrooms: 3,
        condition: "Baru / Renovasi",
        certificate: "SHM",
        facilities: ["Kolam Renang", "Taman", "Garasi", "Keamanan 24 Jam", "AC"],
        images: ["/manus-storage/property-card-bg_4cd1dc11.png", "/manus-storage/modern-living-room_54b09ea3.png", "/manus-storage/property-showcase_99ecec32.png"],
        status: "active",
      },
      {
        title: "Apartemen Eksekutif SCBD Senayan",
        description: "Apartemen mewah siap huni di jantung distrik bisnis SCBD dengan fasilitas bintang lima dan akses strategis.",
        propertyType: "apartemen",
        transactionType: "dijual",
        price: 1800000000,
        location: "Jakarta Pusat",
        address: "Jl. Jend. Sudirman Kav. 52-53",
        area: 180,
        bedrooms: 3,
        bathrooms: 2,
        floor: "25",
        tower: "Tower A - The Residence",
        view: "City Skyline",
        condition: "Fully Furnished",
        certificate: "Strata Title",
        facilities: ["Lift Pribadi", "Kolam Renang Infinity", "Gym", "Parkir Basement", "Smart Home"],
        images: ["/manus-storage/modern-living-room_54b09ea3.png", "/manus-storage/property-card-bg_4cd1dc11.png"],
        status: "active",
      },
      {
        title: "Rumah Nyaman & Asri di Bintaro Jaya",
        description: "Rumah cluster dengan desain minimalis tropis, lingkungan tenang, bebas banjir, dan dekat fasilitas kota.",
        propertyType: "rumah",
        transactionType: "dijual",
        price: 1200000000,
        location: "Tangerang Selatan",
        address: "Bintaro Sektor 9",
        area: 150,
        bedrooms: 3,
        bathrooms: 2,
        condition: "Sangat Baik",
        certificate: "SHM",
        facilities: ["Carport", "Taman Belakang", "Cluster One Gate", "Jogging Track"],
        images: ["/manus-storage/property-showcase_99ecec32.png", "/manus-storage/property-card-bg_4cd1dc11.png"],
        status: "active",
      },
    ];

    await db.insert(propertyListings).values(defaults);
    return { success: true, count: defaults.length };
  }),

  listReviews: publicProcedure
    .input(z.object({ propertyId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        const rows = await db
          .select()
          .from(propertyReviews)
          .where(eq(propertyReviews.propertyId, input.propertyId))
          .orderBy(desc(propertyReviews.createdAt));
        return rows;
      } catch (error) {
        console.error("[Property Reviews List]", error);
        return [];
      }
    }),

  addReview: publicProcedure
    .input(
      z.object({
        propertyId: z.number().int().positive(),
        authorName: z.string().trim().min(2, "Nama minimal 2 karakter"),
        rating: z.number().int().min(1).max(5),
        comment: z.string().trim().min(5, "Ulasan minimal 5 karakter"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database tidak tersedia" });
      try {
        await db.insert(propertyReviews).values({
          propertyId: input.propertyId,
          authorName: input.authorName,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true };
      } catch (error) {
        console.error("[Property Add Review]", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gagal menyimpan ulasan" });
      }
    }),
});

export type PropertyDraft = z.infer<typeof propertyDraftSchema>;
