export default function MobileBottomNav({

    active,

    setActive,

}) {

    return (

        <div className="mobile-nav">

            <button

                className={
                    active==="customers"
                    ? "active"
                    : ""
                }

                onClick={()=>
                    setActive("customers")
                }

            >

                Customers

            </button>

            <button

                className={
                    active==="menu"
                    ? "active"
                    : ""
                }

                onClick={()=>
                    setActive("menu")
                }

            >

                Menu

            </button>

            <button

                className={
                    active==="cart"
                    ? "active"
                    : ""
                }

                onClick={()=>
                    setActive("cart")
                }

            >

                Cart

            </button>

        </div>

    );

}