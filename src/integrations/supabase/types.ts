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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          match_count: number | null
          matched_at: string | null
          restaurant_data: Json | null
          restaurant_id: string
          restaurant_name: string
          room_id: string | null
        }
        Insert: {
          id?: string
          match_count?: number | null
          matched_at?: string | null
          restaurant_data?: Json | null
          restaurant_id: string
          restaurant_name: string
          room_id?: string | null
        }
        Update: {
          id?: string
          match_count?: number | null
          matched_at?: string | null
          restaurant_data?: Json | null
          restaurant_id?: string
          restaurant_name?: string
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_rankings: {
        Row: {
          id: string
          restaurant_data: Json | null
          restaurant_id: string
          restaurant_image: string | null
          restaurant_name: string
          total_likes: number | null
          total_matches: number | null
          total_views: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          restaurant_data?: Json | null
          restaurant_id: string
          restaurant_image?: string | null
          restaurant_name: string
          total_likes?: number | null
          total_matches?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          restaurant_data?: Json | null
          restaurant_id?: string
          restaurant_image?: string | null
          restaurant_name?: string
          total_likes?: number | null
          total_matches?: number | null
          total_views?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          avatar_emoji: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          nickname: string
          room_id: string | null
          user_session_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          nickname: string
          room_id?: string | null
          user_session_id: string
        }
        Update: {
          avatar_emoji?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          nickname?: string
          room_id?: string | null
          user_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string | null
          host_id: string
          id: string
          location_lat: number | null
          location_lng: number | null
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string | null
          host_id: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string | null
          host_id?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          participant_id: string | null
          restaurant_id: string
          restaurant_image: string | null
          restaurant_name: string
          restaurant_rating: number | null
          room_id: string | null
          vote_type: string
          voted_at: string | null
        }
        Insert: {
          id?: string
          participant_id?: string | null
          restaurant_id: string
          restaurant_image?: string | null
          restaurant_name: string
          restaurant_rating?: number | null
          room_id?: string | null
          vote_type: string
          voted_at?: string | null
        }
        Update: {
          id?: string
          participant_id?: string | null
          restaurant_id?: string
          restaurant_image?: string | null
          restaurant_name?: string
          restaurant_rating?: number | null
          room_id?: string | null
          vote_type?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "room_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
