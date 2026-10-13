-- 아두이노 쇼핑몰 초기 스키마
-- 테이블: categories, products, product_relations, profiles, cart_items, orders, order_items, reviews

create schema if not exists private;

-- ───────────────────────── 카테고리 / 상품 ─────────────────────────
create table public.categories (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  image       text,
  sort_order  int  not null default 0
);

create table public.products (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  category_id  bigint not null references public.categories(id),
  name         text not null,
  price        int  not null check (price >= 0),
  description  text,
  specs        jsonb not null default '{}'::jsonb,
  image        text,
  image_credit jsonb,
  stock        int  not null default 0 check (stock >= 0),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index products_category_id_idx on public.products(category_id);

-- 호환/추천 부품 ("이 센서와 함께 쓰는 보드")
create table public.product_relations (
  product_id bigint not null references public.products(id) on delete cascade,
  related_id bigint not null references public.products(id) on delete cascade,
  primary key (product_id, related_id),
  check (product_id <> related_id)
);
create index product_relations_related_id_idx on public.product_relations(related_id);

-- ───────────────────────── 회원 ─────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

-- 가입 시 profiles 자동 생성
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false);
$$;
grant usage on schema private to authenticated, anon;
grant execute on function private.is_admin() to authenticated, anon;

-- ───────────────────────── 장바구니 ─────────────────────────
create table public.cart_items (
  user_id    uuid   not null references auth.users(id) on delete cascade default auth.uid(),
  product_id bigint not null references public.products(id) on delete cascade,
  quantity   int    not null check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index cart_items_product_id_idx on public.cart_items(product_id);

-- ───────────────────────── 주문 ─────────────────────────
create type public.order_status as enum ('pending', 'paid', 'shipping', 'delivered', 'cancelled');

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_no      text not null unique,
  user_id       uuid not null references auth.users(id) on delete cascade,
  status        public.order_status not null default 'pending',
  order_name    text not null,
  items_total   int  not null,
  shipping_fee  int  not null,
  total         int  not null,
  recipient     text not null,
  phone         text not null,
  zipcode       text,
  address       text not null,
  memo          text,
  payment_key   text,
  payment_method text,
  tracking_no   text,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
create index orders_user_id_idx on public.orders(user_id);

create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   uuid   not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  name       text not null,
  price      int  not null,
  quantity   int  not null check (quantity > 0)
);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

-- ───────────────────────── 리뷰 ─────────────────────────
create table public.reviews (
  id         bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  user_id    uuid   not null references auth.users(id) on delete cascade default auth.uid(),
  rating     int    not null check (rating between 1 and 5),
  content    text   not null check (char_length(content) between 1 and 1000),
  author_name text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index reviews_user_id_idx on public.reviews(user_id);

-- 리뷰 작성자 이름(마스킹)을 작성 시점에 저장 → profiles를 공개하지 않아도 됨
create function private.set_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n text;
begin
  new.user_id := (select auth.uid());
  select coalesce(name, '고객') into n from public.profiles where id = new.user_id;
  n := coalesce(n, '고객');
  new.author_name := left(n, 1) || repeat('*', greatest(char_length(n) - 1, 1));
  return new;
end;
$$;

create trigger reviews_set_author
  before insert on public.reviews
  for each row execute function private.set_review_author();
