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

const TYPE_OPTIONS: { value: MeasurementType; icon: string; label: string }[] =
  [
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

  const runConvert = useCallback(async () => {
    if (!measurementType || !unit1 || !unit2) return;
    const v = parseFloat(value1);
    if (isNaN(v) || value1 === "") {
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

  useEffect(() => {
    if (value1 !== "") runConvert();
  }, [unit1, unit2, runConvert]);

  function handleValue1Change(v: string) {
    setValue1(v);
    if (v === "") setResult({ status: "idle" });
  }

  function swapUnits() {
    setUnit1(unit2);
    setUnit2(unit1);
    setValue1(value2);
    setValue2(value1);
  }

  function guardArithmetic(op: string): boolean {
    if (isArithmeticBlocked) {
      setResult({
        status: "error",
        text: `${op} is not allowed for Temperature units`,
      });
      return false;
    }
    return true;
  }

  async function handleAdd() {
    if (!guardArithmetic("Add")) return;
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
        text: `Result: ${data.value} ${data.unit}`,
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleSubtract() {
    if (!guardArithmetic("Subtract")) return;
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
        text: `Result: ${data.value} ${data.unit}`,
      });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleDivide() {
    if (!guardArithmetic("Divide")) return;
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
      setResult({ status: "success", text: `Result: ${data}` });
    } catch {
      setResult({ status: "error", text: "Server error" });
    }
  }

  async function handleCompare() {
    if (!value1 || isNaN(parseFloat(value1))) {
      setResult({ status: "error", text: "Enter a valid number" });
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
    await fn();
    onHistoryUpdate([]);
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
    <div className="card calc-card">
      <div className="card-header">
        <div className="card-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
            <line x1="8" y1="18" x2="10" y2="18" />
          </svg>
        </div>
        <span className="card-title">Quantity Calculator</span>
      </div>

      <div className="card-body">
        <div className="type-grid">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              className={`type-btn${measurementType === t.value ? " active" : ""}`}
              onClick={() => setMeasurementType(t.value)}
            >
              <span className="type-icon">{t.icon}</span>
              <span className="type-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="converter">
          <div className="conv-side">
            <span className="conv-label">From</span>
            <div className="input-group">
              <input
                type="number"
                placeholder="0"
                value={value1}
                onChange={(e) => handleValue1Change(e.target.value)}
                onBlur={runConvert}
              />
              <select
                className="unit-select"
                value={unit1}
                onChange={(e) => setUnit1(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button className="swap-btn" title="Swap units" onClick={swapUnits}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          <div className="conv-side">
            <span className="conv-label">To</span>
            <div className="input-group">
              <input type="number" placeholder="—" value={value2} disabled />
              <select
                className="unit-select"
                value={unit2}
                onChange={(e) => setUnit2(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isArithmeticBlocked && (
          <div className="temp-warning">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              Add, Subtract and Divide are not available for Temperature — only
              Convert and Compare are supported.
            </span>
          </div>
        )}

        <div className={bannerClass}>
          <span className={textClass}>
            {result.status === "idle"
              ? "Select a type and enter a value to begin"
              : result.text}
          </span>
        </div>

        <div className="actions">
          <button
            className="btn-action btn-add"
            disabled={isArithmeticBlocked}
            title={
              isArithmeticBlocked ? "Add is not supported for Temperature" : ""
            }
            onClick={() => withHistoryRefresh(handleAdd)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>

          <button
            className="btn-action btn-subtract"
            disabled={isArithmeticBlocked}
            title={
              isArithmeticBlocked
                ? "Subtract is not supported for Temperature"
                : ""
            }
            onClick={() => withHistoryRefresh(handleSubtract)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Subtract
          </button>

          <button
            className="btn-action btn-convert"
            onClick={() => withHistoryRefresh(runConvert)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.62" />
            </svg>
            Convert
          </button>

          <button
            className="btn-action btn-divide"
            disabled={isArithmeticBlocked}
            title={
              isArithmeticBlocked
                ? "Divide is not supported for Temperature"
                : ""
            }
            onClick={() => withHistoryRefresh(handleDivide)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <circle
                cx="12"
                cy="5"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="12"
                cy="19"
                r="1.5"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            Divide
          </button>

          <button
            className="btn-action btn-compare"
            onClick={() => withHistoryRefresh(handleCompare)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
