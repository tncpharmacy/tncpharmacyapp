import { getMenuData } from "@/lib/server/menu";
import SiteHeader from "@/app/(user)/components/header/header";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, subcategories } = await getMenuData();

  return (
    <>
      <SiteHeader
        initialCategories={categories}
        initialSubcategories={subcategories}
      />
      {children}
    </>
  );
}
