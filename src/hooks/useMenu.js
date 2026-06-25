import { useCallback, useMemo, useState } from "react";
import { getCategoriesByShop, getItemsByCategoryPublic } from "../service/menuItemService";
import Swal from "sweetalert2";

const normalizeText = (value) => value?.trim().toLowerCase() || "";

export default function useMenu(shopId) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await getCategoriesByShop(shopId);
      setCategories(data || []);
      if (data?.length) {
        setSelectedCategory((current) => current || data[0].id);
      }
    } catch (error) {
      Swal.fire("Error", "Unable to load categories.", "error");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const loadMenu = useCallback(
    async (categoryId) => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const data = await getItemsByCategoryPublic(categoryId);
        setItems(data || []);
      } catch (error) {
        Swal.fire("Error", "Unable to load menu.", "error");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const filteredItems = useMemo(() => {
    const query = normalizeText(search);
    if (!query) return items;
    return items.filter((item) =>
      normalizeText(item.name).includes(query),
    );
  }, [items, search]);

  return {
    categories,
    selectedCategory,
    items: filteredItems,
    search,
    loading,
    setSearch,
    setSelectedCategory,
    loadCategories,
    loadMenu,
  };
}
