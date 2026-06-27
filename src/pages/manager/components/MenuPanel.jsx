import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  FaSearch,
  FaPlus,
  FaLeaf,
  FaFire,
  FaTimesCircle,
  FaSync,
} from "react-icons/fa";

import Swal from "sweetalert2";

import {
  getCategoriesByShop,
  getItemsByCategoryPublic,
} from "../../../service/menuItemService";

import { addItemToCart } from "../../../service/walkInService";

import './CSS/MenuPanel.css'

export default function MenuPanel({
  selectedCart,

  refreshCart,
}) {
  const shopId = localStorage.getItem("selected_shop");
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  const [adding, setAdding] = useState(false);
  async function loadCategories() {
    try {
      setLoading(true);

      const data = await getCategoriesByShop(shopId);

      setCategories(data || []);

      if (data.length) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.log(error);

      Swal.fire(
        "Error",

        "Unable to load categories.",

        "error",
      );
    } finally {
      setLoading(false);
    }
  }
  async function loadItems(categoryId) {
    if (!categoryId) return;

    try {
      setLoading(true);

      const data = await getItemsByCategoryPublic(categoryId);

      setItems(data || []);
    } catch (error) {
      Swal.fire(
        "Error",

        "Unable to load menu.",

        "error",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadCategories();
  }, []);
  useEffect(() => {
    if (selectedCategory) {
      loadItems(selectedCategory);
    }
  }, [selectedCategory]);
  const filteredItems = useMemo(() => {
    const q = search

      .toLowerCase()

      .trim();

    if (!q) return items;

    return items.filter((item) =>
      item.name

        .toLowerCase()

        .includes(q),
    );
  }, [items, search]);
  async function addProduct(product) {
    if (!selectedCart) {
      Swal.fire(
        "Select Customer",

        "Please select a draft customer first.",

        "warning",
      );

      return;
    }

    try {
      setAdding(true);

      await addItemToCart(
        selectedCart.id,

        product.id,

        1,
      );

      refreshCart();

      Swal.fire({
        toast: true,

        position: "top-end",

        icon: "success",

        title: "Added",

        timer: 1000,

        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire(
        "Error",

        "Unable to add item.",

        "error",
      );
    } finally {
      setAdding(false);
    }
  }
  if (loading) {
    return (
      <div className="menu-loading">
        <FaSync className="spin" />

        <h5>Loading Menu...</h5>
      </div>
    );
  }
  return (
    <>
      <div className="menu-search">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="category-list">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={
              selectedCategory === category.id
                ? "category-btn active"
                : "category-btn"
            }
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="menu-grid">
        {filteredItems.length === 0 && (
          <div className="menu-empty">
            <FaTimesCircle />

            <h4>No Menu Found</h4>

            <p>Try another search.</p>
          </div>
        )}

        {filteredItems.map(
          (
            item,

            index,
          ) => (
            <motion.div
              key={item.id}
              layout
              initial={{
                opacity: 0,

                y: 20,
              }}
              animate={{
                opacity: 1,

                y: 0,
              }}
              transition={{
                delay: index * 0.04,
              }}
              className="menu-card"
            >
              <img
                src={item.image || item.image_url}
                alt={item.name}
                className="menu-image"
              />
              <div className="menu-body">
                <div className="menu-top">

                  {item.is_available ? (
                    <span className="available">Available</span>
                  ) : (
                    <span className="not-available">Out</span>
                  )}
                </div>
                <h4>{item.name}</h4>

                <p>{item.description}</p>

                <div className="menu-price">
                  ₹{Number(item.base_price).toFixed(2)}
                </div>

                <button
                  className="add-cart-btn"
                  disabled={adding || !item.is_available}
                  onClick={() => addProduct(item)}
                >
                  <FaPlus />

                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </motion.div>
          ),
        )}
      </div>
    </>
  );
}
