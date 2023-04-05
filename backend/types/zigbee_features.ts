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
  type: string;
  property?: string;
}

interface FeaturePreset {
  description: string;
  name: string;
  value: number; // check this
}

/**
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
  values: any[];
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
  features: Exposes[];
}

/**
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
  features: Feature[]; // TODO
}
