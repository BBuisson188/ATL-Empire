"use strict";

const CACHE_VERSION = "20260607a";
const CACHE_NAME = `atl-empire-${CACHE_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./card-gallery.html",
  "./manifest.json?v=20260607a",
  "./styles.css?v=20260607a",
  "./app.js?v=20260607a"
];
const ASSET_URLS = [
  "./assets/mansion.png",
  "./assets/townhouse_1.png",
  "./assets/townhouse_2.png",
  "./assets/townhouse_3.png",
  "./assets/townhouse_4.png",
  "./assets/board/arthur-m-blank-family-foundation.png",
  "./assets/board/atandt-fiber.png",
  "./assets/board/atlanta-beltline.png",
  "./assets/board/atlanta-braves.png",
  "./assets/board/atlanta-falcons.png",
  "./assets/board/atlanta-hawks.png",
  "./assets/board/atlantic-station.png",
  "./assets/board/bolst.png",
  "./assets/board/buckhead.png",
  "./assets/board/city-of-atlanta-property-tax.png",
  "./assets/board/college-football-hall-of-fame.png",
  "./assets/board/decatur.png",
  "./assets/board/free_parking.png",
  "./assets/board/georgia-aquarium.png",
  "./assets/board/georgia-income-tax.png",
  "./assets/board/georgia-lottery.png",
  "./assets/board/georgia-power.png",
  "./assets/board/hartsfield-jackson-airport.png",
  "./assets/board/heritage-preparatory-school.png",
  "./assets/board/hirsch-realty.png",
  "./assets/board/lenox-square.png",
  "./assets/board/marist-school.png",
  "./assets/board/path400.png",
  "./assets/board/peachtree-chance.png",
  "./assets/board/peachtree-dekalb-airport.png",
  "./assets/board/peachtree-street.png",
  "./assets/board/perimeter-mall.png",
  "./assets/board/phipps-plaza.png",
  "./assets/board/ponce-city-market.png",
  "./assets/board/silver-comet-trail.png",
  "./assets/board/stone-mountain-trail.png",
  "./assets/board/stuck-in-rush-hour.png",
  "./assets/board/take-i-285-at-5pm.png",
  "./assets/board/the-battery-atlanta.png",
  "./assets/board/vinings.png",
  "./assets/board/whitefield-academy.png",
  "./assets/board/world-of-coca-cola.png",
  "./assets/branding/atl-empire-board-logo-small.png",
  "./assets/branding/atl-empire-board-logo-transparent-v2.png",
  "./assets/branding/atl-empire-board-logo-transparent.png",
  "./assets/branding/atl-empire-board-logo.png",
  "./assets/branding/atl-empire-icon-small.png",
  "./assets/branding/atl-empire-logo-setup-small-v2.png",
  "./assets/branding/atl-empire-logo-setup-small.png",
  "./assets/tokens/bucket-edgeclean.png",
  "./assets/tokens/camera-edgeclean.png",
  "./assets/tokens/camera.png",
  "./assets/tokens/coke-edgeclean.png",
  "./assets/tokens/coke.png",
  "./assets/tokens/jet-edgeclean.png",
  "./assets/tokens/jet.png",
  "./assets/tokens/peach-edgeclean.png",
  "./assets/tokens/peach.png",
  "./assets/tokens/peanut-edgeclean.png",
  "./assets/tokens/peanut.png",
  "./assets/tokens/record-edgeclean.png",
  "./assets/tokens/record.png",
  "./assets/tokens/sandwich-edgeclean.png",
  "./assets/tokens/sandwich.png",
  "./assets/tokens/torch-edgeclean.png",
  "./assets/tokens/torch.png"
];
const PRECACHE_URLS = [...APP_SHELL, ...ASSET_URLS];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("atl-empire-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true }))
      || (await cache.match(fallbackUrl, { ignoreSearch: true }));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}
