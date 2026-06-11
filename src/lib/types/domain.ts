export type UserRole = "tenant" | "owner";

export type {
  MockProperty as RadarProperty,
  PropertyAvailabilityStatus,
  PropertyType,
} from "@/lib/types/property";

export type BookingStatus =
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
