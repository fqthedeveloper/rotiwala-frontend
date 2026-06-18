import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaShoppingCart,
  FaFilter,
  FaHeart,
} from "react-icons/fa";

import { getItemsPublic } from "../service/menuItemService";


const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getItemsPublic();

      if (!Array.isArray(data)) {
        setItems([]);
        return;
      }

      const uniqueItems = [];

      const names = new Set();

      data.forEach((item) => {
        const key = item.name.toLowerCase().trim();

        if (!names.has(key)) {
          names.add(key);
          uniqueItems.push(item);
        }
      });

      setItems(uniqueItems);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))];
    return cats;
  }, [items]);

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (search) {
      data = data.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      data = data.filter(
        (item) =>
          String(item.category) === String(category)
      );
    }

    if (maxPrice) {
      data = data.filter(
        (item) =>
          parseFloat(item.base_price) <=
          parseFloat(maxPrice)
      );
    }

    switch (sortBy) {
      case "price-low":
        data.sort(
          (a, b) =>
            parseFloat(a.base_price) -
            parseFloat(b.base_price)
        );
        break;

      case "price-high":
        data.sort(
          (a, b) =>
            parseFloat(b.base_price) -
            parseFloat(a.base_price)
        );
        break;

      case "name":
        data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      default:
        break;
    }

    return data;
  }, [
    items,
    search,
    category,
    sortBy,
    maxPrice,
    availableOnly,
]);

  return (
    <div className="container-fluid px-3 px-md-4 py-4 py-md-5">
      {/* Hero */}

      <div className="text-center mb-5">
        <h1 className="fw-bold display-5">
          Explore Our Menu
        </h1>

        <p className="text-muted">
          Delicious meals from all shops
        </p>
      </div>
      <div className="text-center mb-4">
        <span className="badge bg-warning text-dark px-3 py-2 fs-6">
          {filteredItems.length} Foods Available
        </span>
      </div>

      {/* Filters */}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-12 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search food..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <select
                className="form-select"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    Category {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-lg-2">
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-12 col-lg-2">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="default">
                  Sort By
                </option>

                <option value="name">
                  Name
                </option>

                <option value="price-low">
                  Price Low
                </option>

                <option value="price-high">
                  Price High
                </option>
              </select>
            </div>

            <div className="col-12 col-lg-2">
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) =>
                    setAvailableOnly(
                      e.target.checked
                    )
                  }
                />

                <label className="form-check-label">
                  Available Only
                </label>
              </div>
            </div>

            <div className="col-12 col-lg-2">
              <button className="btn btn-warning w-100">
                <FaFilter className="me-2" />
                Filters
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              className="col-12 col-sm-6 col-lg-4 col-xl-3"
              key={i}
            >
              <div
                className="card placeholder-glow"
                style={{
                  height: "350px",
                }}
              >
                <div className="placeholder w-100 h-100"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data */}

      {!loading &&
        filteredItems.length === 0 && (
          <div className="text-center py-5">
            <h4>No Food Found</h4>
          </div>
        )}

      {/* Products */}

      <div className="row g-4">
        {filteredItems.map((item) => (
          <div
            className="col-12 col-sm-6 col-lg-4 col-xl-3"
            key={item.id}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              transition={{
                duration: 0.3,
              }}
              className="card border-0 shadow-sm rounded-4 overflow-hidden h-100"
            >
              <div
                className="position-relative"
                style={{
                  height: "220px",
                }}
              >
                <img
                  src={
                    item.image_url ||
                    item.image
                  }
                  alt={item.name}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold">
                  {item.name}
                </h5>

                <p
                  className="text-muted small flex-grow-1"
                >
                  {item.description}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                      ₹{parseFloat(item.base_price).toFixed(2)}
                    </div>

                  <span className="badge bg-success">
                    Available
                  </span>
                </div>

                <button className="btn btn-warning mt-3">
                  <FaShoppingCart className="me-2" />
                  Add To Cart
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;