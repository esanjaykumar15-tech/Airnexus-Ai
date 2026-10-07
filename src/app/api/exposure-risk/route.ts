import { NextResponse } from "next/server";
import { LOCATIONS, getAllCurrentReadings, aqiCategory } from "@/lib/demoData";

type RiskLevel = "Low" | "Moderate" | "High" | "Very High" | "Critical";

function riskFor(aqi: number, density: number): RiskLevel {
  // Composite score from pollution severity + population density, bounded 0-100
  const aqiScore = Math.min(100, (aqi / 450) * 100);
  const densityScore = Math.min(100, (density / 28000) * 100);
  const composite = aqiScore * 0.7 + densityScore * 0.3;
  if (composite < 25) return "Low";
  if (composite < 45) return "Moderate";
  if (composite < 65) return "High";
  if (composite < 82) return "Very High";
  return "Critical";
}

export async function GET() {
  try {
    const readings = getAllCurrentReadings();
    const zones = LOCATIONS.map((loc) => {
      const reading = readings.find((r) => r.locationId === loc.id)!;
      const risk = riskFor(reading.aqi, loc.populationDensity);
      const estimatedExposedPopulation = Math.round(loc.populationDensity * 12); // rough area proxy, demo only
      return {
        locationId: loc.id,
        locationName: loc.name,
        aqi: reading.aqi,
        aqiCategory: aqiCategory(reading.aqi),
        populationDensity: loc.populationDensity,
        riskLevel: risk,
        estimatedExposedPopulation,
      };
    });

    const totalExposed = zones.reduce((sum, z) => sum + z.estimatedExposedPopulation, 0);
    const highExposureAreas = zones.filter((z) => z.riskLevel === "High" || z.riskLevel === "Very High").length;
    const criticalZones = zones.filter((z) => z.riskLevel === "Critical").length;

    return NextResponse.json({
      zones,
      summary: {
        totalEstimatedExposedPopulation: totalExposed,
        highExposureAreas,
        criticalExposureZones: criticalZones,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to compute exposure risk", detail: err.message }, { status: 500 });
  }
}
