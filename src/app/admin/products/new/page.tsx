import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">상품 등록</h2>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
