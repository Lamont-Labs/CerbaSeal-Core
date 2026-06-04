// NOTE: This is a non-operational reference implementation showing Mode 2 (Internal HTTP Service) deployment.
// express is not installed in this repository. To use this wrapper, run:
//   pnpm add express && pnpm add -D @types/express
// then remove this comment block.
import express from "express";
import { ExecutionGateService } from "../src/services/execution/execution-gate-service.js";
import type { GovernedRequest } from "../src/domain/types/core.js";

const app = express();
app.use(express.json());

const gate = new ExecutionGateService();

app.post("/evaluate", (req: express.Request, res: express.Response) => {
  try {
    const result = gate.evaluate(req.body as GovernedRequest);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => {
  console.log("CerbaSeal HTTP wrapper running on port 3000");
});
