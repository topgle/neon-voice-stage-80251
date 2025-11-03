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
      participants: {
        Row: {
          avatar_url: string | null
          display_name: string
          id: string
          joined_at: string
          preferred_songs: string[] | null
          session_id: string
          total_score: number | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name: string
          id?: string
          joined_at?: string
          preferred_songs?: string[] | null
          session_id: string
          total_score?: number | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          id?: string
          joined_at?: string
          preferred_songs?: string[] | null
          session_id?: string
          total_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "the_voices_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      performances: {
        Row: {
          created_at: string
          expression_score: number | null
          feedback_text: string | null
          id: string
          participant_id: string
          performed_at: string
          pitch_accuracy: number | null
          rhythm_accuracy: number | null
          score: number
          session_id: string
          song_id: string
        }
        Insert: {
          created_at?: string
          expression_score?: number | null
          feedback_text?: string | null
          id?: string
          participant_id: string
          performed_at?: string
          pitch_accuracy?: number | null
          rhythm_accuracy?: number | null
          score?: number
          session_id: string
          song_id: string
        }
        Update: {
          created_at?: string
          expression_score?: number | null
          feedback_text?: string | null
          id?: string
          participant_id?: string
          performed_at?: string
          pitch_accuracy?: number | null
          rhythm_accuracy?: number | null
          score?: number
          session_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performances_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performances_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "the_voices_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performances_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_songs: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          position: number
          song_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          added_at: string
          album: string | null
          artist: string
          bpm: number | null
          created_at: string
          downloadable: boolean | null
          duration: number
          file_path: string | null
          fingerprint: string | null
          format: Database["public"]["Enums"]["song_format"]
          genre: string | null
          id: string
          instrumental_track_path: string | null
          key: string | null
          last_played_at: string | null
          lyrics_timed: Json | null
          play_count: number | null
          source: Database["public"]["Enums"]["song_source"]
          source_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          album?: string | null
          artist?: string
          bpm?: number | null
          created_at?: string
          downloadable?: boolean | null
          duration: number
          file_path?: string | null
          fingerprint?: string | null
          format: Database["public"]["Enums"]["song_format"]
          genre?: string | null
          id?: string
          instrumental_track_path?: string | null
          key?: string | null
          last_played_at?: string | null
          lyrics_timed?: Json | null
          play_count?: number | null
          source?: Database["public"]["Enums"]["song_source"]
          source_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          album?: string | null
          artist?: string
          bpm?: number | null
          created_at?: string
          downloadable?: boolean | null
          duration?: number
          file_path?: string | null
          fingerprint?: string | null
          format?: Database["public"]["Enums"]["song_format"]
          genre?: string | null
          id?: string
          instrumental_track_path?: string | null
          key?: string | null
          last_played_at?: string | null
          lyrics_timed?: Json | null
          play_count?: number | null
          source?: Database["public"]["Enums"]["song_source"]
          source_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      the_voices_sessions: {
        Row: {
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          name: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          host_id: string
          id?: string
          name: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          host_id?: string
          id?: string
          name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_play_count: { Args: { song_uuid: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      song_format: "mp4" | "mov" | "m4v" | "mp3" | "aac" | "wav" | "webm"
      song_source: "local" | "youtube" | "vimeo" | "external"
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
      app_role: ["admin", "moderator", "user"],
      song_format: ["mp4", "mov", "m4v", "mp3", "aac", "wav", "webm"],
      song_source: ["local", "youtube", "vimeo", "external"],
    },
  },
} as const
