// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface Device {
  [index: string]: unknown;
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
  data: unknown;
}

export type Feature =
  | BinaryFeature
  | EnumFeature
  | NumericFeature
  | CompositeFeature
  | ListFeature
  | TextFeature
  | LockStateEnumFeature
  | LockFeature
  | FanFeature
  | CoverFeature
  | SwitchFeature
  | ClimateFeature;

interface BaseFeature {
  access?: 1 | 2 | 5 | 7;
  description?: string;
  name: string;
  label: string;
  type: string;
  property?: string;
}

/*
  Access bitmask

  Bit 1: the property is published in state
  Bit 2: the property can be set
  Bit 3: the property can be retrieved (and the state is published)
*/

interface FeaturePreset {
  description: string;
  name: string;
  value: number; // check this
}

/*
 * Generic Features
 */

interface BinaryFeature extends BaseFeature {
  type: "binary";
  value_on: string | boolean;
  value_off: string | boolean;
  value_toggle?: string | boolean;
}

interface NumericFeature extends BaseFeature {
  type: "numeric";
  value_max?: number;
  value_min?: number;
  value_step?: number;
  unit?: string;
  presets?: FeaturePreset[];
}

interface EnumFeature extends BaseFeature {
  type: "enum";
  values: unknown[];
}

interface ListFeature extends BaseFeature {
  type: "list";
  length_min?: number;
  length_max?: number;
  item_type: Feature[];
}

interface TextFeature extends BaseFeature {
  type: "text";
  property: string;
}

interface CompositeFeature extends BaseFeature {
  type: "composite";
  property: string;
  features: Feature[];
  category?: "config" | "diagnostic";
}

/*
 * Specific Features
 */

interface LockFeature extends BaseFeature {
  type: "lock";
  features: LockStateEnumFeature[] | BinaryFeature[];
}

interface LockStateEnumFeature extends EnumFeature {
  name: "lock_state";
  property: "lock_state";
  values: string[];
}

interface FanFeature extends BaseFeature {
  type: "fan";
  features: BinaryFeature[] | EnumFeature[];
}

interface CoverFeature extends BaseFeature {
  type: "cover";
  features: BinaryFeature[] | NumericFeature[];
}

interface SwitchFeature extends BaseFeature {
  type: "switch";
  features: BinaryFeature[];
}

interface ClimateFeature extends BaseFeature {
  type: "climate";
  features: Feature[]; // TODO https://www.zigbee2mqtt.io/guide/usage/exposes.html#climate
}
