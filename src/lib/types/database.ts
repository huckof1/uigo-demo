export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "tenant" | "owner";
      booking_status:
        | "pending"
        | "urgent_pending"
        | "accepted"
        | "declined"
        | "alternative_time_proposed"
        | "alternative_time_accepted"
        | "alternative_time_declined"
        | "cancelled_by_tenant"
        | "cancelled_by_owner"
        | "viewing_started"
        | "viewing_completed"
        | "no_show"
        | "deal_closed"
        | "expired";
    };
    CompositeTypes: Record<string, never>;
  };
};
