import type {
  AvailabilityColor,
  MockProperty,
  PropertyAvailabilityStatus,
  PropertyType,
} from "@/lib/types/property";

export const availabilityLabels: Record<PropertyAvailabilityStatus, string> = {
  available_now: "Свободно сейчас",
  available_soon: "Освободится скоро",
  available_later: "Освободится позже",
  unknown_time: "Время уточняется",
  occupied: "Занято",
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: "Квартира",
  room: "Номер",
  aparthotel: "Апарт-отель",
};

export const availabilityColors: Record<PropertyAvailabilityStatus, AvailabilityColor> = {
  available_now: {
    background: "#11A665",
    border: "rgba(76, 255, 174, 0.95)",
    glow: "rgba(17, 166, 101, 0.38)",
    text: "#FFFFFF",
  },
  available_soon: {
    background: "#FFC22E",
    border: "rgba(255, 246, 166, 0.98)",
    glow: "rgba(255, 194, 46, 0.44)",
    text: "#241C0C",
  },
  available_later: {
    background: "#E0772F",
    border: "rgba(255, 178, 95, 0.86)",
    glow: "rgba(224, 119, 47, 0.24)",
    text: "#FFFFFF",
  },
  unknown_time: {
    background: "#7E807C",
    border: "rgba(230, 228, 220, 0.72)",
    glow: "rgba(86, 88, 84, 0.12)",
    text: "#FFFFFF",
  },
  occupied: {
    background: "#B94438",
    border: "rgba(238, 137, 124, 0.72)",
    glow: "rgba(185, 68, 56, 0.12)",
    text: "#FFFFFF",
  },
};

const baseMockProperties: MockProperty[] = [
  {
    id: "almaty-center-1",
    title: "Тихая квартира у парка",
    description:
      "Светлая квартира для короткой остановки в центре Алматы. Подходит для отдыха между встречами, спокойной работы и ночевки на сутки.",
    type: "apartment",
    city: "Алматы",
    coordinate: { latitude: 43.2389, longitude: 76.9283 },
    district: "Центр",
    address: "проспект Абая, 42",
    hourlyPrice: 8000,
    dailyPrice: 25000,
    availabilityStatus: "available_now",
    availabilityLabel: availabilityLabels.available_now,
    rating: 4.9,
    viewsCount: 128,
    ownerName: "Айдана",
    ownerAvatarInitials: "А",
    ownerResponseTimeMinutes: 5,
    ownerResponseRate: 94,
    markerPosition: { left: "44%", top: "37%" },
    photos: [
      {
        id: "almaty-center-living",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-center-bedroom",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-samal-1",
    title: "Апартаменты возле Esentai",
    description:
      "Премиальные апартаменты в Самале с мягким светом, рабочей зоной и быстрым доступом к деловому району.",
    type: "aparthotel",
    city: "Алматы",
    coordinate: { latitude: 43.2217, longitude: 76.9298 },
    district: "Самал",
    address: "микрорайон Самал-2",
    hourlyPrice: 10000,
    dailyPrice: 30000,
    availabilityStatus: "available_soon",
    availableInMinutes: 25,
    availabilityLabel: availabilityLabels.available_soon,
    rating: 4.8,
    viewsCount: 94,
    ownerName: "Мади",
    ownerAvatarInitials: "М",
    ownerResponseTimeMinutes: 7,
    ownerResponseRate: 91,
    markerPosition: { left: "61%", top: "47%" },
    photos: [
      {
        id: "almaty-samal-view",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-samal-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-arbat-1",
    title: "Номер рядом с Арбатом",
    description:
      "Уютный номер рядом с прогулочной зоной Арбата. Хороший вариант, если нужен быстрый заезд на несколько часов или на сутки.",
    type: "room",
    city: "Алматы",
    coordinate: { latitude: 43.2632, longitude: 76.942 },
    district: "Арбат",
    address: "улица Жибек Жолы, 77",
    hourlyPrice: 15000,
    dailyPrice: 45000,
    availabilityStatus: "available_later",
    availableInMinutes: 120,
    availabilityLabel: availabilityLabels.available_later,
    rating: 4.7,
    viewsCount: 211,
    ownerName: "Дина",
    ownerAvatarInitials: "Д",
    ownerResponseTimeMinutes: 4,
    ownerResponseRate: 96,
    markerPosition: { left: "35%", top: "56%" },
    photos: [
      {
        id: "almaty-arbat-suite",
        priority: 1,
        url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-arbat-bath",
        priority: 2,
        url: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "astana-left-bank-1",
    title: "Светлые апартаменты",
    description:
      "Апартаменты на Левом берегу для спокойного отдыха и деловых поездок. Время освобождения лучше уточнить перед поездкой.",
    type: "aparthotel",
    city: "Астана",
    coordinate: { latitude: 51.1214, longitude: 71.4308 },
    district: "Левый берег",
    address: "проспект Кабанбай Батыра, 29",
    hourlyPrice: 10000,
    dailyPrice: 30000,
    availabilityStatus: "unknown_time",
    availabilityLabel: availabilityLabels.unknown_time,
    rating: 4.6,
    viewsCount: 67,
    ownerName: "Ерлан",
    ownerAvatarInitials: "Е",
    ownerResponseTimeMinutes: 12,
    ownerResponseRate: 88,
    markerPosition: { left: "50%", top: "69%" },
    photos: [
      {
        id: "astana-left-bank-living",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "astana-left-bank-kitchen",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "shymkent-center-1",
    title: "Квартира в центре города",
    description:
      "Компактная квартира в центре Шымкента с удобной локацией. Сейчас объект занят, но можно отправить срочный запрос.",
    type: "apartment",
    city: "Шымкент",
    coordinate: { latitude: 42.3162, longitude: 69.5898 },
    district: "Центр",
    address: "улица Тауке Хана, 12",
    hourlyPrice: 7000,
    dailyPrice: 22000,
    availabilityStatus: "occupied",
    availabilityLabel: availabilityLabels.occupied,
    rating: 4.5,
    viewsCount: 53,
    ownerName: "Сауле",
    ownerAvatarInitials: "С",
    ownerResponseTimeMinutes: 9,
    ownerResponseRate: 90,
    markerPosition: { left: "21%", top: "43%" },
    photos: [
      {
        id: "shymkent-center-room",
        priority: 1,
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "shymkent-center-detail",
        priority: 2,
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-center-2",
    title: "Апартаменты у театра",
    description:
      "Аккуратные апартаменты в центре Алматы для короткого отдыха, работы между встречами или заезда на сутки.",
    type: "aparthotel",
    city: "Алматы",
    coordinate: { latitude: 43.2506, longitude: 76.9449 },
    district: "Центр",
    address: "улица Кабанбай батыра, 85",
    hourlyPrice: 9000,
    dailyPrice: 28000,
    availabilityStatus: "available_soon",
    availableInMinutes: 18,
    availabilityLabel: availabilityLabels.available_soon,
    rating: 4.8,
    viewsCount: 84,
    ownerName: "Нурлан",
    ownerAvatarInitials: "Н",
    ownerResponseTimeMinutes: 6,
    ownerResponseRate: 92,
    markerPosition: { left: "53%", top: "34%" },
    photos: [
      {
        id: "almaty-center-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-center-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-center-3",
    title: "Студия на Панфилова",
    description:
      "Небольшая светлая студия рядом с прогулочными улицами. Удобна для быстрого заезда на несколько часов.",
    type: "apartment",
    city: "Алматы",
    coordinate: { latitude: 43.2573, longitude: 76.9457 },
    district: "Центр",
    address: "улица Панфилова, 108",
    hourlyPrice: 7000,
    dailyPrice: 22000,
    availabilityStatus: "available_now",
    availabilityLabel: availabilityLabels.available_now,
    rating: 4.7,
    viewsCount: 109,
    ownerName: "Лаура",
    ownerAvatarInitials: "Л",
    ownerResponseTimeMinutes: 4,
    ownerResponseRate: 95,
    markerPosition: { left: "38%", top: "45%" },
    photos: [
      {
        id: "almaty-center-3-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-center-3-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-samal-2",
    title: "Люкс в Самале",
    description:
      "Тихий номер с большим окном, мягкой кроватью и быстрым доступом к деловой части города.",
    type: "room",
    city: "Алматы",
    coordinate: { latitude: 43.2338, longitude: 76.9532 },
    district: "Самал",
    address: "Самал-1, дом 18",
    hourlyPrice: 12000,
    dailyPrice: 36000,
    availabilityStatus: "available_later",
    availableInMinutes: 95,
    availabilityLabel: availabilityLabels.available_later,
    rating: 4.9,
    viewsCount: 136,
    ownerName: "Азамат",
    ownerAvatarInitials: "А",
    ownerResponseTimeMinutes: 5,
    ownerResponseRate: 93,
    markerPosition: { left: "70%", top: "42%" },
    photos: [
      {
        id: "almaty-samal-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-samal-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-samal-3",
    title: "Апарт у набережной",
    description:
      "Светлый апарт-отель с рабочим столом, тихим двором и быстрым заселением после подтверждения.",
    type: "aparthotel",
    city: "Алматы",
    coordinate: { latitude: 43.2295, longitude: 76.9391 },
    district: "Самал",
    address: "Самал-3, 22",
    hourlyPrice: 11000,
    dailyPrice: 32000,
    availabilityStatus: "available_now",
    availabilityLabel: availabilityLabels.available_now,
    rating: 4.8,
    viewsCount: 88,
    ownerName: "Дамир",
    ownerAvatarInitials: "Д",
    ownerResponseTimeMinutes: 8,
    ownerResponseRate: 89,
    markerPosition: { left: "56%", top: "55%" },
    photos: [
      {
        id: "almaty-samal-3-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-samal-3-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-arbat-2",
    title: "Мини-номер у Арбата",
    description:
      "Компактный номер рядом с кафе и прогулочной зоной. Подходит для короткого отдыха в центре.",
    type: "room",
    city: "Алматы",
    coordinate: { latitude: 43.2615, longitude: 76.9354 },
    district: "Арбат",
    address: "улица Жибек Жолы, 64",
    hourlyPrice: 8500,
    dailyPrice: 24000,
    availabilityStatus: "available_soon",
    availableInMinutes: 32,
    availabilityLabel: availabilityLabels.available_soon,
    rating: 4.6,
    viewsCount: 73,
    ownerName: "Мира",
    ownerAvatarInitials: "М",
    ownerResponseTimeMinutes: 10,
    ownerResponseRate: 86,
    markerPosition: { left: "24%", top: "66%" },
    photos: [
      {
        id: "almaty-arbat-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-arbat-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-bostandyk-1",
    title: "Квартира у Mega",
    description:
      "Просторная квартира в Бостандыкском районе с удобным заездом и чистым интерьером.",
    type: "apartment",
    city: "Алматы",
    coordinate: { latitude: 43.2021, longitude: 76.8928 },
    district: "Бостандык",
    address: "улица Розыбакиева, 247",
    hourlyPrice: 10000,
    dailyPrice: 30000,
    availabilityStatus: "available_now",
    availabilityLabel: availabilityLabels.available_now,
    rating: 4.8,
    viewsCount: 117,
    ownerName: "Руслан",
    ownerAvatarInitials: "Р",
    ownerResponseTimeMinutes: 5,
    ownerResponseRate: 94,
    markerPosition: { left: "73%", top: "58%" },
    photos: [
      {
        id: "almaty-bostandyk-1-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-bostandyk-1-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "almaty-bostandyk-2",
    title: "Апарт на Гагарина",
    description:
      "Уютный апарт с видом на город, чистой ванной и быстрым подтверждением брони.",
    type: "aparthotel",
    city: "Алматы",
    coordinate: { latitude: 43.2244, longitude: 76.8976 },
    district: "Бостандык",
    address: "проспект Гагарина, 124",
    hourlyPrice: 9500,
    dailyPrice: 27000,
    availabilityStatus: "available_later",
    availableInMinutes: 150,
    availabilityLabel: availabilityLabels.available_later,
    rating: 4.7,
    viewsCount: 69,
    ownerName: "Жанна",
    ownerAvatarInitials: "Ж",
    ownerResponseTimeMinutes: 7,
    ownerResponseRate: 90,
    markerPosition: { left: "83%", top: "69%" },
    photos: [
      {
        id: "almaty-bostandyk-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "almaty-bostandyk-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "astana-left-bank-2",
    title: "Апарт возле Байтерека",
    description:
      "Светлый апарт на Левом берегу для короткой остановки, встречи или ночевки на сутки.",
    type: "aparthotel",
    city: "Астана",
    coordinate: { latitude: 51.1287, longitude: 71.4216 },
    district: "Левый берег",
    address: "улица Достык, 5",
    hourlyPrice: 12000,
    dailyPrice: 36000,
    availabilityStatus: "available_soon",
    availableInMinutes: 28,
    availabilityLabel: availabilityLabels.available_soon,
    rating: 4.9,
    viewsCount: 144,
    ownerName: "Арман",
    ownerAvatarInitials: "А",
    ownerResponseTimeMinutes: 6,
    ownerResponseRate: 92,
    markerPosition: { left: "61%", top: "78%" },
    photos: [
      {
        id: "astana-left-bank-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "astana-left-bank-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "shymkent-center-2",
    title: "Номер у площади",
    description:
      "Номер в центре Шымкента для короткой остановки. Чистый интерьер и быстрый ответ владельца.",
    type: "room",
    city: "Шымкент",
    coordinate: { latitude: 42.3194, longitude: 69.5951 },
    district: "Центр",
    address: "проспект Республика, 18",
    hourlyPrice: 7000,
    dailyPrice: 22000,
    availabilityStatus: "available_now",
    availabilityLabel: availabilityLabels.available_now,
    rating: 4.6,
    viewsCount: 58,
    ownerName: "Алия",
    ownerAvatarInitials: "А",
    ownerResponseTimeMinutes: 8,
    ownerResponseRate: 87,
    markerPosition: { left: "15%", top: "53%" },
    photos: [
      {
        id: "shymkent-center-2-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "shymkent-center-2-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  {
    id: "shymkent-center-3",
    title: "Студия рядом с парком",
    description:
      "Небольшая студия в центре города для почасового отдыха или заезда на сутки.",
    type: "apartment",
    city: "Шымкент",
    coordinate: { latitude: 42.3132, longitude: 69.6038 },
    district: "Центр",
    address: "улица Казыбек би, 41",
    hourlyPrice: 8000,
    dailyPrice: 25000,
    availabilityStatus: "available_later",
    availableInMinutes: 70,
    availabilityLabel: availabilityLabels.available_later,
    rating: 4.7,
    viewsCount: 81,
    ownerName: "Бекзат",
    ownerAvatarInitials: "Б",
    ownerResponseTimeMinutes: 9,
    ownerResponseRate: 89,
    markerPosition: { left: "31%", top: "59%" },
    photos: [
      {
        id: "shymkent-center-3-main",
        priority: 1,
        url: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "shymkent-center-3-room",
        priority: 2,
        url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
];

const extraPhotoPool = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80",
];

const ownerAvatars: Record<string, string> = {
  Айдана: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  Мади: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  Дина: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  Ерлан: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  Сауле: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  Нурлан: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
  Лаура: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
  Азамат: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
  Дамир: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  Мира: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  Руслан: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  Жанна: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  Арман: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
  Алия: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
  Бекзат: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
};

const generatedOwners = [
  "Аружан",
  "Тимур",
  "Асель",
  "Кайрат",
  "Меруерт",
  "Санжар",
  "Гульнара",
  "Ильяс",
  "Назым",
  "Олжас",
  "Фарида",
  "Ерасыл",
];

const generatedOwnerAvatars = [
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
];

type ExtraPropertySeed = {
  address: string;
  city: string;
  dailyPrice: number;
  district: string;
  hourlyPrice: number;
  latitude: number;
  longitude: number;
  status: PropertyAvailabilityStatus;
  type: PropertyType;
};

const extraPropertySeeds: ExtraPropertySeed[] = [
  { city: "Алматы", district: "Медеу", address: "проспект Достык, 210", latitude: 43.2377, longitude: 76.9738, hourlyPrice: 13000, dailyPrice: 39000, status: "available_now", type: "aparthotel" },
  { city: "Алматы", district: "Медеу", address: "улица Сатпаева, 30", latitude: 43.2351, longitude: 76.9584, hourlyPrice: 9000, dailyPrice: 27000, status: "available_soon", type: "apartment" },
  { city: "Алматы", district: "Алмалинский", address: "улица Байтурсынова, 104", latitude: 43.2476, longitude: 76.9236, hourlyPrice: 8000, dailyPrice: 25000, status: "available_now", type: "apartment" },
  { city: "Алматы", district: "Ауэзов", address: "улица Саина, 16", latitude: 43.2254, longitude: 76.8617, hourlyPrice: 6500, dailyPrice: 20000, status: "available_later", type: "room" },
  { city: "Астана", district: "Левый берег", address: "проспект Туран, 24", latitude: 51.1176, longitude: 71.4079, hourlyPrice: 11000, dailyPrice: 33000, status: "available_now", type: "aparthotel" },
  { city: "Астана", district: "Есиль", address: "улица Сыганак, 16", latitude: 51.1127, longitude: 71.421, hourlyPrice: 10000, dailyPrice: 30000, status: "available_soon", type: "apartment" },
  { city: "Астана", district: "Сарыарка", address: "проспект Республики, 42", latitude: 51.168, longitude: 71.4191, hourlyPrice: 7500, dailyPrice: 23000, status: "available_now", type: "room" },
  { city: "Астана", district: "Алматы", address: "улица Б. Момышулы, 12", latitude: 51.1348, longitude: 71.4759, hourlyPrice: 8500, dailyPrice: 26000, status: "occupied", type: "apartment" },
  { city: "Шымкент", district: "Нурсат", address: "проспект Байдибек би, 60", latitude: 42.3412, longitude: 69.6152, hourlyPrice: 8000, dailyPrice: 24000, status: "available_now", type: "apartment" },
  { city: "Шымкент", district: "Аль-Фараби", address: "улица Рыскулова, 8", latitude: 42.3064, longitude: 69.5882, hourlyPrice: 6500, dailyPrice: 20000, status: "available_soon", type: "room" },
  { city: "Караганда", district: "Центр", address: "проспект Бухар Жырау, 53", latitude: 49.806, longitude: 73.085, hourlyPrice: 7000, dailyPrice: 21000, status: "available_now", type: "apartment" },
  { city: "Караганда", district: "Юго-Восток", address: "улица Муканова, 18", latitude: 49.7821, longitude: 73.1349, hourlyPrice: 7500, dailyPrice: 23000, status: "available_later", type: "aparthotel" },
  { city: "Балхаш", district: "Центр", address: "улица Ленина, 32", latitude: 46.8481, longitude: 74.995, hourlyPrice: 6000, dailyPrice: 19000, status: "available_now", type: "apartment" },
  { city: "Балхаш", district: "Набережная", address: "улица Уалиханова, 8", latitude: 46.8407, longitude: 74.9765, hourlyPrice: 7000, dailyPrice: 22000, status: "available_soon", type: "aparthotel" },
  { city: "Балхаш", district: "Микрорайон", address: "микрорайон Русакова, 5", latitude: 46.8308, longitude: 75.0096, hourlyPrice: 5500, dailyPrice: 18000, status: "available_later", type: "room" },
  { city: "Актобе", district: "Центр", address: "проспект Абилкайыр Хана, 45", latitude: 50.2839, longitude: 57.1669, hourlyPrice: 7000, dailyPrice: 22000, status: "available_now", type: "apartment" },
  { city: "Актобе", district: "Батыс-2", address: "проспект Санкибай Батыра, 72", latitude: 50.3035, longitude: 57.1296, hourlyPrice: 8000, dailyPrice: 25000, status: "available_soon", type: "aparthotel" },
  { city: "Актау", district: "15 мкр", address: "15 микрорайон, 42", latitude: 43.6528, longitude: 51.1574, hourlyPrice: 10000, dailyPrice: 30000, status: "available_now", type: "aparthotel" },
  { city: "Актау", district: "Набережная", address: "4 микрорайон, 84", latitude: 43.6375, longitude: 51.1687, hourlyPrice: 9000, dailyPrice: 28000, status: "unknown_time", type: "apartment" },
  { city: "Атырау", district: "Центр", address: "проспект Азаттык, 92", latitude: 47.0945, longitude: 51.9238, hourlyPrice: 9500, dailyPrice: 29000, status: "available_now", type: "apartment" },
  { city: "Атырау", district: "Нурсая", address: "микрорайон Нурсая, 12", latitude: 47.1168, longitude: 51.9005, hourlyPrice: 8500, dailyPrice: 26000, status: "available_later", type: "room" },
  { city: "Костанай", district: "Центр", address: "улица Аль-Фараби, 66", latitude: 53.2198, longitude: 63.6354, hourlyPrice: 6500, dailyPrice: 20000, status: "available_now", type: "room" },
  { city: "Костанай", district: "КСК", address: "улица Каирбекова, 351", latitude: 53.2414, longitude: 63.6017, hourlyPrice: 7000, dailyPrice: 22000, status: "available_soon", type: "apartment" },
  { city: "Павлодар", district: "Центр", address: "улица Лермонтова, 91", latitude: 52.2872, longitude: 76.9674, hourlyPrice: 6500, dailyPrice: 21000, status: "available_now", type: "apartment" },
  { city: "Павлодар", district: "Усолка", address: "улица Камзина, 171", latitude: 52.2619, longitude: 76.9918, hourlyPrice: 7000, dailyPrice: 22000, status: "occupied", type: "room" },
  { city: "Усть-Каменогорск", district: "Центр", address: "проспект Победы, 5", latitude: 49.9484, longitude: 82.6289, hourlyPrice: 7000, dailyPrice: 23000, status: "available_now", type: "aparthotel" },
  { city: "Усть-Каменогорск", district: "Стрелка", address: "улица Казахстан, 70", latitude: 49.9684, longitude: 82.6105, hourlyPrice: 6500, dailyPrice: 20000, status: "available_later", type: "apartment" },
  { city: "Тараз", district: "Центр", address: "проспект Толе би, 38", latitude: 42.8992, longitude: 71.3686, hourlyPrice: 6000, dailyPrice: 19000, status: "available_now", type: "room" },
  { city: "Тараз", district: "Жансая", address: "улица Байзак Батыра, 180", latitude: 42.8819, longitude: 71.4003, hourlyPrice: 7000, dailyPrice: 22000, status: "available_soon", type: "apartment" },
  { city: "Кызылорда", district: "Центр", address: "улица Айтеке Би, 25", latitude: 44.8488, longitude: 65.4823, hourlyPrice: 6500, dailyPrice: 20000, status: "available_now", type: "apartment" },
  { city: "Кызылорда", district: "Сырдарья", address: "проспект Назарбаева, 12", latitude: 44.8358, longitude: 65.515, hourlyPrice: 7000, dailyPrice: 22000, status: "unknown_time", type: "aparthotel" },
  { city: "Петропавловск", district: "Центр", address: "улица Конституции, 32", latitude: 54.8732, longitude: 69.1505, hourlyPrice: 6000, dailyPrice: 19000, status: "available_now", type: "room" },
  { city: "Петропавловск", district: "Береке", address: "улица Жамбыла, 218", latitude: 54.8584, longitude: 69.1808, hourlyPrice: 6500, dailyPrice: 20000, status: "available_later", type: "apartment" },
];

function buildPhotos(id: string, offset: number) {
  return [0, 1, 2, 3].map((step) => ({
    id: `${id}-photo-${step + 1}`,
    priority: step + 1,
    url: extraPhotoPool[(offset + step) % extraPhotoPool.length],
  }));
}

function enhanceBaseProperty(property: MockProperty, index: number): MockProperty {
  const extraPhotos = buildPhotos(property.id, index).filter(
    (photo) => !property.photos.some((currentPhoto) => currentPhoto.url === photo.url),
  );

  return {
    ...property,
    ownerAvatarUrl: ownerAvatars[property.ownerName],
    photos: [...property.photos, ...extraPhotos].slice(0, 5),
  };
}

const generatedCoordinateOffsets = [
  { latitude: 0, longitude: 0 },
  { latitude: 0.0064, longitude: -0.0048 },
  { latitude: -0.0057, longitude: 0.0062 },
  { latitude: 0.0032, longitude: 0.0086 },
  { latitude: -0.0092, longitude: -0.0074 },
  { latitude: 0.0114, longitude: 0.0028 },
  { latitude: -0.0026, longitude: 0.0132 },
  { latitude: 0.0088, longitude: -0.0126 },
  { latitude: -0.0128, longitude: 0.0044 },
];

const generatedStatusCycle: PropertyAvailabilityStatus[] = [
  "available_now",
  "available_soon",
  "available_later",
  "unknown_time",
  "occupied",
  "available_soon",
  "available_later",
  "occupied",
  "available_now",
];

const GENERATED_VARIANTS_PER_SEED = generatedCoordinateOffsets.length;

function createGeneratedProperty(
  seed: ExtraPropertySeed,
  seedIndex: number,
  variantIndex: number,
): MockProperty {
  const index = seedIndex * GENERATED_VARIANTS_PER_SEED + variantIndex;
  const ownerName = generatedOwners[index % generatedOwners.length];
  const status =
    variantIndex === 0 ? seed.status : generatedStatusCycle[(seedIndex * 2 + variantIndex) % generatedStatusCycle.length];
  const availabilityLabel = availabilityLabels[status];
  const coordinateOffset = generatedCoordinateOffsets[variantIndex];
  const hourlyPrice = seed.hourlyPrice + variantIndex * 500 + (seedIndex % 3) * 300;
  const dailyPrice = seed.dailyPrice + variantIndex * 1500 + (seedIndex % 4) * 800;
  const availableInMinutes =
    status === "available_soon"
      ? 8 + (index % 7) * 7
      : status === "available_later"
        ? 65 + (index % 8) * 22
        : undefined;

  return {
    id: `${seed.city.toLowerCase().replace(/[^а-яa-z0-9]+/gi, "-")}-${seed.district
      .toLowerCase()
      .replace(/[^а-яa-z0-9]+/gi, "-")}-${variantIndex + 1}-${seedIndex + 1}`,
    title:
      seed.type === "room"
        ? `Номер, ${seed.district}`
        : seed.type === "aparthotel"
          ? `Апарт-отель, ${seed.district}`
          : `Квартира, ${seed.district}`,
    description: `${propertyTypeLabels[seed.type]} для почасовой или посуточной аренды. Указана владельцем в районе ${seed.district}, ${seed.city}.`,
    type: seed.type,
    city: seed.city,
    coordinate: {
      latitude: seed.latitude + coordinateOffset.latitude,
      longitude: seed.longitude + coordinateOffset.longitude,
    },
    district: seed.district,
    address: seed.address,
    hourlyPrice,
    dailyPrice,
    availabilityStatus: status,
    availableInMinutes,
    availabilityLabel,
    rating: Number((4.5 + (index % 5) * 0.1).toFixed(1)),
    viewsCount: 40 + index * 7,
    ownerName,
    ownerAvatarInitials: ownerName[0],
    ownerAvatarUrl: generatedOwnerAvatars[index % generatedOwnerAvatars.length],
    ownerResponseTimeMinutes: 4 + (index % 9),
    ownerResponseRate: 86 + (index % 11),
    markerPosition: {
      left: `${20 + (index % 7) * 9}%` as `${number}%`,
      top: `${28 + (index % 6) * 8}%` as `${number}%`,
    },
    photos: buildPhotos(`generated-${index}`, index),
  };
}

const generatedMockProperties = extraPropertySeeds.flatMap((seed, seedIndex) =>
  Array.from({ length: GENERATED_VARIANTS_PER_SEED }, (_, variantIndex) =>
    createGeneratedProperty(seed, seedIndex, variantIndex),
  ),
);

export const mockProperties: MockProperty[] = [
  ...baseMockProperties.map(enhanceBaseProperty),
  ...generatedMockProperties,
];

export function formatTenge(value: number) {
  return new Intl.NumberFormat("ru-KZ").format(value);
}

export function getPropertyById(id?: string) {
  return mockProperties.find((property) => property.id === id) ?? mockProperties[0];
}

export function getAvailabilityText(property: MockProperty) {
  if (property.availabilityStatus === "available_now") {
    return "Свободно сейчас";
  }

  if (property.availableInMinutes) {
    if (property.availableInMinutes < 60) {
      return `Освободится через ${property.availableInMinutes} мин`;
    }

    return `Освободится через ${Math.round(property.availableInMinutes / 60)} ч`;
  }

  return property.availabilityLabel;
}

export function getMarkerLabel(property: MockProperty) {
  return `${formatTenge(property.hourlyPrice)}₸/ч`;
}

export function getMarkerTimeLabel(property: MockProperty) {
  if (property.availabilityStatus === "available_now") {
    return "сейчас";
  }

  if (property.availabilityStatus === "available_soon") {
    return `${property.availableInMinutes ?? 25} мин`;
  }

  if (property.availabilityStatus === "available_later") {
    return `${Math.round((property.availableInMinutes ?? 120) / 60)} ч`;
  }

  if (property.availabilityStatus === "unknown_time") {
    return "уточняется";
  }

  return "занято";
}
