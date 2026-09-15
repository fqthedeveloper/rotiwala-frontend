// src/hooks/useNewOrderAlert.js
//
// Plays a ringtone + shows a browser notification whenever the
// "pending" order count increases (new order arrived).
// Also watches for new delivery assignments if `assignmentCount` is provided.
//
// Usage:
//   const { soundEnabled, toggleSound } = useNewOrderAlert(pendingCount, assignmentCount);

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Synthesise a pleasant "ding ding" alert tone via Web Audio API ───────────
function playAlertTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const beeps = [
      { freq: 880, start: 0.0,  dur: 0.18 },
      { freq: 1100, start: 0.22, dur: 0.18 },
      { freq: 1320, start: 0.44, dur: 0.25 },
    ];

    beeps.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });

    // Close context after the last beep
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (e) {
    console.warn('Audio alert failed:', e);
  }
}

// ─── Show a browser desktop notification ──────────────────────────────────────
async function showBrowserNotification(title, body) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    const n = new Notification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'new-order',      // replaces previous notification instead of stacking
      renotify: true,
    });
    setTimeout(() => n.close(), 6000);
  }
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export default function useNewOrderAlert(pendingCount, assignmentCount = 0) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('orderSoundEnabled') !== 'false'; // default ON
  });

  const prevPendingRef = useRef(null);
  const prevAssignmentRef = useRef(null);
  const initDoneRef = useRef(false);  // skip alert on first load

  // Request notification permission once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Watch pending order count
  useEffect(() => {
    if (pendingCount == null) return;

    if (!initDoneRef.current) {
      // On first mount, just store baseline
      prevPendingRef.current = pendingCount;
      initDoneRef.current = true;
      return;
    }

    const prev = prevPendingRef.current ?? 0;
    const newOrders = pendingCount - prev;

    if (newOrders > 0) {
      if (soundEnabled) playAlertTone();
      showBrowserNotification(
        `🛎 ${newOrders} New Order${newOrders > 1 ? 's' : ''} Arrived!`,
        `You have ${pendingCount} pending order${pendingCount > 1 ? 's' : ''} waiting.`
      );
    }

    prevPendingRef.current = pendingCount;
  }, [pendingCount, soundEnabled]);

  // Watch delivery assignment count
  useEffect(() => {
    if (assignmentCount == null) return;

    if (prevAssignmentRef.current === null) {
      prevAssignmentRef.current = assignmentCount;
      return;
    }

    const prev = prevAssignmentRef.current ?? 0;
    const newAssignments = assignmentCount - prev;

    if (newAssignments > 0) {
      if (soundEnabled) playAlertTone();
      showBrowserNotification(
        `🚚 ${newAssignments} New Delivery Assignment${newAssignments > 1 ? 's' : ''}`,
        `A new order has been assigned for delivery.`
      );
    }

    prevAssignmentRef.current = assignmentCount;
  }, [assignmentCount, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('orderSoundEnabled', String(next));
      // Play a test tone when turning on
      if (next) playAlertTone();
      return next;
    });
  }, []);

  return { soundEnabled, toggleSound };
}
