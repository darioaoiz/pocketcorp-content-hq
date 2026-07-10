export type Platform = "instagram" | "linkedin";

export type ContentEstado =
  | "borrador"
  | "copy_generado"
  | "creativo_generado"
  | "pendiente_aprobacion"
  | "aprobado";

export type CreativeJobStatus = "idle" | "failed" | "completed";

export interface BrandBibleVersionRow {
  id: string;
  version_number: number;
  identity: string;
  offering: string;
  target_audience: string;
  voice_tone: string;
  content_pillars: string[];
  prohibitions: string[];
  raw_notes: string | null;
  visual_style: string;
  is_current: boolean;
  created_at: string;
}

export interface DirectorRow {
  id: string;
  name: string;
  role: string | null;
  color_hex: string;
  reference_image_urls: string[];
  created_at: string;
}

export interface ContentItemRow {
  id: string;
  platform: Platform;
  pilar: string;
  idea_breve: string | null;
  copy: string | null;
  estado: ContentEstado;
  fecha_planificada: string;
  director_ids: string[];
  image_url: string | null;
  image_storage_path: string | null;
  creative_job_status: CreativeJobStatus;
  brand_bible_version_id: string | null;
  user_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

// TypeScript no considera una `interface` nombrada estructuralmente
// compatible con `Record<string, unknown>` cuando queda anidada dentro de
// otro chequeo generico (a diferencia de un tipo objeto literal). Sin este
// wrapper, supabase-js resuelve el `Schema` de `createClient<Database>()` a
// `never` en silencio y cualquier `.insert()/.update()/.rpc()` deja de
// tipar sus argumentos. Ver tambien Views/Functions mas abajo.
type Simplify<T> = { [K in keyof T]: T[K] };

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: Simplify<AdminUserRow>;
        Insert: Simplify<Partial<AdminUserRow> & Pick<AdminUserRow, "email" | "password_hash">>;
        Update: Simplify<Partial<AdminUserRow>>;
        Relationships: [];
      };
      brand_bible_versions: {
        Row: Simplify<BrandBibleVersionRow>;
        Insert: Simplify<
          Partial<BrandBibleVersionRow> &
            Pick<
              BrandBibleVersionRow,
              "identity" | "offering" | "target_audience" | "voice_tone" | "content_pillars" | "prohibitions"
            >
        >;
        Update: Simplify<Partial<BrandBibleVersionRow>>;
        Relationships: [];
      };
      directors: {
        Row: Simplify<DirectorRow>;
        Insert: Simplify<Partial<DirectorRow> & Pick<DirectorRow, "name" | "color_hex">>;
        Update: Simplify<Partial<DirectorRow>>;
        Relationships: [];
      };
      content_items: {
        Row: Simplify<ContentItemRow>;
        Insert: Simplify<Partial<ContentItemRow> & Pick<ContentItemRow, "platform" | "pilar" | "fecha_planificada">>;
        Update: Simplify<Partial<ContentItemRow>>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_brand_bible_version: {
        Args: Simplify<{
          p_identity: string;
          p_offering: string;
          p_target_audience: string;
          p_voice_tone: string;
          p_content_pillars: string[];
          p_prohibitions: string[];
          p_raw_notes: string | null;
          p_visual_style: string;
        }>;
        Returns: Simplify<BrandBibleVersionRow>;
      };
    };
  };
}
