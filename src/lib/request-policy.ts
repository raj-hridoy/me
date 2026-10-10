export type CallerContext = "shared" | "owner" | "anonymous";

/** Fictional teaching model: authentication precedes a scoped read decision. */
export function evaluateRequest(caller: CallerContext, grant: boolean) {
  if (caller === "anonymous")
    return {
      permitted: false,
      stop: 1,
      reason: "No verified session. Identity boundary holds.",
      result: "Protected resource withheld",
    };
  if (caller === "owner" || grant)
    return {
      permitted: true,
      stop: 4,
      reason:
        caller === "owner"
          ? "Verified caller owns this resource."
          : "Verified caller has an explicit read grant.",
      result: caller === "owner" ? "Owner read allowed" : "Shared read allowed",
    };
  return {
    permitted: false,
    stop: 2,
    reason: "A valid identity has no read permission here.",
    result: "Private document withheld",
  };
}
