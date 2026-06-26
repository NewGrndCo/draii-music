export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artist_profile: {
        Row: {
          artist_image_url: string | null
          bio: string | null
          detailed_bio: string | null
          footer_text: string | null
          frontend_sections: Json
          id: string
          location: string | null
          logo_url: string | null
          mailing_modal_enabled: boolean
          mailing_required: boolean
          player_layout: string
          socials: Json
          stripe_payment_link: string | null
          support_fund_enabled: boolean
          updated_at: string
        }
        Insert: {
          artist_image_url?: string | null
          bio?: string | null
          detailed_bio?: string | null
          footer_text?: string | null
          frontend_sections?: Json
          id?: string
          location?: string | null
          logo_url?: string | null
          mailing_modal_enabled?: boolean
          mailing_required?: boolean
          player_layout?: string
          socials?: Json
          stripe_payment_link?: string | null
          support_fund_enabled?: boolean
          updated_at?: string
        }
        Update: {
          artist_image_url?: string | null
          bio?: string | null
          detailed_bio?: string | null
          footer_text?: string | null
          frontend_sections?: Json
          id?: string
          location?: string | null
          logo_url?: string | null
          mailing_modal_enabled?: boolean
          mailing_required?: boolean
          player_layout?: string
          socials?: Json
          stripe_payment_link?: string | null
          support_fund_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          browser: string | null
          campaign_id: string
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          ip: string | null
          is_unique: boolean
          latitude: number | null
          longitude: number | null
          os: string | null
          referral_method: string | null
          region: string | null
          response_ms: number | null
          session_id: string | null
          user_agent: string | null
          visitor_hash: string | null
        }
        Insert: {
          browser?: string | null
          campaign_id: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          is_unique?: boolean
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          referral_method?: string | null
          region?: string | null
          response_ms?: number | null
          session_id?: string | null
          user_agent?: string | null
          visitor_hash?: string | null
        }
        Update: {
          browser?: string | null
          campaign_id?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          is_unique?: boolean
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          referral_method?: string | null
          region?: string | null
          response_ms?: number | null
          session_id?: string | null
          user_agent?: string | null
          visitor_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget_cents: number | null
          code: string
          created_at: string
          destination_id: string | null
          destination_kind: string
          destination_url: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          budget_cents?: number | null
          code: string
          created_at?: string
          destination_id?: string | null
          destination_kind?: string
          destination_url?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          budget_cents?: number | null
          code?: string
          created_at?: string
          destination_id?: string | null
          destination_kind?: string
          destination_url?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          donor_name: string | null
          id: string
          metadata: Json | null
          song_id: string | null
          source: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          donor_name?: string | null
          id?: string
          metadata?: Json | null
          song_id?: string | null
          source: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          donor_name?: string | null
          id?: string
          metadata?: Json | null
          song_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image: string | null
          created_at: string
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          status: string
          ticket_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          status?: string
          ticket_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          status?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          id: string
          label: string
          notes: string | null
          occurred_at: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          category?: string
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          occurred_at?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          occurred_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      listens: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          region: string | null
          song_id: string | null
          source: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          region?: string | null
          song_id?: string | null
          source?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          region?: string | null
          song_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listens_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      mailing_list: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          phone: string | null
          region: string | null
          user_agent: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          region?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          phone?: string | null
          region?: string | null
          user_agent?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      merch: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          sort_order: number
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          sort_order?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      merch_clicks: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          merch_id: string | null
          region: string | null
          song_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          merch_id?: string | null
          region?: string | null
          song_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          merch_id?: string | null
          region?: string | null
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_clicks_merch_id_fkey"
            columns: ["merch_id"]
            isOneToOne: false
            referencedRelation: "merch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_clicks_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      release_plans: {
        Row: {
          cover_url: string | null
          created_at: string
          id: string
          notes: string | null
          sort_order: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          sort_order?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      release_tracks: {
        Row: {
          created_at: string
          disc_number: number
          hidden: boolean
          release_id: string
          song_id: string
          track_number: number
        }
        Insert: {
          created_at?: string
          disc_number?: number
          hidden?: boolean
          release_id: string
          song_id: string
          track_number?: number
        }
        Update: {
          created_at?: string
          disc_number?: number
          hidden?: boolean
          release_id?: string
          song_id?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "release_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_tracks_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          copyright: string | null
          cover_path: string | null
          created_at: string
          description: string | null
          id: string
          label: string | null
          primary_artist: string
          release_date: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["release_status"]
          title: string
          type: Database["public"]["Enums"]["release_type"]
          upc: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["release_visibility"]
        }
        Insert: {
          copyright?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label?: string | null
          primary_artist: string
          release_date?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["release_status"]
          title: string
          type?: Database["public"]["Enums"]["release_type"]
          upc?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["release_visibility"]
        }
        Update: {
          copyright?: string | null
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          label?: string | null
          primary_artist?: string
          release_date?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["release_status"]
          title?: string
          type?: Database["public"]["Enums"]["release_type"]
          upc?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["release_visibility"]
        }
        Relationships: []
      }
      song_artists: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["artist_role"]
          song_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["artist_role"]
          song_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["artist_role"]
          song_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_artists_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_genres: {
        Row: {
          genre_id: string
          song_id: string
        }
        Insert: {
          genre_id: string
          song_id: string
        }
        Update: {
          genre_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_genres_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album_id: string | null
          artist: string | null
          bpm: number | null
          category: string | null
          composer: string | null
          created_at: string
          description: string | null
          dsp_link: string | null
          duration: number | null
          explicit: boolean
          file_path: string | null
          genre: string | null
          guest_artists: string[]
          hidden: boolean
          id: string
          is_collaboration: boolean
          isrc: string | null
          likes_count: number | null
          lyrics: string | null
          play_count: number | null
          preview_path: string | null
          producer: string | null
          release_date: string | null
          slug: string | null
          status: string | null
          support_fund_cents: number
          tags: string[] | null
          thumbnail_path: string | null
          title: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          album_id?: string | null
          artist?: string | null
          bpm?: number | null
          category?: string | null
          composer?: string | null
          created_at?: string
          description?: string | null
          dsp_link?: string | null
          duration?: number | null
          explicit?: boolean
          file_path?: string | null
          genre?: string | null
          guest_artists?: string[]
          hidden?: boolean
          id: string
          is_collaboration?: boolean
          isrc?: string | null
          likes_count?: number | null
          lyrics?: string | null
          play_count?: number | null
          preview_path?: string | null
          producer?: string | null
          release_date?: string | null
          slug?: string | null
          status?: string | null
          support_fund_cents?: number
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          album_id?: string | null
          artist?: string | null
          bpm?: number | null
          category?: string | null
          composer?: string | null
          created_at?: string
          description?: string | null
          dsp_link?: string | null
          duration?: number | null
          explicit?: boolean
          file_path?: string | null
          genre?: string | null
          guest_artists?: string[]
          hidden?: boolean
          id?: string
          is_collaboration?: boolean
          isrc?: string | null
          likes_count?: number | null
          lyrics?: string | null
          play_count?: number | null
          preview_path?: string | null
          producer?: string | null
          release_date?: string | null
          slug?: string | null
          status?: string | null
          support_fund_cents?: number
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      artist_role: "primary" | "featured" | "producer" | "composer" | "remixer"
      release_status: "draft" | "scheduled" | "published" | "archived"
      release_type:
        | "single"
        | "ep"
        | "album"
        | "compilation"
        | "collaboration"
        | "mixtape"
      release_visibility: "public" | "unlisted" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      artist_role: ["primary", "featured", "producer", "composer", "remixer"],
      release_status: ["draft", "scheduled", "published", "archived"],
      release_type: [
        "single",
        "ep",
        "album",
        "compilation",
        "collaboration",
        "mixtape",
      ],
      release_visibility: ["public", "unlisted", "private"],
    },
  },
} as const
