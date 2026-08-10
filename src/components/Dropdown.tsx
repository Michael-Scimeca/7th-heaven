"use client";

import React from "react";
import GooeyMessagesDropdown, { GooeyMessagesDropdownProps, DropdownOption } from "./GooeyMessagesDropdown";

export type { DropdownOption, GooeyMessagesDropdownProps as DropdownProps };

export function Dropdown(props: GooeyMessagesDropdownProps) {
  return <GooeyMessagesDropdown {...props} />;
}

export default Dropdown;
