import { useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const PUSH_EVENT = "nfood:enable-push";
const PUSH_BOUND_KEY = "nfood:push-bound-user";

function decodeBase64Url(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(Array.from(raw, (character) => character.charCodeAt(0))).buffer;
}

async function bindPushSubscription(publicKey: string, save: (input: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) => Promise<unknown>) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.ready;
  const applicationServerKey = decodeBase64Url(publicKey);
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return false;
  await save({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, userAgent: navigator.userAgent });
  return true;
}

function playNotificationChime() {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") return;
  try {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
    gain.connect(context.destination);
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(740, context.currentTime);
    oscillator.frequency.setValueAtTime(988, context.currentTime + 0.14);
    oscillator.connect(gain);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.44);
    window.setTimeout(() => void context.close(), 700);
  } catch {
    // Browsers can reject audio until the user has interacted with the page.
  }
}

export function NotificationEffects() {
  const { user } = useAuth();
  const notifications = trpc.notifications.mine.useQuery(undefined, {
    enabled: Boolean(user),
    retry: false,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });
  const pushConfig = trpc.notifications.pushConfig.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const pushSubscribe = trpc.notifications.pushSubscribe.useMutation();
  const initializedUser = useRef<number | null>(null);
  const latestNotificationId = useRef<number | null>(null);
  const userInteracted = useRef(false);

  useEffect(() => {
    const armAudio = () => { userInteracted.current = true; };
    window.addEventListener("pointerdown", armAudio, { once: true, passive: true });
    window.addEventListener("keydown", armAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", armAudio);
      window.removeEventListener("keydown", armAudio);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      initializedUser.current = null;
      latestNotificationId.current = null;
      return;
    }
    const rows = notifications.data ?? [];
    const newestUnread = rows.filter((row) => !row.readAt).reduce((max, row) => Math.max(max, row.id), 0);
    if (initializedUser.current !== user.id) {
      initializedUser.current = user.id;
      latestNotificationId.current = newestUnread || null;
      return;
    }
    if (newestUnread > (latestNotificationId.current ?? 0)) {
      latestNotificationId.current = newestUnread;
      if (userInteracted.current && document.visibilityState === "visible") playNotificationChime();
      window.dispatchEvent(new CustomEvent("nfood:notification-received", { detail: { id: newestUnread } }));
    }
  }, [notifications.data, user]);

  const enablePush = async () => {
    const publicKey = pushConfig.data?.publicKey?.trim();
    if (!publicKey || !user) return;
    try {
      if (typeof Notification === "undefined") return;
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") return;
      await bindPushSubscription(publicKey, (input) => pushSubscribe.mutateAsync(input));
      window.sessionStorage.setItem(`${PUSH_BOUND_KEY}:${user.id}`, "1");
    } catch (error) {
      console.warn("[Push] unified subscription failed", error);
    }
  };

  useEffect(() => {
    if (!user || !pushConfig.data?.publicKey) return;
    if (typeof Notification === "undefined") return;
    const key = `${PUSH_BOUND_KEY}:${user.id}`;
    if (Notification.permission === "granted" && window.sessionStorage.getItem(key) !== "1") void enablePush();
    const listener = () => void enablePush();
    const pushMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === "NFOOD_PUSH_RECEIVED" && userInteracted.current && document.visibilityState === "visible") playNotificationChime();
    };
    window.addEventListener(PUSH_EVENT, listener);
    navigator.serviceWorker?.addEventListener("message", pushMessage);
    return () => {
      window.removeEventListener(PUSH_EVENT, listener);
      navigator.serviceWorker?.removeEventListener("message", pushMessage);
    };
  }, [pushConfig.data?.publicKey, user?.id]);

  return null;
}

export function requestPushNotifications() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PUSH_EVENT));
}
