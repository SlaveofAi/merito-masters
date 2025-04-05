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
          conversation_id: string
          craftsman_id: string
          created_at: string
          customer_id: string
          customer_name: string
          date: string
          end_time: string
          id: string
          message: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          conversation_id: string
          craftsman_id: string
          created_at?: string
          customer_id: string
          customer_name: string
          date: string
          end_time: string
          id?: string
          message?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string
          craftsman_id?: string
          created_at?: string
          customer_id?: string
          customer_name?: string
          date?: string
          end_time?: string
          id?: string
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
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
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
        Args: {
          p_review_id: string
          p_craftsman_id: string
          p_reply: string
        }
        Returns: undefined
      }
      get_review_replies_by_review_ids: {
        Args: {
          review_ids: string[]
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
