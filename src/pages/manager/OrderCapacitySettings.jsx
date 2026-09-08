import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  getManagerOrderCapacity,
  pauseOnlineOrders,
  resumeOnlineOrders,
  updateOrderCapacity,
} from "../../service/orderCapacityService";
import "./OrderCapacitySettings.css";

const QUICK_REASONS = ["Kitchen busy", "Staff shortage", "Ingredients unavailable", "Temporary issue", "Other"];

const OrderCapacitySettings = () => {
  const queryClient = useQueryClient();
  const [capacityInput, setCapacityInput] = useState("");
  const [deliverySettings, setDeliverySettings] = useState({
    delivery_radius_km: "2",
    delivery_fee: "0",
    free_delivery_min_order: "0",
    minimum_delivery_order: "0",
  });
  const [reason, setReason] = useState("");
  const [showPause, setShowPause] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["manager-order-capacity"],
    queryFn: getManagerOrderCapacity,
    refetchInterval: 15000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["manager-order-capacity"] });
  const saveMutation = useMutation({ mutationFn: updateOrderCapacity, onSuccess: refresh });
  const pauseMutation = useMutation({ mutationFn: pauseOnlineOrders, onSuccess: () => { setShowPause(false); setReason(""); refresh(); } });
  const resumeMutation = useMutation({ mutationFn: resumeOnlineOrders, onSuccess: refresh });

  useEffect(() => {
    if (data?.delivery_radius_km == null) return undefined;
    const refreshTimer = window.setTimeout(() => {
      setDeliverySettings({
        delivery_radius_km: String(data.delivery_radius_km),
        delivery_fee: String(data.delivery_fee ?? 0),
        free_delivery_min_order: String(data.free_delivery_min_order ?? 0),
        minimum_delivery_order: String(data.minimum_delivery_order ?? 0),
      });
    }, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [data]);

  if (isLoading) return <div className="capacity-page"><div className="capacity-panel capacity-loading" role="status">Loading order capacity...</div></div>;
  if (isError || !data) return <div className="capacity-page"><div className="capacity-panel"><p>Unable to load order capacity.</p><button className="btn btn-warning" onClick={() => refetch()}>Retry</button></div></div>;

  const active = Number(data.active_online_orders ?? data.active_orders ?? 0);
  const maximum = Number(data.max_online_orders ?? data.maximum_orders ?? 1);
  const percentage = Math.min(100, Math.max(0, (active / Math.max(maximum, 1)) * 100));
  const full = active >= maximum;
  const overCapacity = active > maximum;
  const paused = Boolean(data.manually_paused);
  const accepting = Boolean(data.accepting_online_orders) && !full && !paused;
  const mutationError = saveMutation.error || pauseMutation.error || resumeMutation.error;

  const updateDeliverySetting = (event) => {
    const { name, value } = event.target;
    setDeliverySettings((current) => ({ ...current, [name]: value }));
  };

  const saveCapacity = () => {
    const value = Number(capacityInput);
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      Swal.fire("Invalid capacity", "Enter a whole number between 1 and 1000.", "warning");
      return;
    }
    saveMutation.mutate({ max_online_orders: value, ...deliverySettings }, { onSuccess: () => { setCapacityInput(""); Swal.fire({ icon: "success", title: "Settings updated", timer: 1400, showConfirmButton: false }); } });
  };

  const saveDeliverySettings = () => {
    const radius = Number(deliverySettings.delivery_radius_km);
    const fee = Number(deliverySettings.delivery_fee);
    const freeMinimum = Number(deliverySettings.free_delivery_min_order);
    const minimumOrder = Number(deliverySettings.minimum_delivery_order);
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isFinite(fee) || fee < 0 || !Number.isFinite(freeMinimum) || freeMinimum < 0 || !Number.isFinite(minimumOrder) || minimumOrder < 0) {
      Swal.fire("Invalid delivery rules", "Enter a positive radius and non-negative fee and order amounts.", "warning");
      return;
    }
    saveMutation.mutate(deliverySettings, { onSuccess: () => Swal.fire({ icon: "success", title: "Delivery rules updated", timer: 1400, showConfirmButton: false }) });
  };

  const pause = () => pauseMutation.mutate(reason.trim());

  return (
    <div className="capacity-page">
      <div className="capacity-panel">
        <div className="capacity-heading"><div><p className="capacity-eyebrow">Manager settings</p><h1>Order Capacity</h1></div><span className={`capacity-state ${accepting ? "is-open" : "is-closed"}`}>{accepting ? "● Accepting orders" : "● Online ordering closed"}</span></div>
        <div className="capacity-meter" aria-label={`${active} of ${maximum} active online orders`}>
          <div className="capacity-meter-top"><strong>{active} / {maximum}</strong><span>{Math.max(0, maximum - active)} available</span></div>
          <div className="capacity-track"><div className={`capacity-fill ${full ? "is-full" : ""}`} style={{ width: `${percentage}%` }} /></div>
          {overCapacity && <p className="capacity-alert">Over capacity. New online orders are temporarily blocked until active orders fall below the limit.</p>}
          {full && !overCapacity && !paused && <p className="capacity-alert">Full capacity. Ordering will automatically resume when an active order is completed.</p>}
          {paused && <p className="capacity-alert">Manager has temporarily paused online ordering{data.pause_reason ? `: ${data.pause_reason}` : "."}</p>}
        </div>
        <div className="capacity-stats"><div><span>Active online orders</span><strong>{active}</strong></div><div><span>Available capacity</span><strong>{Math.max(0, maximum - active)}</strong></div></div>
        <section className="capacity-controls" aria-labelledby="capacity-control-title"><h2 id="capacity-control-title">Maximum online orders</h2><div className="capacity-edit"><button type="button" aria-label="Decrease capacity" onClick={() => setCapacityInput(String(Math.max(1, Number(capacityInput || maximum) - 1)))}>−</button><input type="number" min="1" max="1000" value={capacityInput || maximum} onChange={(event) => setCapacityInput(event.target.value)} /><button type="button" aria-label="Increase capacity" onClick={() => setCapacityInput(String(Math.min(1000, Number(capacityInput || maximum) + 1)))}>+</button></div><button className="btn btn-warning" onClick={saveCapacity} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save capacity"}</button></section>
        <section className="capacity-controls delivery-controls" aria-labelledby="delivery-control-title"><h2 id="delivery-control-title">Delivery rules</h2><div className="row g-3"><div className="col-md-3"><label className="form-label" htmlFor="manager-delivery-radius">Radius (km)</label><input id="manager-delivery-radius" className="form-control" type="number" min="0.1" step="0.1" name="delivery_radius_km" value={deliverySettings.delivery_radius_km} onChange={updateDeliverySetting} /></div><div className="col-md-3"><label className="form-label" htmlFor="manager-delivery-fee">Fee (₹)</label><input id="manager-delivery-fee" className="form-control" type="number" min="0" step="0.01" name="delivery_fee" value={deliverySettings.delivery_fee} onChange={updateDeliverySetting} /></div><div className="col-md-3"><label className="form-label" htmlFor="manager-free-delivery">Free above (₹)</label><input id="manager-free-delivery" className="form-control" type="number" min="0" step="0.01" name="free_delivery_min_order" value={deliverySettings.free_delivery_min_order} onChange={updateDeliverySetting} /></div><div className="col-md-3"><label className="form-label" htmlFor="manager-min-delivery">Minimum order (₹)</label><input id="manager-min-delivery" className="form-control" type="number" min="0" step="0.01" name="minimum_delivery_order" value={deliverySettings.minimum_delivery_order} onChange={updateDeliverySetting} /></div></div><button className="btn btn-warning mt-3" onClick={saveDeliverySettings} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving..." : "Save delivery rules"}</button></section>
        <div className="capacity-actions">{paused ? <button className="btn btn-success" onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending}>{resumeMutation.isPending ? "Resuming..." : "Resume online orders"}</button> : <button className="btn btn-outline-danger" onClick={() => setShowPause(true)} disabled={pauseMutation.isPending}>Pause online orders</button>}</div>
        {mutationError && <p className="capacity-alert" role="alert">Unable to update capacity. Please try again.</p>}
        {showPause && <div className="pause-dialog-backdrop" role="presentation"><section className="pause-dialog" role="dialog" aria-modal="true" aria-labelledby="pause-title"><h2 id="pause-title">Pause online ordering?</h2><label htmlFor="pause-reason">Reason <select id="pause-reason" value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Select a reason (optional)</option>{QUICK_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="pause-dialog-actions"><button className="btn btn-light" onClick={() => setShowPause(false)}>Cancel</button><button className="btn btn-danger" onClick={pause} disabled={pauseMutation.isPending}>{pauseMutation.isPending ? "Pausing..." : "Pause orders"}</button></div></section></div>}
      </div>
    </div>
  );
};

export default OrderCapacitySettings;
