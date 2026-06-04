export class CerbaSealError extends Error {
    invariant;
    reasonCode;
    finalState;
    constructor(args) {
        super(args.message);
        this.name = "CerbaSealError";
        this.invariant = args.invariant;
        this.reasonCode = args.reasonCode;
        this.finalState = args.finalState;
    }
}
