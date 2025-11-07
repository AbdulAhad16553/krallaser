"use client";

import ProductDescription from './ProductDescription';

export default function DescriptionDemo() {
  const sampleDescription = `
    <div>
      <p>A high-efficiency laser cutting solution featuring a dual-table design for continuous operation. The exchangeable tables enable seamless material loading and unloading, significantly boosting productivity for industrial applications.</p>
      <p>Key Features</p>
      <ol>
        <li>High-precision laser cutting with excellent accuracy</li>
        <li>Suitable for metals and plastics processing</li>
        <li>Industrial and commercial applications</li>
        <li>Minimal maintenance requirements</li>
      </ol>
      <p><strong>Positioning Accuracy:</strong> ±0.05mm</p>
      <p><strong>Repeat Positioning Accuracy:</strong> ±0.03mm</p>
      <p><strong>Maximum Air Speed:</strong> 120m/min</p>
      <p><strong>Maximum Acceleration:</strong> 1.5G</p>
      <p><strong>Laser Power:</strong> 1500w - 30000w</p>
    </div>
  `;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Product Description Demo</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ProductDescription description={sampleDescription} />
      </div>
    </div>
  );
}
