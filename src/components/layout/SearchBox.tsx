import Form from "next/form";

export default function SearchBox() {
  return (
    <Form action="/products" className="relative max-w-md">
      <input name="q" type="search" placeholder="센서, 보드, 모터 검색…" className="input pr-16" aria-label="상품 검색" />
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">
        검색
      </button>
    </Form>
  );
}
