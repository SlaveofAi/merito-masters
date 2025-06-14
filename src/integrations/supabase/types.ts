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
      admin_announcements: {
        Row: {
          admin_id: string
          call_to_action: Json | null
          content: string
          created_at: string
          delivered_count: number | null
          id: string
          read_count: number | null
          recipient_type: string
          sent_at: string | null
          status: string
          title: string
          total_recipients: number | null
        }
        Insert: {
          admin_id: string
          call_to_action?: Json | null
          content: string
          created_at?: string
          delivered_count?: number | null
          id?: string
          read_count?: number | null
          recipient_type: string
          sent_at?: string | null
          status?: string
          title: string
          total_recipients?: number | null
        }
        Update: {
          admin_id?: string
          call_to_action?: Json | null
          content?: string
          created_at?: string
          delivered_count?: number | null
          id?: string
          read_count?: number | null
          recipient_type?: string
          sent_at?: string | null
          status?: string
          title?: string
          total_recipients?: number | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      announcement_recipients: {
        Row: {
          announcement_id: string
          clicked_at: string | null
          delivered_at: string | null
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          clicked_at?: string | null
          delivered_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_recipients_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "admin_announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          like_count: number
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          like_count?: number
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          like_count?: number
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      blog_tags: {
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
          is_topped: boolean
          is_verified: boolean
          location: string
          name: string
          phone: string | null
          profile_image_url: string | null
          topped_until: string | null
          trade_category: string
          updated_at: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          custom_specialization?: string | null
          description?: string | null
          email: string
          id: string
          is_topped?: boolean
          is_verified?: boolean
          location: string
          name: string
          phone?: string | null
          profile_image_url?: string | null
          topped_until?: string | null
          trade_category: string
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          custom_specialization?: string | null
          description?: string | null
          email?: string
          id?: string
          is_topped?: boolean
          is_verified?: boolean
          location?: string
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          topped_until?: string | null
          trade_category?: string
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      job_requests: {
        Row: {
          created_at: string
          custom_category: string | null
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone: string | null
          description: string
          id: string
          image_url: string | null
          image_urls: string[] | null
          job_category: string
          location: string
          preferred_date: string | null
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          custom_category?: string | null
          customer_email: string
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          description: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          job_category: string
          location: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          custom_category?: string | null
          customer_email?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          description?: string
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          job_category?: string
          location?: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      job_responses: {
        Row: {
          craftsman_id: string
          craftsman_name: string
          created_at: string
          id: string
          job_request_id: string
          message: string | null
        }
        Insert: {
          craftsman_id: string
          craftsman_name: string
          created_at?: string
          id?: string
          job_request_id: string
          message?: string | null
        }
        Update: {
          craftsman_id?: string
          craftsman_name?: string
          created_at?: string
          id?: string
          job_request_id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_responses_job_request_id_fkey"
            columns: ["job_request_id"]
            isOneToOne: false
            referencedRelation: "job_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
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
      reported_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      topped_payments: {
        Row: {
          amount: number
          craftsman_id: string
          created_at: string
          currency: string
          id: string
          payment_status: string
          stripe_payment_id: string | null
          stripe_session_id: string | null
          topped_end: string
          topped_start: string
        }
        Insert: {
          amount: number
          craftsman_id: string
          created_at?: string
          currency?: string
          id?: string
          payment_status: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          topped_end: string
          topped_start?: string
        }
        Update: {
          amount?: number
          craftsman_id?: string
          created_at?: string
          currency?: string
          id?: string
          payment_status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          topped_end?: string
          topped_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "topped_payments_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_job_request: {
        Args: { request_id: string; user_id: string }
        Returns: boolean
      }
      delete_user: {
        Args: Record<PropertyKey, never>
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_target_type: string
          p_target_id?: string
          p_details?: Json
        }
        Returns: undefined
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
