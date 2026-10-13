import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-page grid gap-6 py-10 text-sm text-gray-500 md:grid-cols-3">
        <div>
          <p className="mb-2 font-bold text-gray-800">아두이노랩</p>
          <p>학습용으로 만든 데모 쇼핑몰입니다.</p>
          <p>실제 상품을 판매하지 않으며, 결제는 토스페이먼츠 테스트 모드로 동작합니다.</p>
        </div>
        <div>
          <p className="mb-2 font-bold text-gray-800">안내</p>
          <p>상품 가격·정보: 디바이스마트 판매가 참고 (2026년 10월 기준)</p>
          <p>배송비 3,000원 · 50,000원 이상 무료배송</p>
        </div>
        <div>
          <p className="mb-2 font-bold text-gray-800">이미지 출처</p>
          <p>
            상품 사진은 Wikimedia Commons·Flickr의 CC 라이선스 이미지입니다.{" "}
            <Link href="/credits" className="text-brand-600 underline">
              전체 출처 보기
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
