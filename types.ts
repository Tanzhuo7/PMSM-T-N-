
export type MotorType = 'IPMSM' | 'SPMSM';
export type ControlStrategy = 'MTPA' | 'Id=0';
export type Language = 'en' | 'zh';

export interface MotorParams {
  motorType: MotorType; // 'IPMSM' or 'SPMSM'
  controlStrategy: ControlStrategy; // 'MTPA' or 'Id=0'
  enableFluxWeakening: boolean; // Enable Field Weakening when voltage limit is reached
  rs: number;       // Stator Resistance (Ohm)
  ld: number;       // d-axis Inductance (Henry)
  lq: number;       // q-axis Inductance (Henry)
  psif: number;     // Permanent Magnet Flux Linkage (Weber)
  p: number;        // Pole Pairs
  vdc: number;      // DC Bus Voltage (Volts)
  voltageUtilization: number; // Ratio 0-1+ for SVPWM (multiplier of Vdc/sqrt(3))
  imax: number;     // Maximum Current (Amps peak)
  maxSpeed: number; // Max simulation speed (RPM)
}

export interface SimulationPoint {
  speedRPM: number;
  torque: number;
  power: number;
  voltageIndex: number; // Ratio of V/Vmax (0 to 1)
  currentAngle: number; // Beta angle in degrees
  id: number;
  iq: number;
}

export interface SimulationResult {
  points: SimulationPoint[];
  maxTorque: number;
  baseSpeed: number;
  maxPower: number;
}
