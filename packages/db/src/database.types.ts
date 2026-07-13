// Auto-generated from Supabase schema. Run `pnpm db:generate-types` to refresh.
// This file is committed so the app can typecheck without a live Supabase instance.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          notes: string | null
          tags: string[] | null
          source: string | null
          status: 'active' | 'inactive' | 'lead'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          tags?: string[] | null
          source?: string | null
          status?: 'active' | 'inactive' | 'lead'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          notes?: string | null
          tags?: string[] | null
          source?: string | null
          status?: 'active' | 'inactive' | 'lead'
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          tenant_id: string
          contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'
          body: string
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'
          body: string
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          contact_id?: string
          type?: 'call' | 'email' | 'visit' | 'note'
          body?: string
          occurred_at?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          contact_id: string | null
          title: string
          description: string | null
          starts_at: string
          ends_at: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          contact_id?: string | null
          title: string
          description?: string | null
          starts_at: string
          ends_at: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          contact_id?: string | null
          title?: string
          description?: string | null
          starts_at?: string
          ends_at?: string
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          tenant_id: string
          name: string
          channel: 'sms' | 'email'
          subject: string | null
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          channel: 'sms' | 'email'
          subject?: string | null
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          channel?: 'sms' | 'email'
          subject?: string | null
          body?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      contact_status: 'active' | 'inactive' | 'lead'
      interaction_type: 'call' | 'email' | 'visit' | 'note'
      template_channel: 'sms' | 'email'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
