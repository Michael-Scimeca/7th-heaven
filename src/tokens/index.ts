/**
 * 7th Heaven Design System - Token Registry Barrel Export
 */

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./effects";

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { effects } from "./effects";

export const tokens = {
  colors,
  typography,
  spacing,
  effects,
} as const;

export default tokens;
