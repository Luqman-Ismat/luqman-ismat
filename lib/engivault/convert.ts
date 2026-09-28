import {
  convertTemperature,
  convertUnit,
  unitCategories,
} from "./unit-converter-data";
export function convertQuantity(
  categoryId: string,
  value: number,
  from: number,
  to: number,
) {
  const category = unitCategories.find((c) => c.id === categoryId);
  if (
    !category ||
    !category.units[from] ||
    !category.units[to] ||
    !Number.isFinite(value)
  )
    throw new Error("Choose valid units and enter a finite value.");
  if (categoryId === "temperature") {
    const kelvin = category.units.find((u) => u.id === "kelvin")!;
    if (convertTemperature(value, category.units[from], kelvin) < -1e-10)
      throw new Error("Absolute temperature cannot be below zero kelvin.");
    return convertTemperature(value, category.units[from], category.units[to]);
  }
  return convertUnit(value, category.units[from], category.units[to]);
}
