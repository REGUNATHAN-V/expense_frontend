import { Dimensions, PixelRatio } from "react-native";

const BASE_W = 375;
const BASE_H = 812;
const MAX_FACTOR = 1.35;
const MIN_FACTOR = 0.85; 

const { width, height } = Dimensions.get("window");
const short = Math.min(width, height);
const long = Math.max(width, height);

const clamp = (v) => Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, v));
const hFactor = clamp(short / BASE_W);
const vFactor = clamp(long / BASE_H);
const round = (n) => PixelRatio.roundToNearestPixel(n);

export const s = (n) => round(n * hFactor);
export const vs = (n) => round(n * vFactor);
export const ms = (n, factor = 0.5) => round(n + (n * hFactor - n) * factor);
export const fs = (n) => round(n + (n * hFactor - n) * 0.4);

export const isTablet = short >= 600;
export const screen = { width, height };
