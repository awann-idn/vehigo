export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'penyewa' | 'mitra' | 'admin';
export type AccountStatus = 'active' | 'pending' | 'suspended';
export type VehicleStatus = 'tersedia' | 'disewa' | 'maintenance';
export type OrderStatus =
  | 'belum_bayar'
  | 'menunggu_konfirmasi'
  | 'berlangsung'
  | 'selesai'
  | 'denda'
  | 'dibatalkan'
  | 'draft_whatsapp';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DocStatus = 'pending' | 'verified' | 'rejected';
export type DocType = 'ktp' | 'sim' | 'nib' | 'npwp';

export interface Database {
  public: {
    Views: {
      profile_directory: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
        };
      };
    };
    Functions: {
      mark_link_read: {
        Args: { p_link_type: string; p_link_id: string };
        Returns: Json;
      };
      get_vehicle_unavailable_dates: {
        Args: { p_vehicle_id: string; p_from: string; p_to: string };
        Returns: { date: string }[];
      };
      create_order_atomic: {
        Args: {
          p_vehicle_id: string;
          p_start_date: string;
          p_end_date: string;
          p_payment_method?: string | null;
          p_notes?: string | null;
          p_extra_fee?: number;
        };
        Returns: Json;
      };
      mark_chat_read: {
        Args: { p_chat_id: string };
        Returns: Json;
      };
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          status: AccountStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      mitra_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          owner_identity_number: string | null;
          business_description: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          verification: DocStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          owner_identity_number?: string | null;
          business_description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          verification?: DocStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          owner_identity_number?: string | null;
          business_description?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          verification?: DocStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          mitra_id: string;
          name: string;
          brand: string | null;
          year: number | null;
          plate: string;
          transmission: string;
          seats: number;
          price_per_day: number;
          status: VehicleStatus;
          location: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mitra_id: string;
          name: string;
          brand?: string | null;
          year?: number | null;
          plate: string;
          transmission?: string;
          seats?: number;
          price_per_day: number;
          status?: VehicleStatus;
          location?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mitra_id?: string;
          name?: string;
          brand?: string | null;
          year?: number | null;
          plate?: string;
          transmission?: string;
          seats?: number;
          price_per_day?: number;
          status?: VehicleStatus;
          location?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          code: string;
          renter_id: string;
          mitra_id: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          days: number;
          daily_price: number;
          subtotal: number;
          deposit: number;
          total: number;
          status: OrderStatus;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          renter_id: string;
          mitra_id: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          days: number;
          daily_price: number;
          subtotal: number;
          deposit?: number;
          total: number;
          status?: OrderStatus;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          renter_id?: string;
          mitra_id?: string;
          vehicle_id?: string;
          start_date?: string;
          end_date?: string;
          days?: number;
          daily_price?: number;
          subtotal?: number;
          deposit?: number;
          total?: number;
          status?: OrderStatus;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          method: string | null;
          amount: number;
          status: PaymentStatus;
          external_id: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          method?: string | null;
          amount: number;
          status?: PaymentStatus;
          external_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          method?: string | null;
          amount?: number;
          status?: PaymentStatus;
          external_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
      };
      inspections: {
        Row: {
          id: string;
          order_id: string;
          photos: Json;
          findings: Json;
          damage_fee: number;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          photos?: Json;
          findings?: Json;
          damage_fee?: number;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          photos?: Json;
          findings?: Json;
          damage_fee?: number;
          approved?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          author_id: string;
          target_type: 'vehicle' | 'mitra';
          target_id: string;
          rating: number;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          author_id: string;
          target_type: 'vehicle' | 'mitra';
          target_id: string;
          rating: number;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          author_id?: string;
          target_type?: 'vehicle' | 'mitra';
          target_id?: string;
          rating?: number;
          body?: string | null;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          order_id: string | null;
          renter_id: string;
          mitra_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          renter_id: string;
          mitra_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          renter_id?: string;
          mitra_id?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          body: string;
          kind: 'text' | 'emergency' | 'image' | 'order';
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          body: string;
          kind?: 'text' | 'emergency' | 'image' | 'order';
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          body?: string;
          kind?: 'text' | 'emergency';
          read_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: string;
          read_at: string | null;
          created_at: string;
          link_type: string | null;
          link_id: string | null;
          category: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          type?: string;
          read_at?: string | null;
          created_at?: string;
          link_type?: string | null;
          link_id?: string | null;
          category?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: string;
          read_at?: string | null;
          created_at?: string;
          link_type?: string | null;
          link_id?: string | null;
          category?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          kind: DocType;
          storage_path: string;
          status: DocStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: DocType;
          storage_path: string;
          status?: DocStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: DocType;
          storage_path?: string;
          status?: DocStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
