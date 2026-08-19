import { z } from "zod";
import { and, desc, eq, gte, like, lte, or } from "drizzle-orm";
import { propertyIndexingQueue, propertyLeads, propertyListings, propertyReviews } from "../../drizzle/schema";
import { sendWhatsAppAgentNotification } from "../whatsappMeta";
import { getDb } from "../db";
import { normalizeStoredMediaUrl, storagePut } from "../storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import { buildPropertySlug } from "../../shared/propertySlug";
import { enqueuePropertyIndexing, listPropertyIndexingStatuses } from "../propertyIndexing";

const optionalMediaUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(1000).refine(
    (value) => value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value),
    "URL media harus menggunakan http(s) atau file S3 Primedeal.",
  ).optional(),
);

export const propertyDraftSchema = z.object({
  title: z.string().trim().min(3, "Judul listing minimal 3 karakter"),
  description: z.string().trim().min(10, "Deskripsi listing minimal 10 karakter"),
  propertyType: z.string().trim().min(1),
  transactionType: z.string().trim().min(1).default("dijual"),
  price: z.number().positive("Harga harus berupa angka positif"),
  location: z.string().trim().min(1, "Lokasi wajib diisi"),
  address: z.string().trim().max(500).optional().nullable(),
  area: z.number().positive().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  floor: z.string().trim().max(50).optional().nullable(),
  tower: z.string().trim().max(50).optional().nullable(),
  view: z.string().trim().max(100).optional().nullable(),
  condition: z.string().trim().max(100).optional().nullable(),
  certificate: z.string().trim().max(100).optional().nullable(),
  facilities: z.array(z.string().trim()).default([]),
  images: z.array(z.string().trim()).min(1, "Minimal unggah 1 foto properti"),
  videoUrl: optionalMediaUrl,
  videoThumbnailUrl: optionalMediaUrl,
  virtualTourUrl: optionalMediaUrl,
});

export const propertyFilterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  propertyType: z.string().optional(),
  transactionType: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().optional(),
  sortBy: z.enum(["terbaru", "termurah", "termahal"]).optional(),
});

export const whatsappLeadSchema = z.object({
  propertyId: z.number().int().positive(),
  visitorId: z.string().optional(),
  path: z.string().optional(),
});

export const reviewDraftSchema = z.object({
  propertyId: z.number().int().positive(),
  authorName: z.string().trim().min(2, "Nama minimal 2 karakter"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Komentar minimal 5 karakter"),
});

const legacyPropertySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  price: z.number(),
  location: z.string(),
  area: z.number().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
});

function isBase64Image(value: string) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function toStorageBytes(value: string): Buffer {
  const base64Data = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

function formatPropertyRow(property: any) {
  return {
    ...property,
    facilities: Array.isArray(property.facilities) ? property.facilities : [],
    images: Array.isArray(property.images)
      ? property.images.map((image: unknown) => typeof image === "string" ? normalizeStoredMediaUrl(image) ?? image : image)
      : property.images,
    videoUrl: normalizeStoredMediaUrl(property.videoUrl),
    videoThumbnailUrl: normalizeStoredMediaUrl(property.videoThumbnailUrl),
  };
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
      const conditions = [];

      if (filters.search) {
        conditions.push(
          or(
            like(propertyListings.title, `%${filters.search}%`),
            like(propertyListings.location, `%${filters.search}%`),
            like(propertyListings.description, `%${filters.search}%`),
          ),
        );
      }
      if (filters.location && filters.location !== "Semua") {
        conditions.push(eq(propertyListings.location, filters.location));
      }
      if (filters.propertyType && filters.propertyType !== "semua") {
        conditions.push(eq(propertyListings.propertyType, filters.propertyType));
      }
      if (filters.transactionType && filters.transactionType !== "semua") {
        conditions.push(eq(propertyListings.transactionType, filters.transactionType));
      }
      if (filters.minPrice !== undefined) {
        conditions.push(gte(propertyListings.price, filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(propertyListings.price, filters.maxPrice));
      }
      if (filters.bedrooms !== undefined) {
        conditions.push(gte(propertyListings.bedrooms, filters.bedrooms));
      }

      try {
        let query = db.select().from(propertyListings);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        if (filters.sortBy === "termurah") {
          query = query.orderBy(propertyListings.price) as any;
        } else if (filters.sortBy === "termahal") {
          query = query.orderBy(desc(propertyListings.price)) as any;
        } else {
          query = query.orderBy(desc(propertyListings.createdAt)) as any;
        }

        const rows = await query;
        return rows.map(formatPropertyRow);
      } catch (error) {
        console.error("[Property List]", error);
        return [];
      }
    }),

  indexingStatus: publicProcedure.query(async () => {
    return await listPropertyIndexingStatuses();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      try {
        const rows = await db
          .select()
          .from(propertyListings)
          .where(eq(propertyListings.id, input.id))
          .limit(1);
        if (!rows[0]) return null;
        return formatPropertyRow(rows[0]);
      } catch (error) {
        console.error("[Property GetById]", error);
        return null;
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      try {
        const rows = await db
          .select()
          .from(propertyListings)
          .where(eq(propertyListings.slug, input.slug))
          .limit(1);
        if (!rows[0]) return null;
        return formatPropertyRow(rows[0]);
      } catch (error) {
        console.error("[Property GetBySlug]", error);
        return null;
      }
    }),

  create: adminProcedure
    .input(propertyDraftSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "Create");

      try {
        const [result] = await db.insert(propertyListings).values({
          title: input.title,
          description: input.description,
          propertyType: input.propertyType,
          transactionType: input.transactionType,
          price: Math.max(0, Math.round(input.price)),
          location: input.location,
          address: input.address || null,
          area: input.area ?? null,
          bedrooms: input.bedrooms ?? null,
          bathrooms: input.bathrooms ?? null,
          facilities: input.facilities,
          images: input.images,
          floor: input.floor || null,
          tower: input.tower || null,
          view: input.view || null,
          condition: input.condition || null,
          certificate: input.certificate || null,
          videoUrl: input.videoUrl || null,
          videoThumbnailUrl: input.videoThumbnailUrl || null,
          virtualTourUrl: input.virtualTourUrl || null,
          status: "active",
        });
        const id = Number(result.insertId);
        const slug = buildPropertySlug(input.title, id);
        await db.update(propertyListings).set({ slug }).where(eq(propertyListings.id, id));
        await enqueuePropertyIndexing({ id, title: input.title, slug });

        try {
          await notifyOwner({
            title: `Listing Baru: ${input.title}`,
            content: `Listing properti baru berhasil ditambahkan di ${input.location} dengan harga Rp ${input.price.toLocaleString("id-ID")}.`,
          });
        } catch (e) {
          console.warn("[NotifyOwner] Gagal mengirim notifikasi pemilik:", e);
        }

        return { success: true, id, slug };
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
        const slug = buildPropertySlug(values.title, id);
        await db
          .update(propertyListings)
          .set({
            ...values,
            slug,
            address: values.address || null,
            area: values.area ?? null,
            bedrooms: values.bedrooms ?? null,
            bathrooms: values.bathrooms ?? null,
            floor: values.floor || null,
            tower: values.tower || null,
            view: values.view || null,
            condition: values.condition || null,
            certificate: values.certificate || null,
            videoUrl: values.videoUrl || null,
            videoThumbnailUrl: values.videoThumbnailUrl || null,
            virtualTourUrl: values.virtualTourUrl || null,
          })
          .where(eq(propertyListings.id, id));
        await enqueuePropertyIndexing({ id, title: values.title, slug });
        return { success: true };
      } catch (error) {
        return databaseError(error, "Update");
      }
    }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["active", "sold", "inactive"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return databaseError(new Error("Database unavailable"), "UpdateStatus");

      try {
        await db
          .update(propertyListings)
          .set({ status: input.status })
          .where(eq(propertyListings.id, input.id));
        return { success: true };
      } catch (error) {
        return databaseError(error, "UpdateStatus");
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

          const [result] = await db.insert(propertyListings).values({
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
          const id = Number(result.insertId);
          await db.update(propertyListings).set({ slug: buildPropertySlug(item.title, id) }).where(eq(propertyListings.id, id));
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

  listWhatsAppLeads: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(propertyLeads).orderBy(desc(propertyLeads.createdAt)).limit(50);
    } catch (error) {
      console.error("[WhatsApp Leads List]", error);
      return [];
    }
  }),

  recordWhatsAppLead: publicProcedure
    .input(whatsappLeadSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, logged: false };

      const rows = await db
        .select({ id: propertyListings.id, title: propertyListings.title })
        .from(propertyListings)
        .where(and(eq(propertyListings.id, input.propertyId), eq(propertyListings.status, "active")))
        .limit(1);
      const property = rows[0];
      if (!property) return { success: false, logged: false };

      let deliveryResult: { deliveryStatus: "sent" | "failed" | "skipped"; whatsappMessageId?: string; deliveryError?: string } = { deliveryStatus: "skipped" };
      try {
        deliveryResult = await sendWhatsAppAgentNotification({
          propertyId: property.id,
          propertyTitle: property.title,
          visitorId: input.visitorId,
          path: input.path,
        });
      } catch (err: any) {
        deliveryResult = {
          deliveryStatus: "failed",
          deliveryError: err?.message || String(err),
        };
      }

      try {
        await db.insert(propertyLeads).values({
          propertyId: property.id,
          propertyTitle: property.title,
          source: "listing_whatsapp",
          visitorId: input.visitorId || null,
          path: input.path || null,
          status: "new",
          deliveryStatus: deliveryResult.deliveryStatus,
          deliveryError: deliveryResult.deliveryError || null,
          whatsappMessageId: deliveryResult.whatsappMessageId || null,
        });
        return { 
          success: true, 
          logged: true, 
          propertyId: property.id,
          deliveryStatus: deliveryResult.deliveryStatus 
        };
      } catch (error) {
        console.warn("[WhatsApp Lead] Gagal mencatat minat calon pembeli:", error);
        return { success: false, logged: false };
      }
    }),

  listReviews: publicProcedure
    .input(z.object({ propertyId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { reviews: [], averageRating: 0, reviewCount: 0 };
      try {
        const reviews = await db
          .select()
          .from(propertyReviews)
          .where(
            and(
              eq(propertyReviews.propertyId, input.propertyId),
              eq(propertyReviews.reviewStatus, "approved"),
            ),
          )
          .orderBy(desc(propertyReviews.createdAt));
        const averageRating = reviews.length > 0
          ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
          : 0;
        return { reviews, averageRating, reviewCount: reviews.length };
      } catch (error) {
        console.error("[Property Reviews List]", error);
        return { reviews: [], averageRating: 0, reviewCount: 0 };
      }
    }),

  addReview: publicProcedure
    .input(reviewDraftSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database tidak tersedia" });
      try {
        const property = await db
          .select({ id: propertyListings.id })
          .from(propertyListings)
          .where(eq(propertyListings.id, input.propertyId))
          .limit(1);
        if (!property[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Properti tidak ditemukan" });
        }

        await db.insert(propertyReviews).values({
          propertyId: input.propertyId,
          authorName: input.authorName,
          rating: input.rating,
          comment: input.comment,
          reviewStatus: "pending",
        });
        return { success: true, status: "pending" as const };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Property Add Review]", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gagal mengirim ulasan" });
      }
    }),

});
