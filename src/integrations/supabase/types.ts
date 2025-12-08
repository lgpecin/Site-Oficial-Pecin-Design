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
      bookmark_folders: {
        Row: {
          color: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "bookmark_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          folder_id: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          last_checked: string | null
          preview_image: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          folder_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          preview_image?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          folder_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          preview_image?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "bookmark_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_products: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          price: number | null
          product_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          price?: number | null
          product_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          price?: number | null
          product_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_share_links: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          recipient_name: string | null
          share_token: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          recipient_name?: string | null
          share_token: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          recipient_name?: string | null
          share_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_share_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          color: string | null
          company: string | null
          created_at: string | null
          email: string | null
          icon: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          icon?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kanban_attachments: {
        Row: {
          card_id: string
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          client_icon: string | null
          client_name: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          due_date: string | null
          id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_icon?: string | null
          client_name?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_icon?: string | null
          client_name?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          due_date?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kanban_checklist_items: {
        Row: {
          card_id: string
          completed: boolean | null
          created_at: string | null
          display_order: number | null
          id: string
          title: string
        }
        Insert: {
          card_id: string
          completed?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          title: string
        }
        Update: {
          card_id?: string
          completed?: boolean | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_checklist_items_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      material_approvals: {
        Row: {
          action_type: string
          comment: string | null
          created_at: string | null
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          comment?: string | null
          created_at?: string | null
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_approvals_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_files: {
        Row: {
          created_at: string | null
          display_order: number | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          material_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          material_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_files_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          caption: string | null
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          post_date: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          post_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          post_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboard_elements: {
        Row: {
          created_at: string | null
          element_data: Json
          element_type: string
          id: string
          page_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          element_data: Json
          element_type: string
          id?: string
          page_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          element_data?: Json
          element_type?: string
          id?: string
          page_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moodboard_elements_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "moodboard_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      moodboard_pages: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          file_type: string
          id: string
          image_url: string
          metadata: Json | null
          project_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          file_type?: string
          id?: string
          image_url: string
          metadata?: Json | null
          project_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          file_type?: string
          id?: string
          image_url?: string
          metadata?: Json | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_technologies: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          technology: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          technology: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          technology?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          banner_image: string | null
          category: string
          created_at: string | null
          description: string
          display_order: number | null
          full_description: string
          hide_banner: boolean | null
          id: string
          image_spacing: number | null
          notes: string | null
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          banner_image?: string | null
          category: string
          created_at?: string | null
          description: string
          display_order?: number | null
          full_description: string
          hide_banner?: boolean | null
          id?: string
          image_spacing?: number | null
          notes?: string | null
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          banner_image?: string | null
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number | null
          full_description?: string
          hide_banner?: boolean | null
          id?: string
          image_spacing?: number | null
          notes?: string | null
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      service_link_items: {
        Row: {
          created_at: string | null
          id: string
          link_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_link_items_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "service_share_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_link_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_share_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name: string
          recipient_name: string | null
          share_token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          recipient_name?: string | null
          share_token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          recipient_name?: string | null
          share_token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          color: string | null
          created_at: string | null
          delivery_days: number
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          color?: string | null
          created_at?: string | null
          delivery_days: number
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          color?: string | null
          created_at?: string | null
          delivery_days?: number
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_schedule_cards: {
        Row: {
          color: string | null
          created_at: string | null
          day_of_week: number
          description: string | null
          display_order: number | null
          id: string
          tags: string[] | null
          time: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          day_of_week: number
          description?: string | null
          display_order?: number | null
          id?: string
          tags?: string[] | null
          time?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          display_order?: number | null
          id?: string
          tags?: string[] | null
          time?: string | null
          title?: string
          updated_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "user" | "visitor" | "sheet_user" | "client"
      service_category:
        | "estatico"
        | "carrossel"
        | "reels"
        | "branding"
        | "marca"
        | "ebook"
        | "outros"
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
      app_role: ["admin", "user", "visitor", "sheet_user", "client"],
      service_category: [
        "estatico",
        "carrossel",
        "reels",
        "branding",
        "marca",
        "ebook",
        "outros",
      ],
    },
  },
} as const
