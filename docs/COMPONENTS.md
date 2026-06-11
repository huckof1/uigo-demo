# COMPONENTS

## Принципы

- Все компоненты проектируются для Expo/React Native.
- UI на русском языке.
- Валюта в UI: тенге `₸`.
- Не использовать web-only компоненты.
- Не создавать админские экраны, маршруты и кнопки.
- Не проектировать долгосрочную аренду.

## RadarScreen

Назначение: главный экран арендатора для поиска свободных объектов.

Route: `app/map/index.tsx`.

Обязательные элементы:

- Заголовок "Радар".
- Кнопка/чип "Срочно нужна".
- Кнопка "Фильтр".
- Поле "Район или адрес".
- Моковая зона радара без реальной карты.
- Метки объектов по `availabilityStatus`.
- Карточка выбранного объекта.

Compatibility: Expo Go.

## RadarMarker

Назначение: метка объекта на радаре.

Props:

- `propertyId`.
- `availabilityStatus`.
- `markerLabel`.
- `isSelected`.
- `onPress`.

Логика метки:

- `available_now`: цена за час.
- `available_soon`: `через 30 мин`.
- `available_later`: `через 2 ч`.
- `unknown_time`: `уточняется`.
- `occupied`: `занято`.

Цвета:

- green, yellow, orange, gray, red.

Compatibility: Expo Go.

## PropertyCard

Назначение: карточка объекта на радаре или в bottom sheet.

Props:

- `type`.
- `city`.
- `district`.
- `hourlyPrice`.
- `dailyPrice`.
- `availabilityStatus`.
- `availableInMinutes`.
- `availabilityLabel`.
- `viewsCount`.
- `onWatchNow`.
- `onUrgentRequest`.

Обязательные CTA на деталях:

- "Бронь".
- "Радар".

На карточке деталей также показывать активность владельца: `ownerResponseTimeMinutes` и `ownerResponseRate`.

Compatibility: Expo Go.

## AvailabilityBadge

Назначение: компактный статус готовности объекта.

Поддерживаемые значения:

- `available_now` -> "Свободно сейчас".
- `available_soon` -> "Освободится скоро".
- `available_later` -> "Освободится позже".
- `unknown_time` -> "Время уточняется".
- `occupied` -> "Занято".

Compatibility: Expo Go.

## PremiumButton

Назначение: основная RN-кнопка для действий.

Требования:

- Press scale.
- Haptic feedback.
- Loading/disabled state.
- Icon support.
- Variants: `primary`, `glass`, `ghost`.

Compatibility: Expo Go.

## GlassPanel

Назначение: liquid glass контейнер через `expo-blur`.

Требования:

- BlurView.
- Полупрозрачный overlay.
- Border highlight.
- Внутренний верхний highlight.
- Мягкая тень и glow.

Compatibility: Expo Go.

## AppHeader

Назначение: кастомный header вместо стандартного Stack header.

Требования:

- Safe area.
- Кнопка назад.
- Haptic feedback.
- Glass style.

Compatibility: Expo Go.

## Что не создавать в MVP

- AdminShell.
- AdminDashboard.
- AdminRouteGuard.
- WebModal.
- DesktopSidebar.
- Web-only map wrapper.
