import React from "react";
import { BRAND_NAME } from "@/lib/brand";

type LaserLoaderProps = {
  fullScreen?: boolean;
};

export function LaserLoader({ fullScreen = false }: LaserLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${BRAND_NAME}`}
      className={`lcm-loader ${fullScreen ? "lcm-loader--fullscreen" : ""}`}
    >
      <div className="lcm-loader__floor-glow" aria-hidden="true" />

      <div className="lcm-loader__machine-wrap" aria-hidden="true">
        <div className="lcm-cutter">
          <div className="lcm-cutter__hood" />
          <div className="lcm-cutter__shell">
            <div className="lcm-cutter__panel">
              <span className="lcm-cutter__led" />
              <span className="lcm-cutter__screen" />
              <span className="lcm-cutter__knob" />
            </div>

            <div className="lcm-cutter__chamber">
              <div className="lcm-cutter__glass" />

              <div className="lcm-cutter__bed">
                <div className="lcm-cutter__slats" />
                <div className="lcm-cutter__sheet">
                  <div className="lcm-cutter__engrave">
                    <span className="lcm-cutter__engrave-ghost">
                      {BRAND_NAME}
                    </span>
                    <span className="lcm-cutter__engrave-lit">
                      <span className="lcm-cutter__engrave-lit-inner">
                        {BRAND_NAME}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="lcm-cutter__gantry">
                <div className="lcm-cutter__rail" />
                <div className="lcm-cutter__carriage">
                  <div className="lcm-cutter__bridge" />
                  <div className="lcm-cutter__z-axis" />
                  <div className="lcm-cutter__head">
                    <div className="lcm-cutter__fiber" />
                    <div className="lcm-cutter__nozzle" />
                  </div>
                  <div className="lcm-cutter__beam" />
                  <div className="lcm-cutter__beam-core" />
                  <div className="lcm-cutter__pool" />
                  <div className="lcm-cutter__sparks">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div className="lcm-cutter__base" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading {BRAND_NAME}</span>
    </div>
  );
}

/** @deprecated Use LaserLoader */
export const CncBitLoader = LaserLoader;
