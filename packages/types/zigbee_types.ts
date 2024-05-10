// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Feature } from "./zigbee_features";

export interface Device {
  [index: string]: any;
  ieee_address: string;
  type: "Coordinator" | "EndDevice" | "GreenPower" | "Router" | "Unknown";
  network_address: number;
  supported: boolean;
  friendly_name: string;
  disabled: boolean;
  description?: string;
  endpoints: Record<number, Data>;
  definition:
    | {
        model: string;
        vendor: string;
        description: string;
        supports_ota: boolean;
        options: []; // TODO
        exposes: Exposes[];
        icon: string;
      }
    | null
    | undefined;
  power_source?: string;
  date_code?: string;
  model_id?: string;
  scenes: Scene[];
  interviewing: boolean;
  interviewing_completed: boolean;
  software_build_id?: string;
}

interface BaseScene {
  id: number;
  name: string;
}

interface SceneFields {
  transition: number;
  state: "ON" | "OFF";
  brightness: number;
}

type WhiteSpectrum = number;

type RgbHueSat = {
  hue: number;
  saturation: number;
};

type RgbXY = {
  x: number;
  y: number;
};

type RgbHex = {
  color: string;
};

type ColorTempContainer = { color_temp: WhiteSpectrum; color: never };
type ColorContainer = { color: RgbHueSat | RgbXY | RgbHex; color_temp: never };

export type Scene = BaseScene &
  Partial<SceneFields & (ColorTempContainer | ColorContainer)>;

interface Data {
  bindings: {
    cluster: string;
    target: {
      type: string;
      endpoint?: number;
      ieee_address?: string;
      id?: number;
    };
  }[];
  configured_reportings: {
    cluster: string;
    attribute: string | number;
    minimum_report_interval: number;
    maximum_report_interval: number;
    reportable_change: number;
  }[];
  clusters: {
    input: string[];
    output: string[];
  };
  scenes: Scene[];
}

interface Exposes {
  features?: Feature[];
  type: string;
}

interface GroupMember {
  ieee_address: string;
  endpoint?: number;
}

export interface Group {
  id: number;
  friendly_name: string;
  scenes: Scene[];
  members: GroupMember[];
}

export interface BridgeResponse {
  status: "ok" | "error";
  error?: string;
  data: any;
}
