export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      booking_requests: {
        Row: {
          amount: string | null
          conversation_id: string
          craftsman_id: string
          created_at: string
          customer_id: string
          customer_name: string
          date: string
          end_time: string
          id: string
          image_url: string | null
          message: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: string | null
          conversation_id: string
          craftsman_id: string
          created_at?: string
          customer_id: string
          customer_name: string
          date: string
          end_time: string
          id?: string
          image_url?: string | null
          message?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: string | null
          conversation_id?: string
          craftsman_id?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          date?: string
          end_time?: string
          id?: string
          image_url?: string | null
          message?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          craftsman_id: string
          created_at: string
          customer_id: string
          id: string
          is_archived_by_craftsman: boolean
          is_archived_by_customer: boolean
          is_deleted_by_craftsman: boolean
          is_deleted_by_customer: boolean
          updated_at: string
        }
        Insert: {
          craftsman_id: string
          created_at?: string
          customer_id: string
          id?: string
          is_archived_by_craftsman?: boolean
          is_archived_by_customer?: boolean
          is_deleted_by_craftsman?: boolean
          is_deleted_by_customer?: boolean
          updated_at?: string
        }
        Update: {
          craftsman_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_archived_by_craftsman?: boolean
          is_archived_by_customer?: boolean
          is_deleted_by_craftsman?: boolean
          is_deleted_by_customer?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      craftsman_availability: {
        Row: {
          craftsman_id: string
          created_at: string
          date: string
          id: string
          time_slots: Json
          updated_at: string
        }
        Insert: {
          craftsman_id: string
          created_at?: string
          date: string
          id?: string
          time_slots?: Json
          updated_at?: string
        }
        Update: {
          craftsman_id?: string
          created_at?: string
          date?: string
          id?: string
          time_slots?: Json
          updated_at?: string
        }
        Relationships: []
      }
      craftsman_profiles: {
        Row: {
          created_at: string
          custom_specialization: string | null
          description: string | null
          email: string
          id: string
          location: string
          name: string
          phone: string | null
          profile_image_url: string | null
          trade_category: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          custom_specialization?: string | null
          description?: string | null
          email: string
          id: string
          location: string
          name: string
          phone?: string | null
          profile_image_url?: string | null
          trade_category: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          custom_specialization?: string | null
          description?: string | null
          email?: string
          id?: string
          location?: string
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          trade_category?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      craftsman_review_replies: {
        Row: {
          craftsman_id: string
          created_at: string | null
          id: string
          reply: string
          review_id: string
        }
        Insert: {
          craftsman_id: string
          created_at?: string | null
          id?: string
          reply: string
          review_id: string
        }
        Update: {
          craftsman_id?: string
          created_at?: string | null
          id?: string
          reply?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "craftsman_review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "craftsman_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      craftsman_reviews: {
        Row: {
          comment: string | null
          craftsman_id: string
          created_at: string
          customer_id: string
          customer_name: string
          id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          craftsman_id: string
          created_at?: string
          customer_id: string
          customer_name: string
          id?: string
          rating: number
        }
        Update: {
          comment?: string | null
          craftsman_id?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "craftsman_reviews_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string
          name: string
          phone: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          location: string
          name: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          craftsman_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          title: string | null
        }
        Insert: {
          craftsman_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          title?: string | null
        }
        Update: {
          craftsman_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_types: {
        Row: {
          created_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_review_reply: {
        Args: { p_review_id: string; p_craftsman_id: string; p_reply: string }
        Returns: undefined
      }
      get_review_replies_by_review_ids: {
        Args: { review_ids: string[] }
        Returns: {
          id: string
          review_id: string
          craftsman_id: string
          reply: string
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
