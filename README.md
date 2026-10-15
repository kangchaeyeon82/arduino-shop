# 아두이노랩 — 아두이노 부품 쇼핑몰 (학습용)

Next.js 16 + Supabase + 토스페이먼츠(테스트 모드)로 만든 학습용 쇼핑몰입니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

`.env.local`에 Supabase URL / publishable key / 토스 테스트 클라이언트 키가 들어 있습니다. (`.env.example` 참고)

### 배포

GitHub `main` 브랜치에 push하면 Vercel이 자동으로 배포합니다 → https://arduino-shop-three.vercel.app
(다른 브랜치에 push하면 미리보기(Preview) 주소가 따로 만들어집니다.)

### 테스트 계정

관리자(admin@example.com)와 일반 회원(user@example.com) 계정이 있습니다.
비밀번호는 로컬 전용 파일 `TEST_ACCOUNTS.local.md`에 있습니다 (git·Vercel 배포에 포함되지 않음).

> 다른 계정을 관리자로 만들려면 Supabase SQL Editor에서:
> `update profiles set is_admin = true where id = (select id from auth.users where email = '...');`

## 기능

- **쇼핑**: 메인, 카테고리/검색/정렬/재고 필터, 상품 상세(사양표, 호환 부품 추천, 리뷰)
- **장바구니**: 비로그인은 localStorage, 로그인하면 DB(`cart_items`)로 자동 병합
- **주문/결제**: 토스페이먼츠 결제위젯(테스트) → Edge Function `confirm-payment`에서 승인 → 재고 차감
- **회원**: 이메일 회원가입/로그인, 마이페이지(주문 내역·상세, 정보 수정)
- **관리자** (`/admin`): 대시보드, 상품 등록/수정(이미지는 Supabase Storage 업로드), 주문 상태·송장 관리

## 폴더 구조

```
src/
├─ app/
│  ├─ (shop)/            # 고객용: 메인, products, cart, checkout, mypage, credits
│  ├─ (auth)/            # login, signup
│  ├─ admin/             # 관리자 (layout에서 is_admin 확인)
│  ├─ auth/confirm/      # 이메일 인증 링크 처리
│  └─ layout.tsx
├─ components/           # layout, product, cart, admin, OrderDetail
├─ lib/
│  ├─ supabase/          # client.ts(브라우저), server.ts(서버), proxy.ts(세션 갱신)
│  ├─ utils.ts           # 가격 포맷, 배송비 규칙, 주문 상태 라벨
│  └─ credits.ts         # 배너·카테고리 사진 출처
├─ types/database.types.ts  # Supabase 자동 생성 타입
└─ proxy.ts              # (Next 16의 middleware) 로그인 필요 경로 보호
supabase/
├─ migrations/           # 테이블, RLS 정책, 주문 함수
├─ functions/confirm-payment/  # 결제 승인 Edge Function (Deno)
├─ seed.sql              # 카테고리 6 · 상품 27 · 호환 관계
└─ seed-data.json        # 상품 원본 데이터 + 이미지 출처
public/images/           # 상품·배너·카테고리 사진 (CC 라이선스)
```

## 보안 설계 포인트 (공부할 부분)

- 모든 테이블에 **RLS** 적용. 브라우저에 노출되는 publishable key로는 정책이 허용한 것만 가능
- 주문 금액은 클라이언트가 아니라 DB 함수 `create_order()`가 상품 가격으로 계산
- 결제 승인·재고 차감은 service_role 권한의 Edge Function에서만 (`complete_order_payment()`는 일반 사용자 실행 불가)
- 토스 결제 승인 전에 주문 금액과 결제 금액이 같은지 검증

## 데이터 출처

- 가격·상품 정보: 디바이스마트 판매가 참고 (2026년 10월). `led-kit`, `stepper-28byj48` 2개는 추정가
- 사진: Wikimedia Commons / Flickr의 CC 라이선스 이미지 → 사이트 하단 "이미지 출처" 페이지(`/credits`)에 저작자·라이선스 표기
