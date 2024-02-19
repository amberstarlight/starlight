// SPDX-License-Identifier: AGPL-3.0-or-later

import { Feature } from "./zigbee_features";

export interface Device {
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

interface Scene {
  id: number;
  name: string;
}

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
