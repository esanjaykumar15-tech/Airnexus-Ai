import { NextResponse } from "next/server";

// These are illustrative sample metrics for a baseline demonstration model,
// NOT results from an actually-trained model on real historical data.
// Replace this route's response with real evaluation output once a model
// is trained on real data (see README > ML Pipeline).
export async function GET() {
  return NextResponse.json({
    disclaimer: "Sample/demo metrics — not generated from a trained model on real data.",
    models: [
      { name: "Baseline (trend + diurnal)", mae: 22.1, rmse: 31.4, r2: 0.81 },
      { name: "XGBoost (sample)", mae: 18.4, rmse: 27.2, r2: 0.89 },
      { name: "LSTM (sample)", mae: 16.8, rmse: 24.9, r2: 0.92 },
    ],
  });
}
