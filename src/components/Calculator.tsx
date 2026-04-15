import { useState, useEffect, useCallback } from "react";
import { convertApi, addApi, subtractApi, divideApi, compareApi } from "../api";
import type { MeasurementType, ResultState, HistoryItem } from "../types";

const UNIT_MAP: Record<string, string[]> = {
  LengthUnit: ["FEET", "INCHES", "YARDS", "CENTIMETERS"],
  VolumeUnit: ["LITRE", "MILLILITRE", "GALLON"],
  WeightUnit: ["GRAM", "KILOGRAM", "POUND"],
  TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"],
};

const ARITHMETIC_BLOCKED: MeasurementType[] = ["TemperatureUnit"];

const TYPE_OPTIONS = [
  { value: "LengthUnit", icon: "📏", label: "Length" },
  { value: "VolumeUnit", icon: "🧴", label: "Volume" },
  { value: "WeightUnit", icon: "⚖️", label: "Weight" },
  { value: "TemperatureUnit", icon: "🌡️", label: "Temperature" },
];

interface Props {
  onHistoryUpdate: (items: HistoryItem[]) => void;
}

export default function Calculator({ onHistoryUpdate }: Props) {
  const [measurementType, setMeasurementType] = useState<MeasurementType>("");
  const [units, setUnits] = useState<string[]>([]);
  const [unit1, setUnit1] = useState("");
  const [unit2, setUnit2] = useState("");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const isArithmeticBlocked = ARITHMETIC_BLOCKED.includes(
    measurementType as MeasurementType,
  );

  useEffect(() => {
    if (!measurementType || !UNIT_MAP[measurementType]) {
      setUnits([]);
      setUnit1("");
      setUnit2("");
      return;
    }
    const u = UNIT_MAP[measurementType];
    setUnits(u);
    setUnit1(u[0] ?? "");
    setUnit2(u[1] ?? u[0] ?? "");
  }, [measurementType]);

  function isValid(v: string) {
    return v !== "" && !isNaN(parseFloat(v));
  }

  const runConvert = useCallback(async () => {
    if (!measurementType || !unit1 || !unit2) return;

    const v = parseFloat(value1);

    if (isNaN(v)) {
      setResult({ status: "error", text: "Enter a valid number" });
      return;
    }

    try {
      const data = await convertApi(
        { value: v, unit: unit1, measurementType },
        unit2,
      );

      setResult({
        status: "success",
        text: `${v} ${unit1} = ${data.value} ${data.unit}`,
      });

      setValue2(String(data.value));
    } catch {
      setResult({ status: "error", text: "Conversion failed" });
    }
  }, [measurementType, unit1, unit2, value1]);

  function swapUnits() {
    setUnit1(unit2);
    setUnit2(unit1);
    setValue1(value2);
    setValue2(value1);
  }

  function guardArithmetic(): boolean {
    if (isArithmeticBlocked) {
      setResult({
        status: "success",
        text: `Result: ${value1} ${unit1}`,
      });
      return false;
    }
    return true;
  }

  async function handleAdd() {
    if (!guardArithmetic()) return;

    if (!isValid(value1) || !isValid(value2)) {
      setResult({ status: "error", text: "Enter both values" });
      return;
    }

    try {
      const data = await addApi({
        thisQuantity: {
          value: parseFloat(value1),
          unit: unit1,
          measurementType,
        },
        thatQuantity: {
          value: parseFloat(value2),
          unit: unit2,
          measurementType,
        },
      });

      setResult({
        status: "success",
        text: `Result: ${data} ${unit1}`,
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleSubtract() {
    if (!guardArithmetic()) return;

    if (!isValid(value1) || !isValid(value2)) {
      setResult({ status: "error", text: "Enter both values" });
      return;
    }

    try {
      const data = await subtractApi({
        thisQuantity: {
          value: parseFloat(value1),
          unit: unit1,
          measurementType,
        },
        thatQuantity: {
          value: parseFloat(value2),
          unit: unit2,
          measurementType,
        },
      });

      setResult({
        status: "success",
        text: `Result: ${data} ${unit1}`,
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleDivide() {
    if (!guardArithmetic()) return;

    if (!isValid(value1) || !isValid(value2)) {
      setResult({ status: "error", text: "Enter both values" });
      return;
    }

    if (parseFloat(value2) === 0) {
      setResult({ status: "error", text: "Cannot divide by zero" });
      return;
    }

    try {
      const data = await divideApi({
        thisQuantity: {
          value: parseFloat(value1),
          unit: unit1,
          measurementType,
        },
        thatQuantity: {
          value: parseFloat(value2),
          unit: unit2,
          measurementType,
        },
      });

      setResult({
        status: "success",
        text: `Result: ${data} ${unit1}`,
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleCompare() {
    if (!isValid(value1) || !isValid(value2)) {
      setResult({ status: "error", text: "Enter both values" });
      return;
    }

    try {
      const isEqual = await compareApi({
        thisQuantity: {
          value: parseFloat(value1),
          unit: unit1,
          measurementType,
        },
        thatQuantity: {
          value: parseFloat(value2),
          unit: unit2,
          measurementType,
        },
      });

      setResult({
        status: "success",
        text: isEqual
          ? "Equal — both quantities are the same"
          : "Not equal — the quantities differ",
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function withHistoryRefresh(fn: () => Promise<void>) {
    try {
      await fn();
      onHistoryUpdate([]);
    } catch (err) {
      console.error(err);
    }
  }

  const bannerClass =
    result.status === "success"
      ? "result-banner has-result"
      : result.status === "error"
        ? "result-banner error-result"
        : "result-banner";

  const textClass =
    result.status === "success"
      ? "result-text success"
      : result.status === "error"
        ? "result-text error"
        : "result-text placeholder";

  return (
    <div className="card">
      <div className="card-body">
        {/* TYPE SELECT */}
        <div className="type-grid">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              className={`type-btn ${
                measurementType === t.value ? "active" : ""
              }`}
              onClick={() => setMeasurementType(t.value as MeasurementType)}
            >
              <span className="type-icon">{t.icon}</span>
              <span className="type-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* CONVERTER */}
        <div className="converter">
          <div className="conv-side">
            <span className="conv-label">From</span>
            <div className="input-group">
              <input
                type="number"
                placeholder="Value"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
              />
              <select
                className="unit-select"
                value={unit1}
                onChange={(e) => setUnit1(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="swap-btn" onClick={swapUnits}>
            ⇄
          </button>

          <div className="conv-side">
            <span className="conv-label">To</span>
            <div className="input-group">
              <input
                type="number"
                placeholder="Result"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
              />
              <select
                className="unit-select"
                value={unit2}
                onChange={(e) => setUnit2(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RESULT */}
        <div className={bannerClass}>
          <span className={textClass}>
            {result.status === "idle" ? "Enter values to begin" : result.text}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button
            className="btn-action btn-add"
            onClick={() => withHistoryRefresh(handleAdd)}
          >
            Add
          </button>
          <button
            className="btn-action btn-subtract"
            onClick={() => withHistoryRefresh(handleSubtract)}
          >
            Subtract
          </button>
          <button
            className="btn-action btn-convert"
            onClick={() => withHistoryRefresh(runConvert)}
          >
            Convert
          </button>
          <button
            className="btn-action btn-divide"
            onClick={() => withHistoryRefresh(handleDivide)}
          >
            Divide
          </button>
          <button
            className="btn-action btn-compare"
            onClick={() => withHistoryRefresh(handleCompare)}
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
