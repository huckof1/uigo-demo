import { mockProperties } from "@/lib/mock/properties";
import type { BookingStatus } from "@/lib/types/domain";

export type MockBookingRequest = {
  id: string;
  createdLabel: string;
  guestName: string;
  message: string;
  propertyId: string;
  status: BookingStatus;
};

export const bookingStatusLabels: Partial<Record<BookingStatus, string>> = {
  accepted: "Принято",
  alternative_time_proposed: "Предложено другое время",
  declined: "Отклонено",
  pending: "Ожидает",
  urgent_pending: "Срочная заявка",
};

export const bookingStatusColors: Partial<Record<BookingStatus, string>> = {
  accepted: "#11A665",
  alternative_time_proposed: "#E0772F",
  declined: "#B94438",
  pending: "#FFC22E",
  urgent_pending: "#11A665",
};

export const mockBookingRequests: MockBookingRequest[] = [
  {
    id: "booking-balkhash-rusakova",
    createdLabel: "2 мин назад",
    guestName: "Арендатор рядом",
    message: "Готов заселиться сейчас, нужен быстрый ответ.",
    propertyId: "almaty-center-1",
    status: "pending",
  },
  {
    id: "booking-karaganda-bukhar",
    createdLabel: "12 мин назад",
    guestName: "Демо-гость",
    message: "Подойдет почасовая бронь на сегодня.",
    propertyId: "astana-left-bank-1",
    status: "accepted",
  },
  {
    id: "booking-almaty-samal",
    createdLabel: "28 мин назад",
    guestName: "Гость из радара",
    message: "Можно заехать чуть позже, если объект освободится.",
    propertyId: "almaty-samal-1",
    status: "alternative_time_proposed",
  },
  {
    id: "booking-astana-left",
    createdLabel: "1 час назад",
    guestName: "Арендатор",
    message: "Проверяет другие варианты рядом.",
    propertyId: "shymkent-center-1",
    status: "declined",
  },
];

export function getRequestProperty(propertyId: string) {
  return mockProperties.find((property) => property.id === propertyId) ?? mockProperties[0];
}
