import type { InvariantCode } from "../constants/invariants.js";
import type { ReasonCode } from "../constants/reason-codes.js";

export class CerbaSealError extends Error {
  public readonly invariant: InvariantCode;
  public readonly reasonCode: ReasonCode;
  public readonly finalState: "HOLD" | "REJECT";

  constructor(args: {
    message: string;
    invariant: InvariantCode;
    reasonCode: ReasonCode;
    finalState: "HOLD" | "REJECT";
  }) {
    super(args.message);
    this.name = "CerbaSealError";
    this.invariant = args.invariant;
    this.reasonCode = args.reasonCode;
    this.finalState = args.finalState;
  }
}
