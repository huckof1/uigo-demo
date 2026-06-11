export type PropertyAvailabilityStatus =
  | "available_now"
  | "available_soon"
  | "available_later"
  | "unknown_time"
  | "occupied";

export type PropertyType = "apartment" | "room" | "aparthotel";

export type PropertyPhoto = {
  id: string;
  priority: number;
  url: string;
};

export type MockProperty = {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  city: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  district: string;
  address: string;
  hourlyPrice: number;
  dailyPrice: number;
  photos: PropertyPhoto[];
  availabilityStatus: PropertyAvailabilityStatus;
  availableInMinutes?: number;
  availabilityLabel: string;
  rating: number;
  viewsCount: number;
  ownerName: string;
  ownerAvatarInitials: string;
  ownerAvatarUrl?: string;
  ownerResponseTimeMinutes: number;
  ownerResponseRate: number;
  markerPosition: {
    left: `${number}%`;
    top: `${number}%`;
  };
};

export type AvailabilityColor = {
  background: string;
  border: string;
  glow: string;
  text: string;
};
