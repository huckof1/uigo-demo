import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import {
  formatTenge,
  availabilityColors,
  getAvailabilityText,
  getMarkerLabel,
  getMarkerTimeLabel,
  mockProperties,
  propertyTypeLabels,
} from "@/lib/mock/properties";
import type { MockProperty } from "@/lib/types/property";

declare const process:
  | {
      env?: {
        EXPO_PUBLIC_2GIS_API_KEY?: string;
      };
    }
  | undefined;

const TWO_GIS_API_KEY =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_2GIS_API_KEY ?? "" : "";

const COUNTRY_CLUSTER_ZOOM = 4.7;
const CITY_CLUSTER_ZOOM = 10.2;
const DISTRICT_CLUSTER_ZOOM = 13.25;
const SEARCH_RESULT_LIMIT = 72;
const SEARCH_STOP_WORDS = new Set([
  "г",
  "город",
  "д",
  "дом",
  "мкр",
  "микрорайон",
  "пр",
  "проспект",
  "р-н",
  "район",
  "ул",
  "улица",
]);

type DistrictCluster = {
  center: {
    latitude: number;
    longitude: number;
  };
  city: string;
  district?: string;
  key: string;
  kind: "country" | "city" | "district";
  label: string;
  properties: MockProperty[];
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type WebMessage =
  | {
      mode: "countryCluster" | "cityClusters" | "districtClusters" | "properties";
      type: "mapState";
      zoom: number;
    }
  | {
      propertyId: string | null;
      type: "selectProperty";
    };

function getCover(property: MockProperty) {
  return [...property.photos].sort((left, right) => left.priority - right.priority)[0];
}

function isLocationInKazakhstan(location?: UserLocation | null) {
  if (!location) {
    return false;
  }

  return (
    location.latitude >= 40 &&
    location.latitude <= 56 &&
    location.longitude >= 46 &&
    location.longitude <= 88
  );
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  return normalizeSearch(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
}

function isTokenMatch(token: string, fieldToken: string) {
  if (fieldToken === token || fieldToken.includes(token) || token.includes(fieldToken)) {
    return true;
  }

  if (token.length < 5 || fieldToken.length < 5) {
    return false;
  }

  const minLength = Math.min(token.length, fieldToken.length);
  let sameCharacters = 0;

  for (let index = 0; index < minLength; index += 1) {
    if (token[index] === fieldToken[index]) {
      sameCharacters += 1;
    }
  }

  return sameCharacters / Math.max(token.length, fieldToken.length) >= 0.72;
}

function getDistanceKmFromUser(property: MockProperty, userLocation?: UserLocation | null) {
  if (!userLocation) {
    return 0;
  }

  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(property.coordinate.latitude - userLocation.latitude);
  const dLon = toRad(property.coordinate.longitude - userLocation.longitude);
  const lat1 = toRad(userLocation.latitude);
  const lat2 = toRad(property.coordinate.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function getAvailabilityPriority(property: MockProperty) {
  if (property.availabilityStatus === "available_now") {
    return 0;
  }

  if (property.availabilityStatus === "available_soon") {
    return 1;
  }

  if (property.availabilityStatus === "available_later") {
    return 2;
  }

  if (property.availabilityStatus === "unknown_time") {
    return 3;
  }

  return 4;
}

function getReadyMinutes(property: MockProperty) {
  if (property.availabilityStatus === "available_now") {
    return 0;
  }

  if (typeof property.availableInMinutes === "number") {
    return property.availableInMinutes;
  }

  if (property.availabilityStatus === "unknown_time") {
    return 9998;
  }

  return 9999;
}

function getTypeSearchTerms(property: MockProperty) {
  if (property.type === "room") {
    return ["номер", "комната", "гостиница"];
  }

  if (property.type === "aparthotel") {
    return ["апарт", "апарт-отель", "отель", "апартаменты"];
  }

  return ["квартира", "апартаменты", "жилье"];
}

function getSearchRelevance(property: MockProperty, normalizedQuery: string) {
  if (!normalizedQuery) {
    return 0;
  }

  const queryTokens = getSearchTokens(normalizedQuery);
  const textFields = {
    address: normalizeSearch(property.address),
    city: normalizeSearch(property.city),
    description: normalizeSearch(property.description),
    district: normalizeSearch(property.district),
    title: normalizeSearch(property.title),
    type: normalizeSearch(
      [propertyTypeLabels[property.type], ...getTypeSearchTerms(property)].join(" "),
    ),
  };
  const tokenFields = {
    address: getSearchTokens(property.address),
    city: getSearchTokens(property.city),
    description: getSearchTokens(property.description),
    district: getSearchTokens(property.district),
    title: getSearchTokens(property.title),
    type: getSearchTokens(
      [propertyTypeLabels[property.type], ...getTypeSearchTerms(property)].join(" "),
    ),
  };
  const priceQuery = Number(normalizedQuery.replace(/[^\d]/g, ""));
  const fields = Object.values(textFields);
  const allFieldTokens = Object.values(tokenFields).flat();

  let relevance = 0;

  if (fields.some((field) => field === normalizedQuery)) {
    relevance += 90;
  }

  if (textFields.city.includes(normalizedQuery)) {
    relevance += 44;
  }

  if (textFields.district.includes(normalizedQuery)) {
    relevance += 38;
  }

  if (textFields.address.includes(normalizedQuery)) {
    relevance += 30;
  }

  if (fields.some((field) => field.includes(normalizedQuery))) {
    relevance += 18;
  }

  queryTokens.forEach((token) => {
    if (tokenFields.city.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 36;
    }

    if (tokenFields.district.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 32;
    }

    if (tokenFields.address.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 34;
    }

    if (tokenFields.type.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 28;
    }

    if (tokenFields.title.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 16;
    }

    if (tokenFields.description.some((fieldToken) => isTokenMatch(token, fieldToken))) {
      relevance += 8;
    }
  });

  const matchedTokenCount = queryTokens.filter((token) =>
    allFieldTokens.some((fieldToken) => isTokenMatch(token, fieldToken)),
  ).length;

  if (queryTokens.length > 0 && matchedTokenCount === queryTokens.length) {
    relevance += 28 + matchedTokenCount * 8;
  } else if (matchedTokenCount > 0) {
    relevance += matchedTokenCount * 6;
  }

  if (priceQuery > 0) {
    const hourlyDiff = Math.abs(property.hourlyPrice - priceQuery);
    const dailyDiff = Math.abs(property.dailyPrice - priceQuery);

    if (property.hourlyPrice <= priceQuery || property.dailyPrice <= priceQuery) {
      relevance += 34;
    }

    if (hourlyDiff <= 1500 || dailyDiff <= 3000) {
      relevance += 24;
    }
  }

  return relevance;
}

function getSearchScore(property: MockProperty, userLocation?: UserLocation | null) {
  const priority = getAvailabilityPriority(property);
  const minutes = getReadyMinutes(property);
  const distanceKm = getDistanceKmFromUser(property, userLocation);
  const priceWeight = property.hourlyPrice / 100;

  if (property.availabilityStatus === "available_now") {
    return priority * 100000 + distanceKm * 10 + priceWeight;
  }

  if (property.availabilityStatus === "available_soon") {
    return priority * 100000 + minutes * 18 + distanceKm * 9 + priceWeight;
  }

  if (property.availabilityStatus === "available_later") {
    return priority * 100000 + minutes * 8 + distanceKm * 7 + priceWeight * 0.8;
  }

  return priority * 100000 + distanceKm * 3 + priceWeight;
}

function getNearestCity(properties: MockProperty[], userLocation?: UserLocation | null) {
  if (!userLocation) {
    return null;
  }

  const cityDistances = properties.reduce<Record<string, number>>((acc, property) => {
    const distance = getDistanceKmFromUser(property, userLocation);
    const currentDistance = acc[property.city];

    if (currentDistance === undefined || distance < currentDistance) {
      acc[property.city] = distance;
    }

    return acc;
  }, {});

  const [nearestCity] =
    Object.entries(cityDistances).sort((left, right) => left[1] - right[1])[0] ?? [];

  return nearestCity ?? null;
}

function getSearchResults(
  properties: MockProperty[],
  query: string,
  userLocation?: UserLocation | null,
) {
  const normalizedQuery = normalizeSearch(query);
  const nearestCity = normalizedQuery ? null : getNearestCity(properties, userLocation);
  const ranked = properties
    .map((property) => ({
      property,
      relevance: getSearchRelevance(property, normalizedQuery),
      score: getSearchScore(property, userLocation),
    }))
    .filter((item) => !normalizedQuery || item.relevance > 0)
    .sort((left, right) => {
      if (!normalizedQuery && nearestCity) {
        const leftIsNearest = left.property.city === nearestCity;
        const rightIsNearest = right.property.city === nearestCity;

        if (leftIsNearest !== rightIsNearest) {
          return leftIsNearest ? -1 : 1;
        }
      }

      if (normalizedQuery && right.relevance !== left.relevance) {
        return right.relevance - left.relevance;
      }

      const scoreDiff = left.score - right.score;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return left.property.hourlyPrice - right.property.hourlyPrice;
    });

  return ranked.slice(0, SEARCH_RESULT_LIMIT).map((item) => item.property);
}

function getDistrictClusters(properties: MockProperty[]): DistrictCluster[] {
  const groups = properties.reduce<Record<string, MockProperty[]>>((acc, property) => {
    const key = `${property.city}:${property.district}`;
    acc[key] = [...(acc[key] ?? []), property];

    return acc;
  }, {});

  return Object.entries(groups).map(([key, districtProperties]) => {
    const [city, district] = key.split(":");
    const latitude =
      districtProperties.reduce((sum, property) => sum + property.coordinate.latitude, 0) /
      districtProperties.length;
    const longitude =
      districtProperties.reduce((sum, property) => sum + property.coordinate.longitude, 0) /
      districtProperties.length;

    return {
      center: {
        latitude,
        longitude,
      },
      city,
      district,
      key,
      kind: "district",
      label: city === "Алматы" ? district : `${city}, ${district}`,
      properties: districtProperties,
    };
  });
}

function getCityClusters(properties: MockProperty[]): DistrictCluster[] {
  const groups = properties.reduce<Record<string, MockProperty[]>>((acc, property) => {
    acc[property.city] = [...(acc[property.city] ?? []), property];

    return acc;
  }, {});

  return Object.entries(groups).map(([city, cityProperties]) => {
    const latitude =
      cityProperties.reduce((sum, property) => sum + property.coordinate.latitude, 0) /
      cityProperties.length;
    const longitude =
      cityProperties.reduce((sum, property) => sum + property.coordinate.longitude, 0) /
      cityProperties.length;

    return {
      center: {
        latitude,
        longitude,
      },
      city,
      key: city,
      kind: "city",
      label: city,
      properties: cityProperties,
    };
  });
}

function getCountryCluster(properties: MockProperty[]): DistrictCluster[] {
  if (properties.length === 0) {
    return [];
  }

  const latitude =
    properties.reduce((sum, property) => sum + property.coordinate.latitude, 0) /
    properties.length;
  const longitude =
    properties.reduce((sum, property) => sum + property.coordinate.longitude, 0) /
    properties.length;

  return [
    {
      center: {
        latitude,
        longitude,
      },
      city: "Казахстан",
      key: "kazakhstan",
      kind: "country",
      label: "Казахстан",
      properties,
    },
  ];
}

function getZoomLabel(zoom: number) {
  if (zoom >= 17) {
    return "дом";
  }

  if (zoom >= 15) {
    return "улица";
  }

  if (zoom >= DISTRICT_CLUSTER_ZOOM) {
    return "район";
  }

  return "город";
}

function buildClusterPayload(clusters: DistrictCluster[] = []) {
  return clusters
    .filter((cluster) => Array.isArray(cluster.properties) && cluster.properties.length > 0)
    .map((cluster) => ({
      ...cluster,
      minPrice: Math.min(...cluster.properties.map((property) => property.hourlyPrice)),
      nowCount: cluster.properties.filter(
        (property) => property.availabilityStatus === "available_now",
      ).length,
    }));
}

function buildTwoGisHtml(
  properties: MockProperty[] = [],
  cityClusters?: DistrictCluster[],
  districtClusters?: DistrictCluster[],
  initialPropertyId?: string,
  userLocation?: UserLocation | null,
) {
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeCityClusters =
    Array.isArray(cityClusters) && cityClusters.length > 0
      ? cityClusters
      : getCityClusters(safeProperties);
  const safeDistrictClusters =
    Array.isArray(districtClusters) && districtClusters.length > 0
      ? districtClusters
      : getDistrictClusters(safeProperties);
  const initialProperty = safeProperties.find((property) => property.id === initialPropertyId);
  const activeUserLocation = userLocation ?? null;
  const shouldCenterOnUser = isLocationInKazakhstan(activeUserLocation);
  const payload = JSON.stringify({
    apiKey: TWO_GIS_API_KEY,
    countryCluster: buildClusterPayload(getCountryCluster(safeProperties)),
    countryClusterZoom: COUNTRY_CLUSTER_ZOOM,
    cityClusterZoom: CITY_CLUSTER_ZOOM,
    cityClusters: buildClusterPayload(safeCityClusters),
    districtClusterZoom: DISTRICT_CLUSTER_ZOOM,
    districtClusters: buildClusterPayload(safeDistrictClusters),
    initialCenter: initialProperty
      ? [initialProperty.coordinate.longitude, initialProperty.coordinate.latitude]
      : shouldCenterOnUser && activeUserLocation
        ? [activeUserLocation.longitude, activeUserLocation.latitude]
      : [67.4, 48.1],
    focusPropertyId: initialProperty?.id ?? null,
    initialZoom: initialProperty ? 16.35 : shouldCenterOnUser ? 11.8 : 5.8,
    properties: safeProperties.map((property) => ({
      ...property,
      markerLabel: getMarkerLabel(property),
      markerTimeLabel: getMarkerTimeLabel(property),
    })),
    userLocation: activeUserLocation
      ? [activeUserLocation.longitude, activeUserLocation.latitude]
      : null,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no,width=device-width" />
  <script src="https://mapgl.2gis.com/api/js/v1"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: #e8e1d6;
      -webkit-user-select: none;
      user-select: none;
      touch-action: none;
    }
    .missing-key {
      box-sizing: border-box;
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 25% 25%, rgba(17, 166, 101, 0.18), transparent 28%),
        radial-gradient(circle at 80% 70%, rgba(255, 194, 46, 0.2), transparent 30%),
        #e8e1d6;
      color: #211c17;
    }
    .missing-key-card {
      max-width: 320px;
      border: 1px solid rgba(255,255,255,0.8);
      border-radius: 24px;
      padding: 18px;
      background: rgba(255,255,255,0.68);
      box-shadow: 0 22px 50px rgba(43, 33, 24, 0.14);
    }
    .missing-key-title {
      font-size: 20px;
      line-height: 24px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    .missing-key-text {
      font-size: 13px;
      line-height: 19px;
      font-weight: 700;
      color: rgba(33, 28, 23, 0.72);
    }
    .marker-shell {
      position: relative;
      width: 78px;
      height: 88px;
      transform: translateZ(0);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .marker-ring {
      position: absolute;
      top: 2px;
      left: 15px;
      width: 48px;
      height: 48px;
      border-radius: 999px;
      border: 2px solid var(--status);
      opacity: 0.52;
      box-sizing: border-box;
    }
    .marker-shell.available_now .marker-ring {
      width: 54px;
      height: 54px;
      left: 12px;
      top: 0;
      animation: pulseFast 700ms ease-out infinite;
    }
    .marker-shell.available_soon .marker-ring {
      width: 52px;
      height: 52px;
      left: 13px;
      top: 1px;
      animation: pulseSoon 1180ms ease-out infinite;
    }
    .marker-shell.available_later .marker-ring {
      animation: pulseLater 3600ms ease-out infinite;
      opacity: 0.36;
    }
    .marker-shell.unknown_time .marker-ring,
    .marker-shell.occupied .marker-ring {
      display: none;
    }
    .marker-glow {
      position: absolute;
      top: 8px;
      left: 19px;
      width: 40px;
      height: 40px;
      border-radius: 999px;
      background: var(--glow);
      filter: blur(0.2px);
    }
    .marker-shell.available_now .marker-glow {
      width: 50px;
      height: 50px;
      left: 14px;
      top: 3px;
    }
    .marker-shell.unknown_time .marker-glow,
    .marker-shell.occupied .marker-glow {
      opacity: 0.26;
    }
    .yurt {
      position: absolute;
      left: 15px;
      top: 11px;
      width: 48px;
      height: 34px;
      filter: drop-shadow(0 5px 7px rgba(55,39,25,0.2));
    }
    .marker-shell.available_now .yurt,
    .marker-shell.available_soon .yurt {
      animation: breathe 900ms ease-in-out infinite alternate;
    }
    .roof {
      position: absolute;
      left: 0;
      top: 0;
      width: 48px;
      height: 22px;
      box-sizing: border-box;
      border: 1.5px solid #5d3b20;
      border-radius: 24px 24px 10px 10px;
      overflow: hidden;
      background: #f4e5c8;
    }
    .roof::before {
      content: "";
      position: absolute;
      top: -1px;
      left: 17px;
      width: 14px;
      height: 6px;
      border-radius: 0 0 8px 8px;
      background: #7c4e28;
    }
    .roof::after {
      content: "";
      position: absolute;
      left: 7px;
      top: 5px;
      width: 17px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255,255,255,0.38);
      transform: rotate(-11deg);
    }
    .rib {
      position: absolute;
      top: 1px;
      width: 1.6px;
      height: 26px;
      border-radius: 2px;
      background: rgba(122,76,37,0.68);
    }
    .rib.r1 { left: 9px; transform: rotate(35deg); }
    .rib.r2 { left: 19px; transform: rotate(14deg); }
    .rib.r3 { right: 19px; transform: rotate(-14deg); }
    .rib.r4 { right: 9px; transform: rotate(-35deg); }
    .wall {
      position: absolute;
      left: 0.5px;
      top: 19px;
      width: 47px;
      height: 16px;
      box-sizing: border-box;
      border: 1.5px solid #5d3b20;
      border-radius: 5px 5px 14px 14px;
      overflow: hidden;
      background: #f9efd9;
    }
    .wall::before {
      content: "";
      position: absolute;
      inset: 1px 0 auto;
      height: 3px;
      background: var(--status);
    }
    .door {
      position: absolute;
      left: 16.5px;
      bottom: 0;
      width: 14px;
      height: 11px;
      border-radius: 5px 5px 0 0;
      background: linear-gradient(90deg, #a87542 0 46%, rgba(70,43,24,0.72) 46% 54%, #a87542 54%);
    }
    .price {
      position: absolute;
      top: 49px;
      left: 50%;
      transform: translateX(-50%);
      min-height: 24px;
      padding: 5px 8px 4px;
      border-radius: 999px;
      border: 1.5px solid var(--border);
      background: var(--status);
      color: var(--text);
      box-sizing: border-box;
      white-space: nowrap;
      font-size: 11px;
      line-height: 12px;
      font-weight: 900;
      text-shadow: 0 1px 1px rgba(0,0,0,0.14);
    }
    .time {
      position: absolute;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      min-height: 18px;
      padding: 4px 8px 3px;
      border-radius: 999px;
      border: 1px solid rgba(72,61,50,0.18);
      background: rgba(255,255,255,0.9);
      color: #211c17;
      box-sizing: border-box;
      white-space: nowrap;
      font-size: 9px;
      line-height: 10px;
      font-weight: 900;
    }
    .focus-badge {
      display: none;
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px 3px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.92);
      background: rgba(13,11,9,0.9);
      color: #fff;
      white-space: nowrap;
      font-size: 8px;
      line-height: 9px;
      font-weight: 900;
      letter-spacing: 0.2px;
      box-shadow: 0 8px 18px rgba(0,0,0,0.2);
    }
    .selected .price {
      outline: 2px solid rgba(255,255,255,0.96);
      box-shadow:
        0 0 0 4px rgba(255,255,255,0.24),
        0 12px 20px rgba(0,0,0,0.22);
    }
    .marker-shell.selected {
      transform: scale(1.18) translateZ(0);
      filter: drop-shadow(0 18px 24px rgba(43,33,24,0.34));
    }
    .marker-shell.selected .focus-badge {
      display: block;
    }
    .marker-shell.selected .marker-ring {
      display: block;
      width: 64px;
      height: 64px;
      left: 7px;
      top: -5px;
      border-color: rgba(255,255,255,0.96);
      border-width: 2.5px;
      opacity: 0.82;
      animation: selectedPulse 950ms ease-out infinite;
      box-shadow: 0 0 0 2px var(--status);
    }
    .marker-shell.selected .marker-glow {
      width: 60px;
      height: 60px;
      left: 9px;
      top: -2px;
      opacity: 0.9;
      background:
        radial-gradient(circle, rgba(255,255,255,0.7) 0%, var(--glow) 42%, transparent 72%);
    }
    .marker-shell.selected .yurt {
      animation: selectedBreathe 620ms ease-in-out infinite alternate;
    }
    .cluster-shell {
      position: relative;
      width: var(--cluster-width);
      min-height: var(--cluster-height);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      filter: drop-shadow(0 14px 22px rgba(43,33,24,0.18));
    }
    .cluster-ring {
      position: absolute;
      width: var(--ring-size);
      height: var(--ring-size);
      border-radius: 999px;
      border: 2px solid rgba(17,166,101,var(--cluster-alpha));
      animation: clusterPulse var(--cluster-speed) ease-out infinite;
      box-sizing: border-box;
    }
    .cluster-shell.no-live .cluster-ring {
      border-color: rgba(126,128,124,0.26);
      animation: none;
      opacity: 0.34;
    }
    .cluster-card {
      position: relative;
      width: calc(var(--cluster-width) - 12px);
      min-height: calc(var(--cluster-height) - 14px);
      box-sizing: border-box;
      border-radius: 28px;
      border: 1px solid rgba(255,255,255,0.72);
      background: rgba(255,247,231,0.9);
      padding: 9px 12px;
      color: #171512;
    }
    .cluster-count {
      font-size: var(--count-size);
      line-height: var(--count-line);
      font-weight: 900;
    }
    .cluster-unit {
      margin-left: 5px;
      color: #6f6558;
      font-size: 10px;
      line-height: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .cluster-district {
      margin-top: -1px;
      font-size: 14px;
      line-height: 17px;
      font-weight: 900;
      color: #332b23;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cluster-price {
      margin-top: 5px;
      font-size: 10px;
      line-height: 12px;
      font-weight: 900;
      color: #4a433a;
    }
    .cluster-live {
      display: inline-flex;
      margin-top: 6px;
      padding: 4px 7px;
      border-radius: 999px;
      background: rgba(17,166,101,0.14);
      color: #118c58;
      font-size: 9px;
      line-height: 10px;
      font-weight: 900;
    }
    .cluster-shell.no-live .cluster-live {
      background: rgba(126,128,124,0.14);
      color: #5f625e;
    }
    .user-location {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: rgba(42,119,255,0.18);
      border: 2px solid rgba(255,255,255,0.92);
      box-sizing: border-box;
      box-shadow: 0 8px 18px rgba(25,75,180,0.28);
    }
    .user-location::before {
      content: "";
      position: absolute;
      inset: 8px;
      border-radius: 999px;
      background: #2A77FF;
      box-shadow: 0 0 0 5px rgba(42,119,255,0.16);
    }
    @keyframes pulseFast {
      from { opacity: 0.78; transform: scale(0.76); }
      to { opacity: 0.24; transform: scale(1.48); }
    }
    @keyframes pulseSoon {
      from { opacity: 0.84; transform: scale(0.76); }
      to { opacity: 0.22; transform: scale(1.48); }
    }
    @keyframes pulseLater {
      from { opacity: 0.42; transform: scale(0.9); }
      to { opacity: 0.16; transform: scale(1.32); }
    }
    @keyframes clusterPulse {
      from { opacity: 0.42; transform: scale(0.8); }
      to { opacity: 0.12; transform: scale(1.48); }
    }
    @keyframes breathe {
      from { transform: scale(1); }
      to { transform: scale(1.025); }
    }
    @keyframes selectedPulse {
      from { opacity: 0.88; transform: scale(0.78); }
      to { opacity: 0.2; transform: scale(1.34); }
    }
    @keyframes selectedBreathe {
      from { transform: scale(1.03); }
      to { transform: scale(1.1); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const payload = ${payload};
    const RN = window.ReactNativeWebView;
    const colors = {
      available_now: { status: '#11A665', border: 'rgba(76,255,174,0.95)', glow: 'rgba(17,166,101,0.38)', text: '#fff' },
      available_soon: { status: '#FFC22E', border: 'rgba(255,246,166,0.98)', glow: 'rgba(255,194,46,0.44)', text: '#241C0C' },
      available_later: { status: '#E0772F', border: 'rgba(255,178,95,0.86)', glow: 'rgba(224,119,47,0.24)', text: '#fff' },
      unknown_time: { status: '#7E807C', border: 'rgba(230,228,220,0.72)', glow: 'rgba(86,88,84,0.12)', text: '#fff' },
      occupied: { status: '#B94438', border: 'rgba(238,137,124,0.72)', glow: 'rgba(185,68,56,0.12)', text: '#fff' },
    };
    const statusRank = {
      occupied: 1,
      unknown_time: 2,
      available_later: 3,
      available_soon: 4,
      available_now: 5,
    };
    let map;
    let markers = [];
    let selectedId = null;
    let mode = '';

    function post(message) {
      RN && RN.postMessage(JSON.stringify(message));
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function destroyMarkers() {
      markers.forEach((marker) => marker.destroy());
      markers = [];
    }

    function yurtHtml(property) {
      const color = colors[property.availabilityStatus];
      const selected = property.id === selectedId ? ' selected' : '';
      return '<div class="marker-shell ' + property.availabilityStatus + selected + '" style="--status:' + color.status + ';--border:' + color.border + ';--glow:' + color.glow + ';--text:' + color.text + '">' +
        '<div class="marker-ring"></div><div class="marker-glow"></div>' +
        '<div class="focus-badge">СМОТРИТЕ</div>' +
        '<div class="yurt"><div class="roof"><span class="rib r1"></span><span class="rib r2"></span><span class="rib r3"></span><span class="rib r4"></span></div><div class="wall"><div class="door"></div></div></div>' +
        '<div class="price">' + escapeHtml(property.markerLabel) + '</div>' +
        '<div class="time">' + escapeHtml(property.markerTimeLabel) + '</div>' +
      '</div>';
    }

    function clusterHtml(cluster) {
      const speed = Math.max(620, 1650 - cluster.nowCount * 190);
      const alpha = Math.min(0.88, 0.28 + cluster.nowCount * 0.14);
      const liveClass = cluster.nowCount > 0 ? 'has-live' : 'no-live';
      const liveText = cluster.nowCount > 0 ? cluster.nowCount + ' свободно сейчас' : 'нет свободных сейчас';
      const isCountry = cluster.kind === 'country';
      const isCity = cluster.kind === 'city';
      const width = isCountry ? 178 : isCity ? 154 : 132;
      const height = isCountry ? 126 : isCity ? 112 : 96;
      const ring = isCountry ? 132 : isCity ? 116 : 96;
      const countSize = isCountry ? 32 : isCity ? 27 : 22;
      const countLine = isCountry ? 34 : isCity ? 29 : 24;
      return '<div class="cluster-shell ' + liveClass + '" style="--cluster-speed:' + speed + 'ms;--cluster-alpha:' + alpha + ';--cluster-width:' + width + 'px;--cluster-height:' + height + 'px;--ring-size:' + ring + 'px;--count-size:' + countSize + 'px;--count-line:' + countLine + 'px">' +
        '<div class="cluster-ring"></div><div class="cluster-card">' +
        '<div><span class="cluster-count">' + cluster.properties.length + '</span><span class="cluster-unit">объектов</span></div>' +
        '<div class="cluster-district">' + escapeHtml(cluster.label) + '</div>' +
        '<div class="cluster-price">от ' + new Intl.NumberFormat('ru-KZ').format(cluster.minPrice) + ' ₸/ч</div>' +
        '<div class="cluster-live">' + escapeHtml(liveText) + '</div>' +
      '</div></div>';
    }

    function addHtmlMarker(coordinates, html, anchor, zIndex, onClick) {
      const marker = new mapgl.HtmlMarker(map, {
        coordinates,
        html,
        anchor,
        zIndex,
      });
      marker.getContent().addEventListener('click', (event) => {
        event.stopPropagation();
        onClick();
      });
      markers.push(marker);
    }

    function renderUserLocation() {
      if (!payload.userLocation) {
        return;
      }

      addHtmlMarker(
        payload.userLocation,
        '<div class="user-location"></div>',
        [17, 17],
        120,
        () => {}
      );
    }

    function getAvailabilityPriority(property) {
      if (property.availabilityStatus === 'available_now') {
        return 0;
      }
      if (property.availabilityStatus === 'available_soon') {
        return 1;
      }
      if (property.availabilityStatus === 'available_later') {
        return 2;
      }
      if (property.availabilityStatus === 'unknown_time') {
        return 3;
      }
      return 4;
    }

    function getReadyMinutes(property) {
      if (property.availabilityStatus === 'available_now') {
        return 0;
      }
      if (typeof property.availableInMinutes === 'number') {
        return property.availableInMinutes;
      }
      if (property.availabilityStatus === 'unknown_time') {
        return 9998;
      }
      return 9999;
    }

    function getDistanceKm(property) {
      if (!payload.userLocation) {
        return 0;
      }

      const toRad = (value) => value * Math.PI / 180;
      const userLon = payload.userLocation[0];
      const userLat = payload.userLocation[1];
      const earthRadiusKm = 6371;
      const dLat = toRad(property.coordinate.latitude - userLat);
      const dLon = toRad(property.coordinate.longitude - userLon);
      const lat1 = toRad(userLat);
      const lat2 = toRad(property.coordinate.latitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadiusKm * c;
    }

    function getSearchScore(property) {
      const priority = getAvailabilityPriority(property);
      const minutes = getReadyMinutes(property);
      const distanceKm = getDistanceKm(property);
      const priceWeight = property.hourlyPrice / 100;

      if (!payload.userLocation) {
        return priority * 100000 + minutes * 120 + priceWeight;
      }

      if (property.availabilityStatus === 'available_now') {
        return distanceKm * 6 + priceWeight * 1.15;
      }

      if (property.availabilityStatus === 'available_soon') {
        return 500 + minutes * 6 + distanceKm * 6 + priceWeight;
      }

      if (property.availabilityStatus === 'available_later') {
        return 2600 + minutes * 4 + distanceKm * 5 + priceWeight * 0.75;
      }

      if (property.availabilityStatus === 'unknown_time') {
        return 9000 + distanceKm * 3 + priceWeight;
      }

      return 14000 + distanceKm * 2 + priceWeight;
    }

    function getBestClusterProperty(cluster) {
      return cluster.properties
        .slice()
        .sort((left, right) => {
          const scoreDiff = getSearchScore(left) - getSearchScore(right);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return getReadyMinutes(left) - getReadyMinutes(right);
        })[0];
    }

    function getDisplayMode() {
      const zoom = map.getZoom();
      if (zoom < payload.countryClusterZoom) {
        return 'countryCluster';
      }
      if (zoom < payload.cityClusterZoom) {
        return 'cityClusters';
      }
      if (zoom < payload.districtClusterZoom) {
        return 'districtClusters';
      }
      return 'properties';
    }

    function renderMarkers(force) {
      const zoom = map.getZoom();
      const nextMode = getDisplayMode();

      if (!force && mode === nextMode) {
        post({ type: 'mapState', zoom, mode });
        return;
      }

      mode = nextMode;
      destroyMarkers();

      if (mode === 'countryCluster' || mode === 'cityClusters' || mode === 'districtClusters') {
        const activeClusters =
          mode === 'countryCluster'
            ? payload.countryCluster
            : mode === 'cityClusters'
              ? payload.cityClusters
              : payload.districtClusters;
        activeClusters.forEach((cluster) => {
          const anchor = cluster.kind === 'country' ? [89, 63] : cluster.kind === 'city' ? [77, 56] : [66, 48];
          addHtmlMarker(
            [cluster.center.longitude, cluster.center.latitude],
            clusterHtml(cluster),
            anchor,
            cluster.kind === 'country' ? 16 : cluster.kind === 'city' ? 18 : 22,
            () => {
              const targetProperty = getBestClusterProperty(cluster);
              const targetCoordinates = targetProperty
                ? [targetProperty.coordinate.longitude, targetProperty.coordinate.latitude]
                : [cluster.center.longitude, cluster.center.latitude];
              const nextZoom = targetProperty ? 16.35 : cluster.kind === 'country' ? 7.4 : cluster.kind === 'city' ? 12.4 : 16.35;
              selectedId = targetProperty ? targetProperty.id : null;
              map.setCenter(targetCoordinates);
              map.setZoom(nextZoom);
              post({ type: 'selectProperty', propertyId: selectedId });
              setTimeout(() => renderMarkers(true), 80);
            }
          );
        });
      } else {
        payload.properties
          .slice()
          .sort((left, right) => statusRank[left.availabilityStatus] - statusRank[right.availabilityStatus])
          .forEach((property) => {
            addHtmlMarker(
              [property.coordinate.longitude, property.coordinate.latitude],
              yurtHtml(property),
              [39, 44],
              statusRank[property.availabilityStatus] + (property.id === selectedId ? 100 : 0),
              () => {
                selectedId = property.id;
                post({ type: 'selectProperty', propertyId: property.id });
                renderMarkers(true);
              }
            );
          });
      }

      renderUserLocation();
      post({ type: 'mapState', zoom, mode });
    }

    function init() {
      if (!payload.apiKey) {
        document.body.innerHTML = '<div class="missing-key"><div class="missing-key-card"><div class="missing-key-title">Нужен ключ 2GIS</div><div class="missing-key-text">Добавьте EXPO_PUBLIC_2GIS_API_KEY в env и перезапустите Expo. После этого здесь будет настоящая карта 2GIS с приближением до домов.</div></div></div>';
        return;
      }

      map = new mapgl.Map('map', {
        center: payload.initialCenter,
        key: payload.apiKey,
        pitch: 0,
        rotation: 0,
        zoom: payload.initialZoom,
      });

      selectedId = payload.focusPropertyId;

      map.on('click', () => {
        if (selectedId) {
          selectedId = null;
          renderMarkers(true);
        }

        post({ type: 'selectProperty', propertyId: null });
      });
      map.on('moveend', () => renderMarkers(false));
      map.on('zoomend', () => renderMarkers(false));

      window.uigoZoomIn = () => {
        map.setZoom(Math.min(19, map.getZoom() + 1));
        setTimeout(() => renderMarkers(false), 80);
      };
      window.uigoZoomOut = () => {
        map.setZoom(Math.max(4, map.getZoom() - 1));
        setTimeout(() => renderMarkers(false), 80);
      };
      window.uigoClearSelection = () => {
        selectedId = null;
        renderMarkers(true);
      };
      window.uigoFocusProperty = (propertyId) => {
        const property = payload.properties.find((item) => item.id === propertyId);
        if (!property) {
          return;
        }

        selectedId = property.id;
        map.setCenter([property.coordinate.longitude, property.coordinate.latitude]);
        map.setZoom(16.35);
        post({ type: 'selectProperty', propertyId: property.id });
        setTimeout(() => renderMarkers(true), 80);
      };
      window.uigoPreviewProperty = (propertyId) => {
        const property = payload.properties.find((item) => item.id === propertyId);
        if (!property) {
          return;
        }

        map.setCenter([property.coordinate.longitude, property.coordinate.latitude]);
        map.setZoom(Math.max(map.getZoom(), 13.6));
        setTimeout(() => renderMarkers(false), 120);
      };

      renderMarkers(true);
      if (selectedId) {
        post({ type: 'selectProperty', propertyId: selectedId });
      }
    }

    if (window.mapgl) {
      init();
    } else {
      window.addEventListener('load', init);
    }
  </script>
</body>
</html>`;
}

export default function RadarScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const params = useLocalSearchParams<{ propertyId?: string | string[] }>();
  const webViewRef = useRef<WebView | null>(null);
  const radarInputRef = useRef<TextInput | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [query, setQuery] = useState("");
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [previewedPropertyId, setPreviewedPropertyId] = useState<string | null>(null);
  const initialPropertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId;
  const cityClusters = useMemo(() => getCityClusters(mockProperties), []);
  const districtClusters = useMemo(() => getDistrictClusters(mockProperties), []);
  const html = useMemo(
    () =>
      buildTwoGisHtml(
        mockProperties,
        cityClusters,
        districtClusters,
        initialPropertyId,
        userLocation,
      ),
    [cityClusters, districtClusters, initialPropertyId, userLocation],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(initialPropertyId ? 16.35 : 5.8);
  const searchResults = useMemo(
    () => getSearchResults(mockProperties, query, userLocation),
    [query, userLocation],
  );
  const selectedProperty =
    mockProperties.find((property) => property.id === selectedId) ?? null;
  const hasQuery = normalizeSearch(query).length > 0;
  const showRadarPanel = isRadarOpen || Boolean(selectedProperty);
  const showSelectedProperty = Boolean(selectedProperty) && !hasQuery;
  const showSearchResults = !showSelectedProperty;
  const visibleSearchResults = searchResults.slice(0, 18);
  const radarExpandedHeight = Math.min(430, Math.round(windowHeight * 0.54));
  const radarAnimatedStyle = useAnimatedStyle(() => ({
    height: withTiming(
      showRadarPanel ? (showSelectedProperty ? 232 : radarExpandedHeight) : 64,
      { duration: 260 },
    ),
    transform: [
      {
        scale: withTiming(isInputFocused ? 1.01 : 1, { duration: 180 }),
      },
    ],
  }));
  const radarContentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showRadarPanel ? 1 : 0, { duration: 180 }),
    transform: [
      {
        translateY: withTiming(showRadarPanel ? 0 : -8, { duration: 220 }),
      },
    ],
  }));

  useEffect(() => {
    let isMounted = true;

    async function loadUserLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!isMounted) {
        return;
      }

      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }

    void loadUserLocation().catch(() => {
      // Location is an optimization for ranking. The radar still works without it.
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showRadarPanel || showSelectedProperty) {
      return;
    }

    const [bestProperty] = searchResults;

    if (!bestProperty || bestProperty.id === previewedPropertyId) {
      return;
    }

    const previewTimer = setTimeout(() => {
      setPreviewedPropertyId(bestProperty.id);
      inject(
        `window.uigoPreviewProperty && window.uigoPreviewProperty(${JSON.stringify(bestProperty.id)})`,
      );
    }, 360);

    return () => clearTimeout(previewTimer);
  }, [previewedPropertyId, searchResults, showRadarPanel, showSelectedProperty]);

  function inject(script: string) {
    webViewRef.current?.injectJavaScript(`${script}; true;`);
  }

  function activateRadarSearch(shouldFocusInput = false) {
    setSelectedId(null);
    setPreviewedPropertyId(null);
    setIsRadarOpen(true);
    inject("window.uigoClearSelection && window.uigoClearSelection()");

    if (shouldFocusInput) {
      setTimeout(() => radarInputRef.current?.focus(), 80);
    }
  }

  function openRadarPanel() {
    void Haptics.selectionAsync();
    activateRadarSearch(true);
  }

  function handleRadarInputFocus() {
    setIsInputFocused(true);

    if (selectedId) {
      activateRadarSearch(false);
    }
  }

  function closeRadarPanel() {
    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsRadarOpen(false);
  }

  function focusProperty(property: MockProperty) {
    void Haptics.selectionAsync();
    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsRadarOpen(false);
    setSelectedId(property.id);
    setQuery("");
    inject(`window.uigoFocusProperty && window.uigoFocusProperty(${JSON.stringify(property.id)})`);
  }

  function focusBestResult() {
    const [bestProperty] = searchResults;

    if (!bestProperty) {
      return;
    }

    focusProperty(bestProperty);
  }

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as WebMessage;

      if (message.type === "selectProperty") {
        Keyboard.dismiss();
        setIsInputFocused(false);
        setIsRadarOpen(false);
        setQuery("");
        setSelectedId(message.propertyId);
      }

      if (message.type === "mapState") {
        setZoom(message.zoom);
      }
    } catch {
      // Ignore malformed messages from the WebView.
    }
  }

  return (
    <View style={styles.screen}>
      <WebView
        allowsInlineMediaPlayback
        javaScriptEnabled
        mixedContentMode="compatibility"
        onMessage={handleMessage}
        originWhitelist={["*"]}
        ref={webViewRef}
        source={{ html }}
        style={styles.webMap}
        webviewDebuggingEnabled
      />

      <View
        style={[
          styles.topControls,
          {
            paddingTop: Math.max(insets.top, 12),
          },
        ]}
      >
        <Animated.View style={[styles.radarControl, radarAnimatedStyle]}>
          <Pressable
            accessibilityLabel="UiGo Радар"
            onPress={openRadarPanel}
            style={styles.radarTopRow}
          >
            <View style={styles.radarIcon}>
              <Feather color="#171512" name="radio" size={19} />
            </View>
            {showRadarPanel ? (
              <TextInput
                autoCorrect={false}
                clearButtonMode="never"
                onBlur={() => setIsInputFocused(false)}
                onChangeText={(value) => {
                  setQuery(value);
                  if (selectedId) {
                    activateRadarSearch(false);
                  } else {
                    setIsRadarOpen(true);
                  }
                  setPreviewedPropertyId(null);
                }}
                onFocus={handleRadarInputFocus}
                onSubmitEditing={focusBestResult}
                placeholder="Город, район, цена или тип"
                placeholderTextColor="rgba(23,21,18,0.52)"
                ref={radarInputRef}
                returnKeyType="search"
                style={styles.radarInput}
                value={query}
              />
            ) : (
              <View style={styles.radarCollapsedText}>
                <Text style={styles.radarTitle}>UiGo Радар</Text>
                <Text style={styles.radarSubtitle}>Рядом, город, район или цена</Text>
              </View>
            )}
            {showRadarPanel ? (
              <Pressable
                accessibilityLabel={query.length > 0 ? "Очистить поиск" : "Свернуть радар"}
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  void Haptics.selectionAsync();

                  if (query.length > 0) {
                    setQuery("");
                    setSelectedId(null);
                    setPreviewedPropertyId(null);
                    inject("window.uigoClearSelection && window.uigoClearSelection()");
                    radarInputRef.current?.focus();
                    return;
                  }

                  closeRadarPanel();
                }}
                style={styles.radarActionButton}
              >
                <Feather color="#171512" name={query.length > 0 ? "x" : "chevron-up"} size={18} />
              </Pressable>
            ) : (
              <View style={styles.radarActionButton}>
                <Feather color="#171512" name="chevron-down" size={18} />
              </View>
            )}
          </Pressable>

          {showRadarPanel ? (
            <Animated.View style={[styles.radarExpandedContent, radarContentAnimatedStyle]}>
              {showSelectedProperty && selectedProperty ? (
                <Pressable
                  accessibilityLabel="Открыть объект"
                  onPress={() => {
                    router.push(`/property/${selectedProperty.id}` as never);
                  }}
                  style={styles.selectedRadarCard}
                >
                  <Image
                    resizeMode="cover"
                    source={{ uri: getCover(selectedProperty).url }}
                    style={styles.selectedRadarImage}
                  />
                  <View style={styles.selectedRadarMeta}>
                    <View style={styles.selectedRadarTopLine}>
                      <Text style={styles.selectedRadarEyebrow}>
                        {propertyTypeLabels[selectedProperty.type]} · {selectedProperty.district}
                      </Text>
                      <View
                        style={[
                          styles.resultStatusDot,
                          {
                            backgroundColor:
                              availabilityColors[selectedProperty.availabilityStatus].background,
                          },
                        ]}
                      />
                    </View>
                    <Text numberOfLines={1} style={styles.selectedRadarTitle}>
                      {selectedProperty.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.selectedRadarDescription}>
                      {selectedProperty.city}, {selectedProperty.address}
                    </Text>
                    <View style={styles.selectedRadarBottomRow}>
                      <Text style={styles.selectedRadarPrice}>
                        {formatTenge(selectedProperty.hourlyPrice)} ₸ / час
                      </Text>
                      <Text style={styles.selectedRadarStatus}>
                        {getAvailabilityText(selectedProperty)}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    accessibilityLabel="Закрыть объект"
                    hitSlop={8}
                    onPress={(event) => {
                      event.stopPropagation();
                      void Haptics.selectionAsync();
                      setSelectedId(null);
                      inject("window.uigoClearSelection && window.uigoClearSelection()");
                    }}
                    style={styles.selectedRadarClose}
                  >
                    <Feather color="#FFF7EB" name="x" size={17} />
                  </Pressable>
                </Pressable>
              ) : null}

              {showSearchResults ? (
                <>
                  <ScrollView
                    contentContainerStyle={styles.resultList}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={styles.radarResultScroll}
                  >
                    {visibleSearchResults.length > 0 ? (
                      visibleSearchResults.map((property) => (
                        <Pressable
                          key={property.id}
                          onPress={() => focusProperty(property)}
                          style={styles.resultRow}
                        >
                          <Image
                            resizeMode="cover"
                            source={{ uri: getCover(property).url }}
                            style={styles.resultImage}
                          />
                          <View style={styles.resultMeta}>
                            <View style={styles.resultTopLine}>
                              <View
                                style={[
                                  styles.resultStatusDot,
                                  {
                                    backgroundColor:
                                      availabilityColors[property.availabilityStatus].background,
                                  },
                                ]}
                              />
                              <Text numberOfLines={1} style={styles.resultStatus}>
                                {getAvailabilityText(property)}
                              </Text>
                            </View>
                            <Text numberOfLines={1} style={styles.resultTitle}>
                              {propertyTypeLabels[property.type]} · {property.district}
                            </Text>
                            <Text numberOfLines={1} style={styles.resultAddress}>
                              {property.city}, {property.address}
                            </Text>
                            <View style={styles.resultPriceRow}>
                              <Text style={styles.resultPrice}>
                                {formatTenge(property.hourlyPrice)} ₸ / час
                              </Text>
                              <Text style={styles.resultDaily}>
                                {formatTenge(property.dailyPrice)} ₸ / сутки
                              </Text>
                            </View>
                          </View>
                          <Feather color="rgba(255,247,235,0.56)" name="chevron-right" size={18} />
                        </Pressable>
                      ))
                    ) : (
                      <View style={styles.emptyResults}>
                        <Text style={styles.emptyTitle}>Ничего не найдено</Text>
                        <Text style={styles.emptyText}>
                          Попробуйте город, район, цену или тип жилья: Балхаш, Караганда, 6000
                          или номер.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </>
              ) : null}
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>

      <Pressable
        accessibilityLabel="Назад"
        onPress={() => {
          void Haptics.selectionAsync();
          router.back();
        }}
        style={[
          styles.backButton,
          {
            top: Math.max(insets.top, 12) + 82,
          },
        ]}
      >
        <Feather color="#171512" name="chevron-left" size={24} />
      </Pressable>

      {!showRadarPanel ? (
        <View style={styles.zoomControls}>
          <Pressable
            accessibilityLabel="Увеличить масштаб"
            onPress={() => {
              void Haptics.selectionAsync();
              inject("window.uigoZoomIn && window.uigoZoomIn()");
            }}
            style={styles.zoomButton}
          >
            <Feather color="#171512" name="plus" size={20} />
          </Pressable>
          <Pressable
            accessibilityLabel="Уменьшить масштаб"
            onPress={() => {
              void Haptics.selectionAsync();
              inject("window.uigoZoomOut && window.uigoZoomOut()");
            }}
            style={styles.zoomButton}
          >
            <Feather color="#171512" name="minus" size={20} />
          </Pressable>
        </View>
      ) : null}

      {zoom < DISTRICT_CLUSTER_ZOOM && !showRadarPanel ? (
        <View style={[styles.hintWrap, { bottom: Math.max(insets.bottom, 14) + 8 }]}>
          <Text style={styles.hintText}>Нажмите район или приблизьте карту до домов</Text>
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8E1D6",
  },
  webMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8E1D6",
  },
  topControls: {
    position: "absolute",
    left: 16,
    right: 16,
    elevation: 30,
    zIndex: 30,
  },
  radarControl: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "transparent",
  },
  radarTopRow: {
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.52)",
    borderColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    shadowColor: "#17120F",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  radarIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(23,21,18,0.08)",
    borderColor: "rgba(23,21,18,0.08)",
    borderWidth: 1,
    shadowColor: "#241B12",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  radarCollapsedText: {
    flex: 1,
  },
  radarTitle: {
    color: "#171512",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  radarSubtitle: {
    color: "rgba(23,21,18,0.62)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  radarInput: {
    color: "#171512",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
    minHeight: 48,
    paddingVertical: 0,
  },
  radarActionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(23,21,18,0.08)",
    borderColor: "rgba(23,21,18,0.1)",
    borderWidth: 1,
  },
  radarExpandedContent: {
    flex: 1,
    paddingBottom: 4,
    paddingTop: 10,
  },
  radarResultScroll: {
    flex: 1,
  },
  selectedRadarCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 14,
    marginTop: 6,
    minHeight: 144,
    borderRadius: 30,
    backgroundColor: "rgba(10, 9, 8, 0.66)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    padding: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.24,
    shadowRadius: 30,
  },
  selectedRadarImage: {
    width: 86,
    height: 120,
    borderRadius: 22,
    backgroundColor: "#BFAF9A",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
  },
  selectedRadarMeta: {
    flex: 1,
    paddingRight: 34,
  },
  selectedRadarTopLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  selectedRadarEyebrow: {
    color: "rgba(255,247,235,0.64)",
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  selectedRadarTitle: {
    color: "#FFF7EB",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 5,
  },
  selectedRadarDescription: {
    color: "rgba(255,247,235,0.58)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 4,
  },
  selectedRadarBottomRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 9,
  },
  selectedRadarPrice: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  selectedRadarStatus: {
    color: "rgba(181,255,219,0.9)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  selectedRadarClose: {
    position: "absolute",
    top: 12,
    right: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
  },
  zoomControls: {
    position: "absolute",
    right: 16,
    top: 128,
    gap: 10,
    elevation: 28,
    zIndex: 28,
  },
  zoomButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    shadowColor: "#2B2118",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  backButton: {
    position: "absolute",
    left: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    elevation: 29,
    shadowColor: "#2B2118",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    zIndex: 29,
  },
  hintWrap: {
    position: "absolute",
    alignSelf: "center",
    elevation: 18,
    zIndex: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  hintText: {
    color: "#4A433A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  resultList: {
    gap: 10,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  resultRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 92,
    borderRadius: 30,
    backgroundColor: "rgba(10, 9, 8, 0.66)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    padding: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.24,
    shadowRadius: 30,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#BFAF9A",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
  },
  resultMeta: {
    flex: 1,
  },
  resultTopLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  resultStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultStatus: {
    color: "rgba(255,247,235,0.78)",
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  resultTitle: {
    color: "#FFF7EB",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 5,
  },
  resultAddress: {
    color: "rgba(255,247,235,0.58)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginTop: 3,
  },
  resultPriceRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 7,
  },
  resultPrice: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  resultDaily: {
    color: "rgba(255,247,235,0.68)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
  },
  emptyResults: {
    alignItems: "center",
    minHeight: 170,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  emptyTitle: {
    color: "#FFF7EB",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  emptyText: {
    color: "rgba(255,247,235,0.62)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
});
