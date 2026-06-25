import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import DraftCustomers from "./components/DraftCustomers";
import MenuPanel from "./components/MenuPanel";
import CustomerPanel from "./components/CustomerPanel";
import CartPanel from "./components/CartPanel";
import MobileBottomNav from "./components/MobileBottomNav";

import {
    getWalkInCarts,
    getWalkInCart,
    createWalkInCart,
} from "../../service/walkInService";

import "./CSS/WalkInOrder.css";

export default function WalkInOrder() {

    const [mobileTab, setMobileTab] = useState("menu");

    /*
    ========================================
    SHARED STATE
    ========================================
    */

    const [loading, setLoading] = useState(true);

    const [carts, setCarts] = useState([]);

    const [selectedCartId, setSelectedCartId] = useState(null);

    const [selectedCart, setSelectedCart] = useState(null);

    /*
    ========================================
    LOAD CARTS
    ========================================
    */

    const loadCarts = useCallback(async () => {

        try {

            setLoading(true);

            let list = await getWalkInCarts();

            list = list || [];

            /*
            ------------------------------------
            Create first cart automatically
            ------------------------------------
            */

            if (list.length === 0) {

                const cart = await createWalkInCart({

                    customer_name: "Walk-In Customer",

                    customer_phone: "",

                    payment_method: "cash",

                    notes: "",

                });

                list = [cart];

            }

            setCarts(list);

            /*
            ------------------------------------
            Select first cart
            ------------------------------------
            */

            if (!selectedCartId) {

                setSelectedCartId(list[0].id);

            }

        }

        catch (error) {

            console.log(error);

            Swal.fire(

                "Error",

                "Unable to load walk-in carts.",

                "error"

            );

        }

        finally {

            setLoading(false);

        }

    }, [selectedCartId]);

    /*
    ========================================
    LOAD SINGLE CART
    ========================================
    */

    const loadSelectedCart = useCallback(async (cartId) => {

        if (!cartId) return;

        try {

            const cart = await getWalkInCart(cartId);

            setSelectedCart(cart);

        }

        catch (error) {

            console.log(error);

        }

    }, []);

    /*
    ========================================
    CREATE NEW CART
    ========================================
    */

    const createCustomerCart = async () => {

        try {

            const cart = await createWalkInCart({

                customer_name: "Walk-In Customer",

                customer_phone: "",

                payment_method: "cash",

                notes: "",

            });

            await loadCarts();

            setSelectedCartId(cart.id);

            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "success",

                timer: 1500,

                title: "New Customer Created",

                showConfirmButton: false,

            });

        }

        catch (error) {

            Swal.fire(

                "Error",

                "Unable to create customer.",

                "error"

            );

        }

    };

    /*
    ========================================
    INITIAL LOAD
    ========================================
    */

    useEffect(() => {

        loadCarts();

    }, [loadCarts]);

    /*
    ========================================
    LOAD SELECTED CART
    ========================================
    */

    useEffect(() => {

        if (selectedCartId) {

            loadSelectedCart(selectedCartId);

        }

    }, [

        selectedCartId,

        loadSelectedCart,

    ]);

    /*
    ========================================
    AUTO REFRESH
    ========================================
    */

    useEffect(() => {

        const interval = setInterval(() => {

            loadCarts();

        }, 10000);

        return () => clearInterval(interval);

    }, [loadCarts]);

    return (

        <div className="walkin-page">

            <header className="walkin-header">

                <div>

                    <h1>

                        Walk-In POS

                    </h1>

                    <p>

                        Restaurant Point of Sale

                    </p>

                </div>

                <div className="live-status">

                    <span className="live-dot"/>

                    Live Updates

                </div>

            </header>

            <main className="walkin-layout">

                <aside
                    className={`left-panel ${
                        mobileTab !== "customers"
                            ? "mobile-hide"
                            : ""
                    }`}
                >

                    <DraftCustomers

                        loading={loading}

                        carts={carts}

                        selectedCartId={selectedCartId}

                        setSelectedCartId={setSelectedCartId}

                        createCustomerCart={createCustomerCart}

                    />

                </aside>

                <section
                    className={`center-panel ${
                        mobileTab !== "menu"
                            ? "mobile-hide"
                            : ""
                    }`}
                >

                    <MenuPanel

                        selectedCart={selectedCart}

                        refreshCart={() =>
                            loadSelectedCart(
                                selectedCartId
                            )
                        }

                    />

                </section>

                <aside
                    className={`right-panel ${
                        mobileTab !== "cart"
                            ? "mobile-hide"
                            : ""
                    }`}
                >

                    <CustomerPanel

                        selectedCart={selectedCart}

                        refreshCart={() =>
                            loadSelectedCart(
                                selectedCartId
                            )
                        }

                    />

                    <CartPanel

                        selectedCart={selectedCart}

                        refreshCart={() =>
                            loadSelectedCart(
                                selectedCartId
                            )
                        }

                    />

                </aside>

            </main>

            <MobileBottomNav

                active={mobileTab}

                setActive={setMobileTab}

            />

        </div>

    );

}