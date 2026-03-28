export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          address_raw: string;
          address_normalized: string;
          address_hash: string;
          city: string;
          state: string;
          zip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          address_raw: string;
          address_normalized: string;
          address_hash: string;
          city?: string;
          state?: string;
          zip?: string | null;
        };
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          property_id: string;
          reporter_id: string;
          issue_type: string;
          severity: string;
          description: string;
          photo_urls: string[] | null;
          is_anonymous: boolean;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          reporter_id: string;
          issue_type: string;
          severity: string;
          description: string;
          photo_urls?: string[] | null;
          is_anonymous?: boolean;
          is_hidden?: boolean;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          property_id: string;
          commenter_id: string;
          body: string;
          is_anonymous: boolean;
          is_hidden: boolean;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          commenter_id: string;
          body: string;
          is_anonymous?: boolean;
          is_hidden?: boolean;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
        Relationships: [];
      };
      rebuttals: {
        Row: {
          id: string;
          report_id: string;
          property_id: string;
          landlord_email: string;
          is_verified: boolean;
          body: string;
          stripe_payment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          property_id: string;
          landlord_email: string;
          is_verified?: boolean;
          body: string;
          stripe_payment_id: string;
        };
        Update: Partial<Database['public']['Tables']['rebuttals']['Insert']>;
        Relationships: [];
      };
      helpful_votes: {
        Row: {
          user_id: string;
          comment_id: string;
        };
        Insert: {
          user_id: string;
          comment_id: string;
        };
        Update: Partial<Database['public']['Tables']['helpful_votes']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Property = Database['public']['Tables']['properties']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Rebuttal = Database['public']['Tables']['rebuttals']['Row'];
