import { useEffect, useRef, useState } from "react";

const WALKIN_WS_PATH = "/ws/walkin/updates/";

const buildWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}${WALKIN_WS_PATH}`;
};

export default function useWalkInSocket({ onMessage, onOpen, onClose } = {}) {
  const [status, setStatus] = useState("connecting");
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const handlersRef = useRef({ onMessage, onOpen, onClose });

  useEffect(() => {
    handlersRef.current = { onMessage, onOpen, onClose };
  }, [onMessage, onOpen, onClose]);

  useEffect(() => {
    let mounted = true;

    const connect = () => {
      if (!mounted || socketRef.current) {
        return;
      }

      setStatus("connecting");

      try {
        const socket = new WebSocket(buildWebSocketUrl());

        socket.onopen = () => {
          socketRef.current = socket;
          setStatus("online");
          handlersRef.current.onOpen?.();
        };

        socket.onmessage = (event) => {
          handlersRef.current.onMessage?.(event);
        };

        socket.onclose = () => {
          socketRef.current = null;
          setStatus("offline");
          handlersRef.current.onClose?.();
          if (mounted) {
            reconnectRef.current = window.setTimeout(connect, 5000);
          }
        };

        socket.onerror = () => {
          setStatus("error");
          socket.close();
        };
      } catch (error) {
        setStatus("error");
        reconnectRef.current = window.setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return status;
}
