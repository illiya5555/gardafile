/*
  # Optimize database queries

  1. New Views
     - `client_booking_stats`: Aggregates booking statistics by user
     - `active_time_slots`: Shows only active time slots for quicker access
  
  2. New Functions
     - `get_client_stats`: Returns booking statistics for a specific client
     - `get_clients_with_stats`: Returns a list of clients with their booking statistics
  
  3. Index Optimizations
     - Added indexes for faster queries on reservations and time slots
*/

-- Создаем представление с агрегированной статистикой бронирований клиентов
CREATE OR REPLACE VIEW client_booking_stats AS
SELECT
    user_id,
    COUNT(*) AS total_bookings,
    SUM(total_price) AS total_spent,
    MAX(created_at) AS last_booking_date,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_bookings,
    COUNT(CASE WHEN booking_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS bookings_last_30_days
FROM
    reservations
WHERE
    user_id IS NOT NULL
GROUP BY
    user_id;

-- Создаем представление с активными временными слотами для быстрого доступа
CREATE OR REPLACE VIEW active_time_slots AS
SELECT *
FROM time_slots
WHERE is_active = true;

-- Создаем функцию для получения статистики клиента
CREATE OR REPLACE FUNCTION get_client_stats(client_id UUID)
RETURNS TABLE (
    total_bookings BIGINT,
    total_spent NUMERIC,
    last_booking_date TIMESTAMP WITH TIME ZONE,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT,
    bookings_last_30_days BIGINT
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT
        total_bookings,
        total_spent,
        last_booking_date,
        confirmed_bookings,
        pending_bookings,
        cancelled_bookings,
        bookings_last_30_days
    FROM client_booking_stats
    WHERE user_id = client_id;
$$;

-- Создаем функцию для быстрого получения списка клиентов со статистикой
CREATE OR REPLACE FUNCTION get_clients_with_stats()
RETURNS TABLE (
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    total_bookings BIGINT,
    total_spent NUMERIC,
    last_booking_date TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT
        p.id,
        p.email,
        p.first_name,
        p.last_name,
        p.phone,
        p.created_at,
        p.updated_at,
        COALESCE(s.total_bookings, 0) AS total_bookings,
        COALESCE(s.total_spent, 0) AS total_spent,
        s.last_booking_date
    FROM profiles p
    LEFT JOIN client_booking_stats s ON p.id = s.user_id
    ORDER BY p.created_at DESC;
$$;

-- Оптимизируем индексы для ускорения запросов
-- Добавляем составной индекс для user_id + created_at для быстрой сортировки бронирований пользователя
CREATE INDEX IF NOT EXISTS idx_reservations_user_created 
ON reservations(user_id, created_at DESC);

-- Оптимизируем индекс для быстрого поиска бронирований за определенный период
CREATE INDEX IF NOT EXISTS idx_reservations_date_range 
ON reservations(booking_date, time_slot)
WHERE status IN ('confirmed', 'pending');