// Supabase에서 자동 생성한 타입 (스키마 변경 시 다시 생성)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cart_items: {
        Row: { created_at: string; product_id: number; quantity: number; user_id: string }
        Insert: { created_at?: string; product_id: number; quantity: number; user_id?: string }
        Update: { created_at?: string; product_id?: number; quantity?: number; user_id?: string }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: number
          image: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: never
          image?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: never
          image?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          name: string
          order_id: string
          price: number
          product_id: number | null
          quantity: number
        }
        Insert: {
          id?: never
          name: string
          order_id: string
          price: number
          product_id?: number | null
          quantity: number
        }
        Update: {
          id?: never
          name?: string
          order_id?: string
          price?: number
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          id: string
          items_total: number
          memo: string | null
          order_name: string
          order_no: string
          paid_at: string | null
          payment_key: string | null
          payment_method: string | null
          phone: string
          recipient: string
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          total: number
          tracking_no: string | null
          user_id: string
          zipcode: string | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          items_total: number
          memo?: string | null
          order_name: string
          order_no: string
          paid_at?: string | null
          payment_key?: string | null
          payment_method?: string | null
          phone: string
          recipient: string
          shipping_fee: number
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          tracking_no?: string | null
          user_id: string
          zipcode?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          items_total?: number
          memo?: string | null
          order_name?: string
          order_no?: string
          paid_at?: string | null
          payment_key?: string | null
          payment_method?: string | null
          phone?: string
          recipient?: string
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          tracking_no?: string | null
          user_id?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      product_relations: {
        Row: { product_id: number; related_id: number }
        Insert: { product_id: number; related_id: number }
        Update: { product_id?: number; related_id?: number }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_id_fkey"
            columns: ["related_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: number
          created_at: string
          description: string | null
          id: number
          image: string | null
          image_credit: Json | null
          is_active: boolean
          name: string
          price: number
          slug: string
          specs: Json
          stock: number
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string | null
          id?: never
          image?: string | null
          image_credit?: Json | null
          is_active?: boolean
          name: string
          price: number
          slug: string
          specs?: Json
          stock?: number
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string | null
          id?: never
          image?: string | null
          image_credit?: Json | null
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          specs?: Json
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_admin?: boolean
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: number
          product_id: number
          rating: number
          user_id: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: never
          product_id: number
          rating: number
          user_id?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: never
          product_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_order_payment: {
        Args: { p_method: string; p_order_no: string; p_payment_key: string }
        Returns: string
      }
      create_order: {
        Args: {
          p_address: string
          p_items: Json
          p_memo?: string
          p_phone: string
          p_recipient: string
          p_zipcode: string
        }
        Returns: {
          order_id: string
          order_name: string
          order_no: string
          total: number
        }[]
      }
    }
    Enums: {
      order_status: "pending" | "paid" | "shipping" | "delivered" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "paid", "shipping", "delivered", "cancelled"],
    },
  },
} as const
