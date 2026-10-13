-- RLS 정책, 주문 함수, 이미지 스토리지

alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_relations enable row level security;
alter table public.profiles          enable row level security;
alter table public.cart_items        enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.reviews           enable row level security;

-- 카테고리: 누구나 조회, 관리자만 수정
create policy "categories_select_all" on public.categories for select using (true);
create policy "categories_admin_insert" on public.categories for insert to authenticated with check ((select private.is_admin()));
create policy "categories_admin_update" on public.categories for update to authenticated using ((select private.is_admin()));
create policy "categories_admin_delete" on public.categories for delete to authenticated using ((select private.is_admin()));

-- 상품: 판매중 상품은 누구나, 관리자는 전체
create policy "products_select" on public.products for select using (is_active or (select private.is_admin()));
create policy "products_admin_insert" on public.products for insert to authenticated with check ((select private.is_admin()));
create policy "products_admin_update" on public.products for update to authenticated using ((select private.is_admin()));
create policy "products_admin_delete" on public.products for delete to authenticated using ((select private.is_admin()));

create policy "relations_select_all" on public.product_relations for select using (true);
create policy "relations_admin_insert" on public.product_relations for insert to authenticated with check ((select private.is_admin()));
create policy "relations_admin_delete" on public.product_relations for delete to authenticated using ((select private.is_admin()));

-- 프로필: 본인(또는 관리자)만 조회, 본인은 이름/전화번호만 수정 가능 (is_admin 변경 불가)
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated, anon;
grant update (name, phone) on public.profiles to authenticated;

-- 장바구니: 본인 것만
create policy "cart_select_own" on public.cart_items for select to authenticated using (user_id = (select auth.uid()));
create policy "cart_insert_own" on public.cart_items for insert to authenticated with check (user_id = (select auth.uid()));
create policy "cart_update_own" on public.cart_items for update to authenticated using (user_id = (select auth.uid()));
create policy "cart_delete_own" on public.cart_items for delete to authenticated using (user_id = (select auth.uid()));

-- 주문: 생성은 create_order() 함수로만. 조회는 본인/관리자, 수정은 관리자(배송 상태·송장)
create policy "orders_select_own" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "orders_admin_update" on public.orders for update to authenticated using ((select private.is_admin()));
revoke update on public.orders from authenticated, anon;
grant update (status, tracking_no) on public.orders to authenticated;

create policy "order_items_select_own" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = order_id and (o.user_id = (select auth.uid()) or (select private.is_admin()))));

-- 리뷰: 누구나 조회, 로그인 사용자는 본인 리뷰 작성/삭제
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert to authenticated with check (user_id = (select auth.uid()));
create policy "reviews_delete_own" on public.reviews for delete to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- ───────────────────────── 주문 생성 ─────────────────────────
-- 가격/배송비는 클라이언트 값을 믿지 않고 DB 기준으로 계산한다.
-- p_items: [{"product_id": 1, "quantity": 2}, ...]
create function public.create_order(
  p_items     jsonb,
  p_recipient text,
  p_phone     text,
  p_zipcode   text,
  p_address   text,
  p_memo      text default null
)
returns table (order_id uuid, order_no text, order_name text, total int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := (select auth.uid());
  v_order_id   uuid;
  v_order_no   text;
  v_items_total int := 0;
  v_shipping   int;
  v_count      int := 0;
  v_first_name text;
  v_name       text;
  r            record;
begin
  if v_uid is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception '주문할 상품이 없습니다.';
  end if;
  if coalesce(trim(p_recipient), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception '배송 정보를 모두 입력해 주세요.';
  end if;

  v_order_no := to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDDHH24MISS') || '-' || substr(md5(random()::text), 1, 8);

  insert into public.orders (order_no, user_id, order_name, items_total, shipping_fee, total,
                             recipient, phone, zipcode, address, memo)
  values (v_order_no, v_uid, '-', 0, 0, 0, trim(p_recipient), trim(p_phone), p_zipcode, trim(p_address), p_memo)
  returning id into v_order_id;

  for r in
    select p.id, p.name, p.price, p.stock, p.is_active, i.quantity
    from jsonb_to_recordset(p_items) as i(product_id bigint, quantity int)
    left join public.products p on p.id = i.product_id
  loop
    if r.id is null or not r.is_active then
      raise exception '판매하지 않는 상품이 포함되어 있습니다.';
    end if;
    if r.quantity is null or r.quantity < 1 or r.quantity > 99 then
      raise exception '수량이 올바르지 않습니다.';
    end if;
    if r.stock < r.quantity then
      raise exception '재고가 부족합니다: % (남은 수량 %개)', r.name, r.stock;
    end if;

    insert into public.order_items (order_id, product_id, name, price, quantity)
    values (v_order_id, r.id, r.name, r.price, r.quantity);

    v_items_total := v_items_total + r.price * r.quantity;
    v_count := v_count + 1;
    if v_first_name is null then v_first_name := r.name; end if;
  end loop;

  -- 5만원 이상 무료배송, 미만 3,000원
  v_shipping := case when v_items_total >= 50000 then 0 else 3000 end;
  v_name := case when v_count > 1 then v_first_name || ' 외 ' || (v_count - 1) || '건' else v_first_name end;

  update public.orders
     set order_name = v_name, items_total = v_items_total, shipping_fee = v_shipping,
         total = v_items_total + v_shipping
   where id = v_order_id;

  return query select v_order_id, v_order_no, v_name, v_items_total + v_shipping;
end;
$$;
revoke execute on function public.create_order(jsonb, text, text, text, text, text) from public, anon;
grant execute on function public.create_order(jsonb, text, text, text, text, text) to authenticated;

-- ───────────────────────── 결제 완료 처리 ─────────────────────────
-- 토스 결제 승인 후 Edge Function(service_role)에서만 호출한다.
create function public.complete_order_payment(
  p_order_no    text,
  p_payment_key text,
  p_method      text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  r       record;
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if v_order.id is null then
    raise exception 'order not found';
  end if;
  if v_order.status <> 'pending' then
    return v_order.id; -- 이미 처리됨 (새로고침 등)
  end if;

  for r in select product_id, quantity, name from public.order_items where order_id = v_order.id loop
    update public.products set stock = stock - r.quantity
     where id = r.product_id and stock >= r.quantity;
    if not found then
      raise exception '재고가 부족합니다: %', r.name;
    end if;
  end loop;

  update public.orders
     set status = 'paid', payment_key = p_payment_key, payment_method = p_method, paid_at = now()
   where id = v_order.id;

  delete from public.cart_items c
   using public.order_items oi
   where oi.order_id = v_order.id and c.user_id = v_order.user_id and c.product_id = oi.product_id;

  return v_order.id;
end;
$$;
revoke execute on function public.complete_order_payment(text, text, text) from public, anon, authenticated;
grant execute on function public.complete_order_payment(text, text, text) to service_role;

-- ───────────────────────── 상품 이미지 스토리지 ─────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "product_images_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "product_images_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
create policy "product_images_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
