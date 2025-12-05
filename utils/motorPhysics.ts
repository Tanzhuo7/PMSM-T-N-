
import { MotorParams, SimulationPoint, SimulationResult } from '../types';

/**
 * Calculates the theoretical maximum speed.
 * 
 * If Flux Weakening is ENABLED:
 * Checks if the motor has infinite speed capability (Imax * Ld >= Psif).
 * If not, calculates the intersection of voltage ellipse and current limit circle at max FW.
 * 
 * If Flux Weakening is DISABLED:
 * Calculates the no-load speed (Back EMF = Vlim).
 */
export const calculateTheoreticalMaxSpeed = (params: MotorParams): number => {
  const { vdc, voltageUtilization, psif, ld, imax, p, enableFluxWeakening } = params;
  
  // Phase Voltage Peak Limit
  const vLim = (vdc / Math.sqrt(3)) * voltageUtilization;
  
  // Case 1: Flux Weakening Disabled
  // The motor is limited by the natural Back EMF reaching the voltage limit.
  // Neglecting resistive drop at no-load (I=0): Vlim = omega * Psif
  if (!enableFluxWeakening) {
    const maxRadS = vLim / psif;
    const maxRPM = (maxRadS * 60) / (2 * Math.PI * p);
    // Round to nearest 100
    return Math.ceil(maxRPM / 100) * 100;
  }

  // Case 2: Flux Weakening Enabled
  // Characteristic current (demagnetization current)
  // The current required to completely nullify the PM flux.
  const ich = psif / ld;
  
  // Infinite Speed Condition:
  // If the inverter can push enough negative Id (-Imax) to completely oppose Psif,
  // the net d-axis flux can be zero. The voltage ellipse center is inside the current limit circle.
  if (imax >= ich) {
    return 20000; // Return a high default value for simulation limit
  }

  // Finite Max Speed Condition:
  // Current limit circle intersects with the voltage ellipse.
  // At max speed (Torque -> 0), Iq -> 0, and we use all current for flux weakening: Id = -Imax.
  // Voltage equation approx (neglecting Rs): Vlim = w * |Lambda_d|
  // Lambda_d = Psif + Ld*Id = Psif - Ld*Imax
  
  const residualFlux = Math.abs(psif - ld * imax);
  
  // Avoid division by zero
  if (residualFlux < 1e-9) return 20000;

  const maxRadS = vLim / residualFlux; // Electrical rad/s
  const maxRPM = (maxRadS * 60) / (2 * Math.PI * p);
  
  // Round up to nearest 100 for clean UI
  return Math.ceil(maxRPM / 100) * 100;
};

/**
 * Calculates the Torque-Speed curve based on PMSM parameters.
 * Implements MTPA (Max Torque Per Ampere) and Flux Weakening control logic approximations.
 */
export const calculateMotorCharacteristics = (params: MotorParams): SimulationResult => {
  const { rs, ld, lq, psif, p, vdc, voltageUtilization, imax, maxSpeed, controlStrategy, enableFluxWeakening } = params;
  
  // Voltage Limit (Phase Peak) with Utilization Factor
  const vLim = (vdc / Math.sqrt(3)) * voltageUtilization;
  
  const points: SimulationPoint[] = [];
  let maxTorque = 0;
  let maxPower = 0;
  let baseSpeed = 0;
  let baseSpeedFound = false;

  // Simulation resolution
  const stepRPM = Math.max(10, Math.ceil(maxSpeed / 100)); 

  // --- Helper: Calculate Torque ---
  const getTorque = (i_mag: number, rad: number) => {
    const i_d = -i_mag * Math.sin(rad);
    const i_q = i_mag * Math.cos(rad);
    return 1.5 * p * (psif * i_q + (ld - lq) * i_d * i_q);
  };

  // --- 1. Determine Constant Torque Region Operating Point ---
  let betaStart = 0;
  let maxT_static = 0;

  if (controlStrategy === 'Id=0') {
    // Force Id = 0 (Beta = 0)
    betaStart = 0;
    maxT_static = getTorque(imax, 0);
  } else {
    // MTPA Strategy
    // Scan for optimal angle
    for (let b = 0; b <= 90; b += 0.5) {
      const rad = (b * Math.PI) / 180;
      const t = getTorque(imax, rad);
      if (t > maxT_static) {
        maxT_static = t;
        betaStart = rad;
      }
    }
  }

  // Define Base Operating Point currents
  const id_base = -imax * Math.sin(betaStart);
  const iq_base = imax * Math.cos(betaStart);
  maxTorque = maxT_static;

  // --- 2. Generate Curve Points ---
  for (let rpm = 0; rpm <= maxSpeed; rpm += stepRPM) {
    const omega = (rpm * 2 * Math.PI / 60) * p; // Electrical rad/s

    let currentId = id_base;
    let currentIq = iq_base;
    let currentBeta = betaStart;

    // Helper: Calculate Voltage Magnitude
    const getVoltageMag = (cId: number, cIq: number) => {
        const vd = rs * cId - omega * lq * cIq;
        const vq = rs * cIq + omega * (ld * cId + psif);
        return Math.sqrt(vd * vd + vq * vq);
    };

    // Check voltage at base point
    const vMag_base = getVoltageMag(id_base, iq_base);

    if (vMag_base <= vLim) {
      // Region 1: Constant Torque
      // We can sustain the chosen strategy (MTPA or Id=0)
    } else {
      // Region 2: Flux Weakening or Natural Characteristics
      // Voltage limit exceeded.
      
      if (!baseSpeedFound) {
        baseSpeed = Math.max(0, rpm - stepRPM); // Previous step was safe
        baseSpeedFound = true;
      }

      if (enableFluxWeakening) {
        // Active Flux Weakening: Increase beta (more negative Id) to satisfy voltage limit
        // Binary search for beta that satisfies V <= Vlim within current limit constraint
        let low = currentBeta;
        let high = Math.PI / 2; // 90 degrees
        let optimalB = high;
        let foundSolution = false;

        for (let i = 0; i < 20; i++) {
          const mid = (low + high) / 2;
          const testId = -imax * Math.sin(mid);
          const testIq = imax * Math.cos(mid);
          
          if (getVoltageMag(testId, testIq) <= vLim) {
            foundSolution = true;
            optimalB = mid;
            high = mid; // Try to get closer to original angle (more torque) while safe
          } else {
            low = mid; // Need more FW
          }
        }

        if (foundSolution) {
          currentBeta = optimalB;
          currentId = -imax * Math.sin(currentBeta);
          currentIq = imax * Math.cos(currentBeta);
        } else {
          // Voltage cannot be satisfied even at full negative Id (or close to it)
          currentId = 0;
          currentIq = 0;
        }
      } else {
        // Flux Weakening Disabled: Voltage Limited Mode (Natural Characteristic)
        // We do not change the angle strategy actively to weaken flux.
        // Instead, the current magnitude naturally drops as voltage is clamped.
        // We find the maximum Current Magnitude that fits in Vlim given the strategy.
        
        let lowI = 0;
        let highI = imax;
        let validId = 0;
        let validIq = 0;
        let validBeta = 0;
        
        // Binary search for max feasible current magnitude
        for (let i = 0; i < 15; i++) {
            const midI = (lowI + highI) / 2;
            let tBeta = 0;
            
            if (controlStrategy === 'Id=0') {
                tBeta = 0;
            } else {
                // Find MTPA angle for this reduced current level
                // Coarse scan followed by fine scan
                let maxT_local = -1e9;
                
                // Coarse scan
                for (let b = 0; b <= 90; b += 5) {
                    const rad = (b * Math.PI) / 180;
                    const t = 1.5 * p * (psif * (midI * Math.cos(rad)) + (ld - lq) * (-midI * Math.sin(rad)) * (midI * Math.cos(rad)));
                    if (t > maxT_local) {
                        maxT_local = t;
                        tBeta = rad;
                    }
                }
                
                // Fine scan around best coarse
                const bestDeg = tBeta * 180 / Math.PI;
                for (let b = bestDeg - 4; b <= bestDeg + 4; b += 1) {
                    const rad = (b * Math.PI) / 180;
                    const t = 1.5 * p * (psif * (midI * Math.cos(rad)) + (ld - lq) * (-midI * Math.sin(rad)) * (midI * Math.cos(rad)));
                    if (t > maxT_local) {
                        maxT_local = t;
                        tBeta = rad;
                    }
                }
            }
            
            const tId = -midI * Math.sin(tBeta);
            const tIq = midI * Math.cos(tBeta);
            
            if (getVoltageMag(tId, tIq) <= vLim) {
                validId = tId;
                validIq = tIq;
                validBeta = tBeta;
                lowI = midI; // Can potentially support more current
            } else {
                highI = midI; // Voltage too high, reduce current
            }
        }
        
        currentId = validId;
        currentIq = validIq;
        currentBeta = validBeta;
      }
    }

    // Calculate final torque and power for this point
    const torque = 1.5 * p * (psif * currentIq + (ld - lq) * currentId * currentIq);
    const powerW = torque * (rpm * 2 * Math.PI / 60); // Mechanical power P = T * w_m
    const powerkW = powerW / 1000;

    const vMag_final = getVoltageMag(currentId, currentIq);
    
    // Safety clamp
    const safeTorque = Math.max(0, torque);
    const safePower = Math.max(0, powerkW);

    if (safePower > maxPower) maxPower = safePower;

    points.push({
      speedRPM: rpm,
      torque: safeTorque,
      power: safePower,
      voltageIndex: Math.min(1, vMag_final / vLim),
      currentAngle: (currentBeta * 180) / Math.PI,
      id: currentId,
      iq: currentIq
    });

    // If torque drops to effectively zero, stop simulation to keep chart clean
    if (rpm > 100 && safeTorque < 0.01) break;
  }

  return {
    points,
    maxTorque,
    baseSpeed,
    maxPower
  };
};
