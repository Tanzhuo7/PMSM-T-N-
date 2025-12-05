
import { MotorParams } from './types';

// Default values representing the user's specific motor configuration
export const DEFAULT_PARAMS: MotorParams = {
  motorType: 'IPMSM',
  controlStrategy: 'MTPA',
  enableFluxWeakening: false, // Default disabled as requested
  rs: 0.0595,      // 59.5 mOhm
  ld: 0.0000235,   // 23.5 uH
  lq: 0.000035,    // 35 uH
  psif: 0.00159,   // 0.00159 Wb
  p: 15,           // 15 pole pairs
  vdc: 18.5,       // 18.5V DC Bus
  voltageUtilization: 0.9, // 0.9 Utilization
  imax: 13,        // 13A Peak
  maxSpeed: 5000,  // Adjusted for ~3800 RPM no-load speed
};

export const COLORS = {
  primary: '#2563eb',   // Blue 600
  secondary: '#16a34a', // Green 600
  accent: '#f59e0b',    // Amber 500
  grid: '#e2e8f0',      // Slate 200
  text: '#1e293b',      // Slate 800
};

export const TRANSLATIONS = {
  en: {
    appTitle: "PMSM Analyzer",
    appSubtitle: "Theoretical T-N Curve Generator",
    documentation: "Documentation",
    motorParams: "Motor Parameters",
    motorType: "Motor Type",
    ipmsmDesc: "Interior Permanent Magnet (Lq > Ld)",
    spmsmDesc: "Surface Permanent Magnet (Lq ≈ Ld)",
    controlStrategy: "Control Strategy",
    mtpa: "MTPA",
    idZero: "Id = 0",
    enableFw: "Enable Flux Weakening",
    statorResistance: "Stator Resistance (Rs)",
    fluxLinkage: "Flux Linkage (ψf)",
    dAxisInductance: "d-axis Inductance (Ld)",
    qAxisInductance: "q-axis Inductance (Lq)",
    syncInductance: "Synchronous Inductance (Ls)",
    polePairs: "Pole Pairs (p)",
    maxSpeed: "Max Simulation Speed",
    autoCalc: "Auto",
    inverterConstraints: "Inverter Constraints",
    dcBusVoltage: "DC Supply Voltage (Vdc)",
    voltageUtil: "SVPWM Utilization (Ratio)",
    maxCurrent: "Max Current (Peak)",
    noteInductance: "Note: Inductances should be in Henry. 1 mH = 0.001 H.",
    calcPerformance: "Calculated Performance",
    maxTorque: "Max Torque",
    baseSpeed: "Base Speed",
    peakPower: "Peak Power",
    speedRPM: "Speed (RPM)",
    torqueNm: "Torque (Nm)",
    powerkW: "Power (kW)",
    showFormulas: "Show Calculation Formulas",
    hideFormulas: "Hide Calculation Formulas",
    mathModel: "Mathematical Model (dq-frame)",
    voltageEq: "Voltage Equations",
    torqueFlux: "Torque & Flux",
    maxSpeedTheory: "Theoretical Max Speed",
    modelNote: "Note: MTPA (Maximum Torque Per Ampere) strategy is used below base speed. Field Weakening (Flux Weakening) is applied when voltage limit is reached.",
    mtpaAngle: "MTPA Angle (Low Speed)",
    maxFwAngle: "Max FW Angle",
    voltageUtilResult: "Voltage Utilization",
    voltageExplain: "Base limit is Vdc/√3. Enter 0.9 for 90% of base."
  },
  zh: {
    appTitle: "PMSM 电机分析仪",
    appSubtitle: "理论 T-N 曲线生成器",
    documentation: "文档",
    motorParams: "电机参数",
    motorType: "电机类型",
    ipmsmDesc: "内置式永磁同步电机 (Lq > Ld)",
    spmsmDesc: "表贴式永磁同步电机 (Lq ≈ Ld)",
    controlStrategy: "低速控制策略",
    mtpa: "MTPA (最大转矩电流比)",
    idZero: "Id = 0 控制",
    enableFw: "启用弱磁控制 (Flux Weakening)",
    statorResistance: "定子电阻 (Rs)",
    fluxLinkage: "磁链 (ψf)",
    dAxisInductance: "d轴电感 (Ld)",
    qAxisInductance: "q轴电感 (Lq)",
    syncInductance: "同步电感 (Ls)",
    polePairs: "极对数 (p)",
    maxSpeed: "最大仿真转速",
    autoCalc: "自动计算",
    inverterConstraints: "逆变器限制",
    dcBusVoltage: "直流母线供电电压 (Vdc)",
    voltageUtil: "SVPWM 电压利用率",
    maxCurrent: "最大电流 (峰值)",
    noteInductance: "注意：电感单位为亨利 (Henry)。1 mH = 0.001 H。",
    calcPerformance: "性能计算结果",
    maxTorque: "最大转矩",
    baseSpeed: "基速",
    peakPower: "峰值功率",
    speedRPM: "转速 (RPM)",
    torqueNm: "转矩 (Nm)",
    powerkW: "功率 (kW)",
    showFormulas: "显示计算公式",
    hideFormulas: "隐藏计算公式",
    mathModel: "数学模型 (dq坐标系)",
    voltageEq: "电压方程",
    torqueFlux: "转矩与磁链",
    maxSpeedTheory: "理论最大转速",
    modelNote: "说明：基速以下采用 MTPA (最大转矩电流比) 控制策略。达到电压极限后采用弱磁控制。",
    mtpaAngle: "MTPA 角度 (低速)",
    maxFwAngle: "最大弱磁角度",
    voltageUtilResult: "电压利用率",
    voltageExplain: "基准为 Vdc/√3。若利用率为0.9，直接输入0.9即可。"
  }
};
