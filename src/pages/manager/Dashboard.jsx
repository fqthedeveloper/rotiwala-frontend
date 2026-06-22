import { useEffect } from "react";

export default function Dashboard() {

  useEffect(() => {
    document.title = "Manager Dashboard";
  }, []);

  return (
    <div className="container-fluid py-4">

      <div className="card shadow border-0">

        <div className="card-body">

          <h2>
            Manager Dashboard
          </h2>

          <p>
            Dashboard Loaded Successfully
          </p>

        </div>

      </div>

    </div>
  );
}