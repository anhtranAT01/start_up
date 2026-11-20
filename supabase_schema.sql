-- =========================================================
-- CỬA HÀNG KÝ ỨC (MEMORY STORE & VAULT) — SUPABASE SCHEMA
-- Hãy copy toàn bộ nội dung file này và dán vào tab
-- "SQL Editor" trên trang dashboard của Supabase rồi bấm RUN
-- =========================================================

-- 1. Tạo bảng lưu trữ trạng thái toàn bộ ứng dụng (app_state)
CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 2. Bật Row Level Security (RLS)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- 3. Cho phép đọc công khai (SELECT) với anon key
DROP POLICY IF EXISTS "Cho phép đọc dữ liệu công khai" ON public.app_state;
CREATE POLICY "Cho phép đọc dữ liệu công khai"
ON public.app_state
FOR SELECT
USING (true);

-- 4. Cho phép ghi/cập nhật công khai (INSERT/UPDATE/UPSERT) với anon key
DROP POLICY IF EXISTS "Cho phép ghi dữ liệu công khai" ON public.app_state;
CREATE POLICY "Cho phép ghi dữ liệu công khai"
ON public.app_state
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Bật Realtime cho bảng app_state để đồng bộ tức thì giữa các máy
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;

-- =========================================================
-- Hoàn tất! Bảng 'app_state' đã sẵn sàng phục vụ lưu trữ vĩnh viễn.
-- =========================================================
