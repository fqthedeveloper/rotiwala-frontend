import { useQuery } from "@tanstack/react-query";
import { getOnlineOrderStatus } from "../../service/orderCapacityService";
import "./OnlineOrderStatus.css";

const OnlineOrderStatus = ({ compact = false }) => {
  const shopId = localStorage.getItem("selected_shop");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["online-order-status", shopId],
    queryFn: () => getOnlineOrderStatus(shopId),
    enabled: Boolean(shopId),
    refetchInterval: 30000,
    retry: 1,
  });

  if (!shopId) {
    return <div className="online-order-status status-loading" aria-live="polite">Select a shop to check online ordering...</div>;
  }

  if (isLoading) {
    return <div className="online-order-status status-loading" aria-live="polite">Checking online ordering...</div>;
  }

  if (isError) {
    return (
      <div className="online-order-status status-error" role="status">
        Unable to check online ordering status.
        <button type="button" onClick={() => refetch()}>Refresh</button>
      </div>
    );
  }

  const capacityReached = Number(data?.available_capacity) <= 0;
  const accepting =
    Boolean(data?.accepting_online_orders) &&
    !capacityReached &&
    !data?.manually_paused;

  if (accepting) {
    return (
      <div className={`online-order-status status-open ${compact ? "compact" : ""}`} role="status">
        <span aria-hidden="true">●</span> Accepting online orders
      </div>
    );
  }

  return (
    <div className={`online-order-status status-closed ${compact ? "compact" : ""}`} role="status">
      <strong>{capacityReached ? "We're currently busy" : "Online ordering temporarily paused"}</strong>
      {!compact && (
        <p>{capacityReached
          ? "Our kitchen has reached its current order capacity. Please try again in a little while."
          : "We're temporarily not accepting online orders. Please check again shortly."}</p>
      )}
      <button type="button" onClick={() => refetch()}>Refresh</button>
    </div>
  );
};

export default OnlineOrderStatus;
