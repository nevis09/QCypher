// Auto-generated from Supabase schema. Run `pnpm db:generate-types` to refresh.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string; name: string; slug: string; is_admin: boolean
          plan: string; status: 'active' | 'suspended' | 'trial'; created_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; is_admin?: boolean
          plan?: string; status?: 'active' | 'suspended' | 'trial'; created_at?: string
        }
        Update: {
          id?: string; name?: string; slug?: string; is_admin?: boolean
          plan?: string; status?: 'active' | 'suspended' | 'trial'; created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string; tenant_id: string; first_name: string; last_name: string | null
          email: string | null; phone: string | null; company: string | null
          address: string | null; notes: string | null; tags: string[] | null
          source: string | null; status: 'active' | 'inactive' | 'lead'
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; tenant_id: string; first_name: string; last_name?: string | null
          email?: string | null; phone?: string | null; company?: string | null
          address?: string | null; notes?: string | null; tags?: string[] | null
          source?: string | null; status?: 'active' | 'inactive' | 'lead'
          created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; tenant_id?: string; first_name?: string; last_name?: string | null
          email?: string | null; phone?: string | null; company?: string | null
          address?: string | null; notes?: string | null; tags?: string[] | null
          source?: string | null; status?: 'active' | 'inactive' | 'lead'
          created_at?: string; updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string; tenant_id: string; contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'; body: string
          occurred_at: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'; body: string
          occurred_at?: string; created_at?: string
        }
        Update: {
          id?: string; tenant_id?: string; contact_id?: string
          type?: 'call' | 'email' | 'visit' | 'note'; body?: string
          occurred_at?: string; created_at?: string
        }
      }
      events: {
        Row: {
          id: string; tenant_id: string; contact_id: string | null; title: string
          description: string | null; starts_at: string; ends_at: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id?: string | null; title: string
          description?: string | null; starts_at: string; ends_at: string; created_at?: string
        }
        Update: {
          id?: string; tenant_id?: string; contact_id?: string | null; title?: string
          description?: string | null; starts_at?: string; ends_at?: string; created_at?: string
        }
      }
      templates: {
        Row: {
          id: string; tenant_id: string; name: string; channel: 'sms' | 'email'
          subject: string | null; body: string; category: string
          is_marketing: boolean; deleted_at: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; tenant_id: string; name: string; channel: 'sms' | 'email'
          subject?: string | null; body: string; category?: string
          is_marketing?: boolean; deleted_at?: string | null
          created_at?: string; updated_at?: string
        }
        Update: {
          name?: string; channel?: 'sms' | 'email'; subject?: string | null
          body?: string; category?: string; is_marketing?: boolean
          deleted_at?: string | null; updated_at?: string
        }
      }
      send_log: {
        Row: {
          id: string; tenant_id: string; contact_id: string | null; template_id: string | null
          channel: 'email' | 'sms'; recipient: string; subject: string | null; body: string
          status: 'queued' | 'sent' | 'failed'; provider_id: string | null; error: string | null
          sent_at: string | null; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id?: string | null; template_id?: string | null
          channel: 'email' | 'sms'; recipient: string; subject?: string | null; body: string
          status?: 'queued' | 'sent' | 'failed'; provider_id?: string | null; error?: string | null
          sent_at?: string | null; created_at?: string
        }
        Update: {
          status?: 'queued' | 'sent' | 'failed'; provider_id?: string | null
          error?: string | null; sent_at?: string | null
        }
      }
      invite_tokens: {
        Row: {
          id: string; token: string; tenant_id: string; email: string
          used_at: string | null; expires_at: string; created_at: string
        }
        Insert: {
          id?: string; token?: string; tenant_id: string; email: string
          used_at?: string | null; expires_at?: string; created_at?: string
        }
        Update: { used_at?: string | null }
      }
      users: {
        Row: {
          id: string; tenant_id: string; has_seen_welcome: boolean
          legal_name: string | null; nickname: string | null; phone: string | null
          address: string | null; street: string | null; city: string | null
          state: string | null; zip: string | null
        }
        Insert: {
          id: string; tenant_id: string; has_seen_welcome?: boolean
          legal_name?: string | null; nickname?: string | null; phone?: string | null
          address?: string | null; street?: string | null; city?: string | null
          state?: string | null; zip?: string | null
        }
        Update: {
          has_seen_welcome?: boolean; legal_name?: string | null; nickname?: string | null
          phone?: string | null; address?: string | null; street?: string | null
          city?: string | null; state?: string | null; zip?: string | null
        }
      }
      orders: {
        Row: {
          id: string; tenant_id: string; customer_id: string | null
          payment_status: 'draft' | 'pending' | 'paid' | 'refunded'
          total_amount: number; notes: string | null; created_at: string; updated_at: string
          signed_at: string | null; helcim_transaction_id: string | null; paid_at: string | null
        }
        Insert: {
          id?: string; tenant_id: string; customer_id?: string | null
          payment_status?: 'draft' | 'pending' | 'paid' | 'refunded'
          total_amount?: number; notes?: string | null; created_at?: string; updated_at?: string
          signed_at?: string | null; helcim_transaction_id?: string | null; paid_at?: string | null
        }
        Update: {
          customer_id?: string | null; payment_status?: 'draft' | 'pending' | 'paid' | 'refunded'
          notes?: string | null; updated_at?: string; signed_at?: string | null
          helcim_transaction_id?: string | null; paid_at?: string | null
        }
      }
      portal_magic_links: {
        Row: {
          id: string; tenant_id: string; contact_id: string
          token: string; expires_at: string; used_at: string | null; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id: string
          token: string; expires_at: string; used_at?: string | null; created_at?: string
        }
        Update: { used_at?: string | null }
      }
      portal_sessions: {
        Row: {
          id: string; tenant_id: string; contact_id: string
          access_token: string; expires_at: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id: string
          access_token: string; expires_at: string; created_at?: string
        }
        Update: Record<string, never>
      }
      quote_tokens: {
        Row: {
          id: string; tenant_id: string; order_id: string
          access_token: string; token_expires_at: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; order_id: string
          access_token: string; token_expires_at: string; created_at?: string
        }
        Update: { token_expires_at?: string }
      }
      quote_signatures: {
        Row: {
          id: string; tenant_id: string; order_id: string
          signed_by_name: string; signature_type: string; signature_data: string
          ip_address: string | null; signed_at: string; access_token: string; token_expires_at: string
        }
        Insert: {
          id?: string; tenant_id: string; order_id: string
          signed_by_name: string; signature_type?: string; signature_data: string
          ip_address?: string | null; signed_at?: string; access_token: string; token_expires_at: string
        }
        Update: Record<string, never>
      }
      order_line_items: {
        Row: {
          id: string; order_id: string; tenant_id: string
          catalog_item_id: string | null; item_name_snapshot: string
          description_snapshot: string | null; quantity: number; unit_price: number
          billing_unit_snapshot: string; rental_status: string | null
          rental_start_date: string | null; rental_end_date: string | null
          actual_return_date: string | null; created_at: string
        }
        Insert: {
          id?: string; order_id: string; tenant_id: string
          catalog_item_id?: string | null; item_name_snapshot: string
          description_snapshot?: string | null; quantity: number; unit_price: number
          billing_unit_snapshot?: string; rental_status?: string | null
          rental_start_date?: string | null; rental_end_date?: string | null
          actual_return_date?: string | null; created_at?: string
        }
        Update: {
          item_name_snapshot?: string; description_snapshot?: string | null
          quantity?: number; unit_price?: number; rental_status?: string | null
          rental_start_date?: string | null; rental_end_date?: string | null
          actual_return_date?: string | null
        }
      }
      catalog_items: {
        Row: {
          id: string; tenant_id: string; name: string; description: string | null
          item_type: string; base_price: number; billing_unit: string
          is_active: boolean; taxable: boolean; requires_deposit: boolean
          deposit_amount: number | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; tenant_id: string; name: string; description?: string | null
          item_type: string; base_price?: number; billing_unit?: string
          is_active?: boolean; taxable?: boolean; requires_deposit?: boolean
          deposit_amount?: number | null; created_at?: string; updated_at?: string
        }
        Update: {
          name?: string; description?: string | null; item_type?: string
          base_price?: number; billing_unit?: string; is_active?: boolean
          taxable?: boolean; requires_deposit?: boolean; deposit_amount?: number | null
        }
      }
      interactions: {
        Row: {
          id: string; tenant_id: string; contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'
          notes: string | null; occurred_at: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; contact_id: string
          type: 'call' | 'email' | 'visit' | 'note'
          notes?: string | null; occurred_at?: string; created_at?: string
        }
        Update: {
          type?: 'call' | 'email' | 'visit' | 'note'
          notes?: string | null; occurred_at?: string
        }
      }
      pipeline_stages: {
        Row: {
          id: string; tenant_id: string; name: string; position: number
          color: string; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; name: string; position?: number
          color?: string; created_at?: string
        }
        Update: { name?: string; position?: number; color?: string }
      }
      pipeline_deals: {
        Row: {
          id: string; tenant_id: string; stage_id: string; contact_id: string | null
          title: string; value: number | null; notes: string | null
          position: number; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; tenant_id: string; stage_id: string; contact_id?: string | null
          title: string; value?: number | null; notes?: string | null
          position?: number; created_at?: string; updated_at?: string
        }
        Update: {
          stage_id?: string; contact_id?: string | null; title?: string
          value?: number | null; notes?: string | null; position?: number; updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string; tenant_id: string; description: string; amount: number
          category: string | null; occurred_at: string
          deleted_at: string | null; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; description: string; amount: number
          category?: string | null; occurred_at?: string
          deleted_at?: string | null; created_at?: string
        }
        Update: {
          description?: string; amount?: number; category?: string | null
          occurred_at?: string; deleted_at?: string | null
        }
      }
      imports: {
        Row: {
          id: string; tenant_id: string; filename: string
          imported_count: number; skipped_count: number
          created_at: string; created_by: string | null
        }
        Insert: {
          id?: string; tenant_id: string; filename: string
          imported_count?: number; skipped_count?: number
          created_at?: string; created_by?: string | null
        }
        Update: { imported_count?: number; skipped_count?: number }
      }
      feedback: {
        Row: {
          id: string; tenant_id: string; message: string; rating: number | null; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; message: string; rating?: number | null; created_at?: string
        }
        Update: { message?: string; rating?: number | null }
      }
      rental_extensions: {
        Row: {
          id: string; tenant_id: string; order_id: string
          extended_until: string; reason: string | null; created_at: string
        }
        Insert: {
          id?: string; tenant_id: string; order_id: string
          extended_until: string; reason?: string | null; created_at?: string
        }
        Update: { extended_until?: string; reason?: string | null }
      }
      service_checklist: {
        Row: {
          id: string; tenant_id: string; month: string; service_name: string
          completed: boolean; completed_at: string | null; completed_by: string | null
        }
        Insert: {
          id?: string; tenant_id: string; month: string; service_name: string
          completed?: boolean; completed_at?: string | null; completed_by?: string | null
        }
        Update: { completed?: boolean; completed_at?: string | null; completed_by?: string | null }
      }
      job_photos: {
        Row: {
          id: string; tenant_id: string; order_id: string
          storage_path: string; label: string | null
          uploaded_by: string | null; created_at: string; deleted_at: string | null
        }
        Insert: {
          id?: string; tenant_id: string; order_id: string
          storage_path: string; label?: string | null
          uploaded_by?: string | null; created_at?: string; deleted_at?: string | null
        }
        Update: { label?: string | null; deleted_at?: string | null }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      contact_status: 'active' | 'inactive' | 'lead'
      interaction_type: 'call' | 'email' | 'visit' | 'note'
      template_channel: 'sms' | 'email'
      send_channel: 'email' | 'sms'
      send_status: 'queued' | 'sent' | 'failed'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
