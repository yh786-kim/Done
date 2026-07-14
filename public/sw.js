// Done 서비스워커: 푸시 수신 + 알림 클릭 처리

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "Done", body: "확인할 내용이 있어요", url: "/me" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag: data.tag, // 같은 항목은 하나로 갱신
      renotify: true, // 갱신 시에도 소리/진동 다시 울림
      requireInteraction: true, // 사용자가 반응할 때까지 알림 유지
      vibrate: [300, 120, 300, 120, 300], // 진동 패턴
      data: { url: data.url || "/me", requestId: data.requestId, date: data.date },
      actions: [{ action: "done", title: "했어요 ✓" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const n = event.notification;
  n.close();
  const { url = "/me", requestId, date } = n.data || {};

  // 알림의 '했어요' 버튼을 누르면 바로 완료 처리(앱을 열지 않아도 됨)
  if (event.action === "done" && requestId) {
    event.waitUntil(
      fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requestId, date, done: true }),
      }).catch(() => {})
    );
    return;
  }

  // 그 외 클릭: 앱 열기(있으면 포커스)
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
