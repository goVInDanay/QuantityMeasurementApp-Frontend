export interface User {
  name: string;
  email: string;
}

export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface CompareRequest {
  thisQuantity: QuantityDTO;
  thatQuantity: QuantityDTO;
}

export interface HistoryItem {
  input: string;
  result: string;
  error: boolean;
  errorMessage: string;
}

export type MeasurementType =
  | "LengthUnit"
  | "VolumeUnit"
  | "WeightUnit"
  | "TemperatureUnit"
  | "";

export type ResultState =
  | { status: "idle" }
  | { status: "success"; text: string }
  | { status: "error"; text: string };
