export const UST_COLORS = {
  navy: "#003366",
  gold: "#C4972F",
  white: "#FFFFFF",
  lightGray: "#F5F5F5",
  darkGray: "#333333",
} as const;

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const IDLE_RESET_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_IMAGE_DIMENSION = 2048; // max pixel on longest edge
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
