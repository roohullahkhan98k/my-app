import { z } from 'zod';

export const beamAnalysisSchema = z.object({
  h_mm: z.number().min(0, "Height must be positive").max(10000, "Height must be reasonable"),
  d_mm: z.number().min(0, "Depth must be positive").max(10000, "Depth must be reasonable"),
  b_mm: z.number().min(0, "Width must be positive").max(10000, "Width must be reasonable"),
  a_mm: z.number().min(0, "Distance must be positive").max(10000, "Distance must be reasonable"),
  abyd: z.number().min(0, "Ratio must be positive").max(10, "Ratio must be reasonable"),
  fck_Mpa: z.number().min(0, "Concrete strength must be positive").max(200, "Concrete strength must be reasonable"),
  rho: z.number().min(0, "Reinforcement ratio must be positive").max(0.1, "Reinforcement ratio must be reasonable"),
  fyk_Mpa: z.number().min(0, "Steel strength must be positive").max(1000, "Steel strength must be reasonable"),
  da_mm: z.number().min(0, "Cover must be positive").max(200, "Cover must be reasonable"),
  Plate_Top_mm: z.number().min(0, "Top plate must be positive").max(1000, "Top plate must be reasonable"),
  Plate_Bottom_mm: z.number().min(0, "Bottom plate must be positive").max(1000, "Bottom plate must be reasonable"),
});

export type BeamAnalysisFormData = z.infer<typeof beamAnalysisSchema>;

export interface AnalysisResult {
  shearStrength: number;
  confidence: number;
  timestamp: string;
  inputData: BeamAnalysisFormData;
}

export const fieldDescriptions = {
  h_mm: "Beam height in millimeters",
  d_mm: "Beam depth in millimeters", 
  b_mm: "Beam width in millimeters",
  a_mm: "Shear span in millimeters",
  abyd: "Shear span to depth ratio",
  fck_Mpa: "Concrete compressive strength in MPa",
  rho: "Longitudinal reinforcement ratio",
  fyk_Mpa: "Steel yield strength in MPa",
  da_mm: "Concrete cover in millimeters",
  Plate_Top_mm: "Top plate thickness in millimeters",
  Plate_Bottom_mm: "Bottom plate thickness in millimeters",
};

export const fieldUnits = {
  h_mm: "mm",
  d_mm: "mm",
  b_mm: "mm", 
  a_mm: "mm",
  abyd: "",
  fck_Mpa: "MPa",
  rho: "",
  fyk_Mpa: "MPa",
  da_mm: "mm",
  Plate_Top_mm: "mm",
  Plate_Bottom_mm: "mm",
};
