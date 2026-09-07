import { useState } from "react";
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

  const saveCapacity = () => {
    const value = Number(capacityInput);
    if (!Number.isInteger(value) || value < 1 || value > 1000) {
      Swal.fire("Invalid capacity", "Enter a whole number between 1 and 1000.", "warning");
      return;
    }
    saveMutation.mutate(value, { onSuccess: () => { setCapacityInput(""); Swal.fire({ icon: "success", title: "Capacity updated", timer: 1400, showConfirmButton: false }); } });
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
        <div className="capacity-actions">{paused ? <button className="btn btn-success" onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending}>{resumeMutation.isPending ? "Resuming..." : "Resume online orders"}</button> : <button className="btn btn-outline-danger" onClick={() => setShowPause(true)} disabled={pauseMutation.isPending}>Pause online orders</button>}</div>
        {mutationError && <p className="capacity-alert" role="alert">Unable to update capacity. Please try again.</p>}
        {showPause && <div className="pause-dialog-backdrop" role="presentation"><section className="pause-dialog" role="dialog" aria-modal="true" aria-labelledby="pause-title"><h2 id="pause-title">Pause online ordering?</h2><label htmlFor="pause-reason">Reason <select id="pause-reason" value={reason} onChange={(event) => setReason(event.target.value)}><option value="">Select a reason (optional)</option>{QUICK_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="pause-dialog-actions"><button className="btn btn-light" onClick={() => setShowPause(false)}>Cancel</button><button className="btn btn-danger" onClick={pause} disabled={pauseMutation.isPending}>{pauseMutation.isPending ? "Pausing..." : "Pause orders"}</button></div></section></div>}
      </div>
    </div>
  );
};

export default OrderCapacitySettings;
