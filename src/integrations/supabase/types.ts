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
          player_layout?: string
          socials?: Json
          stripe_payment_link?: string | null
          support_fund_enabled?: boolean
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
      listens: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          song_id: string | null
          source: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          song_id?: string | null
          source?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
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
      songs: {
        Row: {
          album_id: string | null
          artist: string | null
          bpm: number | null
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          file_path: string | null
          genre: string | null
          guest_artists: string[]
          id: string
          is_collaboration: boolean
          likes_count: number | null
          play_count: number | null
          preview_path: string | null
          release_date: string | null
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
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path?: string | null
          genre?: string | null
          guest_artists?: string[]
          id: string
          is_collaboration?: boolean
          likes_count?: number | null
          play_count?: number | null
          preview_path?: string | null
          release_date?: string | null
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
          created_at?: string
          description?: string | null
          duration?: number | null
          file_path?: string | null
          genre?: string | null
          guest_artists?: string[]
          id?: string
          is_collaboration?: boolean
          likes_count?: number | null
          play_count?: number | null
          preview_path?: string | null
          release_date?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
