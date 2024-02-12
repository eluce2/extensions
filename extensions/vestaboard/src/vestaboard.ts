import { VestaRW, VestaboardControlMode } from "vestaboard-api";

export const vesta = new VestaRW({
  apiReadWriteKey: "19c36bb9+7de9+440f+b574+70c2c1bd0670",
  mode: VestaboardControlMode.RW,
});
