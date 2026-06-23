import { useEffect } from "react";

export default function useOrderSocket(
  orderId,
  onUpdate
) {
  useEffect(() => {

    if (!orderId) return;

    const ws =
      new WebSocket(
        `ws://127.0.0.1:8000/ws/orders/${orderId}/`
      );

    ws.onopen = () => {
      console.log(
        "Connected"
      );
    };

    ws.onmessage = (
      event
    ) => {

      const data =
        JSON.parse(
          event.data
        );

      onUpdate(data);
    };

    ws.onclose = () => {
      console.log(
        "Disconnected"
      );
    };

    return () => {
      ws.close();
    };

  }, [
    orderId,
    onUpdate
  ]);
}