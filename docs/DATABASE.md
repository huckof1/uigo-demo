# DATABASE

## Подход

База проектируется для будущего Supabase/PostgreSQL, но в текущей проверочной версии Supabase не подключается.

Модель должна поддерживать почасовую и посуточную аренду квартир, апартаментов и номеров. Помесячные цены не используются.

Admin tables не создаются.

## Enum-кандидаты

```sql
create type user_role as enum ('tenant', 'owner');
create type property_type as enum ('apartment', 'room', 'aparthotel');
create type property_availability_status as enum (
  'available_now',
  'available_soon',
  'available_later',
  'unknown_time',
  'occupied'
);
```

## properties

Назначение: объект почасовой или посуточной аренды на радаре.

Поля:

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | ID объекта. |
| `owner_id` | `uuid references users(id)` | Владелец объекта. |
| `title` | `text not null` | Название карточки. |
| `type` | `property_type not null` | `apartment`, `room`, `aparthotel`. |
| `city` | `text not null` | Город. |
| `district` | `text not null` | Район. |
| `address` | `text not null` | Адрес. |
| `latitude` | `numeric(10,7)` | Координата для будущей карты. |
| `longitude` | `numeric(10,7)` | Координата для будущей карты. |
| `hourly_price` | `integer not null` | Цена за час в тенге. |
| `daily_price` | `integer not null` | Цена за сутки в тенге. |
| `availability_status` | `property_availability_status not null` | Готовность объекта. |
| `available_in_minutes` | `integer` | Через сколько минут освободится объект, если известно. |
| `availability_label` | `text not null` | Человекочитаемый статус. |
| `views_count` | `integer default 0` | Количество просмотров. |
| `is_verified` | `boolean default false` | Задел для доверия. |
| `created_at` | `timestamptz default now()` | Дата создания. |
| `updated_at` | `timestamptz default now()` | Дата обновления. |

Ограничения:

- `hourly_price > 0`.
- `daily_price > 0`.
- `daily_price >= hourly_price`.
- `available_in_minutes` может быть `null` для `available_now`, `unknown_time`, `occupied`.

## booking_requests

Назначение: заявка арендатора на быстрый контакт или срочный подбор.

Поля:

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | ID заявки. |
| `property_id` | `uuid references properties(id)` | Объект. |
| `tenant_id` | `uuid references users(id)` | Арендатор. |
| `owner_id` | `uuid references users(id)` | Владелец. |
| `is_urgent` | `boolean default false` | Сценарий "Срочно нужна". |
| `status` | `text not null` | Статус заявки. |
| `desired_start_at` | `timestamptz` | Желаемое время начала аренды. |
| `duration_hours` | `integer` | Ожидаемая длительность в часах. |
| `message` | `text` | Комментарий арендатора. |
| `created_at` | `timestamptz default now()` | Дата создания. |

## property_views

Назначение: учет просмотров карточек объектов.

Поля:

| Поле | Тип | Описание |
| --- | --- | --- |
| `id` | `uuid primary key default gen_random_uuid()` | ID просмотра. |
| `property_id` | `uuid references properties(id) on delete cascade` | Объект. |
| `viewer_id` | `uuid references users(id)` | Пользователь, если авторизован. |
| `viewed_at` | `timestamptz default now()` | Время просмотра. |
| `source` | `text` | Радар, карточка, избранное, ссылка. |

## RLS-заметки

- Все клиентские таблицы должны иметь RLS.
- Арендатор видит опубликованные объекты и свои заявки.
- Владелец видит свои объекты и заявки по ним.
- Серверные операции не должны выполняться публичным anon-клиентом.
