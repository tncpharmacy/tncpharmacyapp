import { getHomeData } from "@/lib/server/home";
import HomeClient from "./homeClient";

export default async function HomePage() {
  const { groupCare, category5, category7, category9, categories } =
    await getHomeData();

  return (
    <HomeClient
      initialGroupCare={groupCare}
      initialCategory5={category5}
      initialCategory7={category7}
      initialCategory9={category9}
      initialCategories={categories}
    />
  );
}
