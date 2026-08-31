self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "WeatherGPT Emergency Alert";
  const options = {
    body: data.body || "Severe weather alert in your area.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
