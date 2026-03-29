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
      landlords: {
        Row: {
          id: string;
          name: string;
          management_company: string | null;
          relationship_type: string;
          property_id: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          management_company?: string | null;
          relationship_type: string;
          property_id: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['landlords']['Insert']>;
        Relationships: [];
      };
      rental_reviews: {
        Row: {
          id: string;
          property_id: string;
          landlord_id: string;
          reviewer_id: string;
          relationship_type: string;
          responsiveness: number;
          fairness: number;
          respect: number;
          temperament: number;
          property_condition: number;
          communication: number;
          safety: number;
          tags: string[];
          comment: string | null;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          landlord_id: string;
          reviewer_id: string;
          relationship_type: string;
          responsiveness: number;
          fairness: number;
          respect: number;
          temperament: number;
          property_condition: number;
          communication: number;
          safety: number;
          tags?: string[];
          comment?: string | null;
          is_anonymous?: boolean;
        };
        Update: Partial<Database['public']['Tables']['rental_reviews']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      landlord_scores: {
        Row: {
          landlord_id: string;
          review_count: number;
          avg_responsiveness: number;
          avg_fairness: number;
          avg_respect: number;
          avg_temperament: number;
          avg_property_condition: number;
          avg_communication: number;
          avg_safety: number;
          overall_score: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Property = Database['public']['Tables']['properties']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Rebuttal = Database['public']['Tables']['rebuttals']['Row'];
export type Landlord = Database['public']['Tables']['landlords']['Row'];
export type RentalReview = Database['public']['Tables']['rental_reviews']['Row'];
export type LandlordScore = Database['public']['Views']['landlord_scores']['Row'];
