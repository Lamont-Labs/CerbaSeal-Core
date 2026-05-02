(function () {
  var btnReject = document.getElementById("btn-reject");
  var btnHold   = document.getElementById("btn-hold");
  var btnAllow  = document.getElementById("btn-allow");
  var allBtns   = [btnReject, btnHold, btnAllow];

  var placeholder    = document.getElementById("placeholder");
  var resultSection  = document.getElementById("result-section");
  var resultWrap     = document.getElementById("result-wrap");
  var errorPanel     = document.getElementById("error-panel");
  var errorText      = document.getElementById("error-text");

  var REVIEWER_NOTES = {
    reject: "This scenario proves that CerbaSeal's AI non-authority invariant (INV-05) fires unconditionally. An AI actor with an AI-sourced proposal cannot produce a release authorization regardless of any other field values. No approval flag or trust state can override this check.",
    hold:   "This scenario proves that required human approval cannot be bypassed. The request is structurally valid in every other respect — policy, provenance, trust state, and controls all pass — but the missing approval artifact causes execution to pause. Once approval is supplied, the same request produces ALLOW.",
    allow:  "This scenario proves the full happy path. All 12 invariants pass in sequence. A release authorization is issued, bound to this specific request and approver. The evidence bundle, audit chain, and replay all verify. This is the only code path that produces a release authorization."
  };

  var PLAIN_ENGLISH = {
    reject: "The AI attempted to authorize its own action. CerbaSeal blocked it. Execution did not occur. A blocked action record was created.",
    hold:   "The action could not proceed because a required human approval was missing. Execution is paused — not rejected. Once the approval is provided, the same request will be allowed through.",
    allow:  "All required conditions were satisfied. Human approval was present. CerbaSeal issued a release authorization. The action is cleared to execute with a complete evidence trail."
  };

  function setLoading(on) {
    allBtns.forEach(function (b) { b.disabled = on; });
    if (on) {
      placeholder.style.display    = "none";
      resultSection.style.display  = "block";
      resultWrap.style.display     = "none";
      errorPanel.style.display     = "none";
      resultSection.innerHTML = '<div class="loading-msg">Evaluating request\u2026</div>';
    }
  }

  function colorClass(value, type) {
    if (type === "state") {
      if (value === "REJECT") return "pv-REJECT";
      if (value === "HOLD")   return "pv-HOLD";
      if (value === "ALLOW")  return "pv-ALLOW";
    }
    if (type === "bool") {
      return value ? "pv-present" : "pv-none";
    }
    return "";
  }

  function setText(el, value, cls) {
    if (!el) return;
    el.textContent = value;
    el.className = "proof-value " + (cls || "");
  }

  function resetContent() {
    resultSection.innerHTML = [
      '<div class="result-wrap" id="result-wrap">',
      '  <div class="result-header"><span>Enforcement Result</span><span id="scenario-title-label"></span></div>',
      '  <div class="state-badge-wrap"><div class="state-badge" id="display-state-badge"></div></div>',
      '  <div class="consequence-wrap">',
      '    <div><div class="cq-label">Consequence</div><div class="cq-value" id="consequence-text"></div></div>',
      '    <div><div class="cq-label">Enforcement Reason</div><div class="cq-value" id="reason-text"></div></div>',
      '  </div>',
      '  <div class="plain-english">',
      '    <div class="pe-label">Plain English</div>',
      '    <div class="pe-text" id="plain-english-text"></div>',
      '  </div>',
      '  <div class="proof-grid">',
      '    <div class="proof-cell"><div class="proof-label">Final State</div><div class="proof-value" id="pv-final-state"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Reason Codes</div><div class="proof-value" id="pv-reason-codes"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Release Authorization</div><div class="proof-value" id="pv-release"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Blocked Action Record</div><div class="proof-value" id="pv-blocked"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Audit Events</div><div class="proof-value" id="pv-audit-events"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Chain Verified</div><div class="proof-value" id="pv-chain-verified"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Replay Matched</div><div class="proof-value" id="pv-replay-matched"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Next Action</div><div class="proof-value" id="pv-next-action"></div></div>',
      '  </div>',
      '  <div class="proof-expand">',
      '    <details id="proof-details"><summary>Technical trace \u2014 enforcement proof</summary>',
      '    <div class="proof-body"><p class="proof-note">This proof is generated from the actual CerbaSeal evaluation result. It is deterministic \u2014 running the same scenario always produces the same output.</p>',
      '    <pre id="proof-output"></pre></div></details>',
      '  </div>',
      '  <div class="reviewer-notes">',
      '    <div class="rn-label">Reviewer Notes</div>',
      '    <div class="rn-text" id="reviewer-notes-text"></div>',
      '  </div>',
      '</div>',
      '<div id="error-panel" style="display:none" class="result-wrap">',
      '  <div class="result-header"><span>Demo request failed</span></div>',
      '  <div class="error-msg" id="error-text"></div>',
      '</div>'
    ].join("\n");

    resultWrap             = document.getElementById("result-wrap");
    errorPanel             = document.getElementById("error-panel");
    errorText              = document.getElementById("error-text");
  }

  function renderResult(data, scenarioId) {
    resetContent();
    resultWrap.style.display  = "block";
    errorPanel.style.display  = "none";

    var ds = data.outcome.displayState;

    document.getElementById("scenario-title-label").textContent = data.scenario.title;

    var badge = document.getElementById("display-state-badge");
    badge.textContent = ds;
    badge.className   = "state-badge badge-" + ds;

    document.getElementById("consequence-text").textContent = data.outcome.consequence;
    document.getElementById("reason-text").textContent      = data.outcome.reason;

    var peEl = document.getElementById("plain-english-text");
    if (peEl) peEl.textContent = PLAIN_ENGLISH[scenarioId] || data.scenario.plainMeaning || "";

    setText(document.getElementById("pv-final-state"), data.outcome.finalState,
      colorClass(data.outcome.finalState, "state"));

    var codes = Array.isArray(data.outcome.reasonCodes)
      ? data.outcome.reasonCodes.join(", ")
      : String(data.outcome.reasonCodes);
    var rcEl = document.getElementById("pv-reason-codes");
    if (rcEl) { rcEl.textContent = codes; rcEl.className = "proof-value"; }

    var relLabel = data.proof.releaseAuthorizationExists ? "present" : "none";
    setText(document.getElementById("pv-release"), relLabel,
      colorClass(data.proof.releaseAuthorizationExists, "bool"));

    var blkLabel = data.proof.blockedActionRecordExists ? "present" : "none";
    setText(document.getElementById("pv-blocked"), blkLabel,
      colorClass(data.proof.blockedActionRecordExists, "bool"));

    // Evidence fields
    var ev   = data.evidence ? data.evidence.auditEventCount : null;
    var cv   = data.evidence ? data.evidence.chainVerified : null;
    var rm   = data.evidence ? data.evidence.replayMatchedOriginal : null;
    var next = data.diagnostics ? data.diagnostics.recommendedNextAction : null;

    var evEl = document.getElementById("pv-audit-events");
    if (evEl) { evEl.textContent = ev !== null ? String(ev) : "—"; evEl.className = "proof-value"; }

    var cvEl = document.getElementById("pv-chain-verified");
    if (cvEl) setText(cvEl, cv !== null ? (cv ? "yes" : "no") : "—",
      cv !== null ? colorClass(cv, "bool") : "");

    var rmEl = document.getElementById("pv-replay-matched");
    if (rmEl) setText(rmEl, rm !== null ? (rm ? "yes" : "no") : "—",
      rm !== null ? colorClass(rm, "bool") : "");

    var naEl = document.getElementById("pv-next-action");
    if (naEl) { naEl.textContent = next || "—"; naEl.className = "proof-value"; }

    var proofOutput  = document.getElementById("proof-output");
    var proofDetails = document.getElementById("proof-details");
    var proofContent = data.proof.certificate
      ? data.proof.certificate
      : JSON.stringify(data.raw.gateResult, null, 2);
    if (proofOutput) proofOutput.textContent = proofContent;
    if (proofDetails) proofDetails.open = false;

    var rnEl = document.getElementById("reviewer-notes-text");
    if (rnEl) rnEl.textContent = REVIEWER_NOTES[scenarioId] || "";
  }

  function renderError(status, rawText) {
    resetContent();
    resultWrap.style.display  = "none";
    errorPanel.style.display  = "block";
    var eText = document.getElementById("error-text");
    var msg = "Request failed";
    if (status) msg += " (HTTP " + status + ")";
    if (rawText) msg += ":\n\n" + rawText;
    if (eText) eText.textContent = msg;
  }

  function runScenario(endpoint, scenarioId) {
    setLoading(true);
    fetch(endpoint)
      .then(function (res) {
        var status = res.status;
        return res.text().then(function (text) { return { status: status, text: text }; });
      })
      .then(function (payload) {
        allBtns.forEach(function (b) { b.disabled = false; });
        try {
          var data = JSON.parse(payload.text);
          if (payload.status >= 400 || data.error) {
            renderError(payload.status, data.error || payload.text);
          } else {
            renderResult(data, scenarioId);
          }
        } catch (_) {
          renderError(payload.status, payload.text);
        }
      })
      .catch(function (err) {
        allBtns.forEach(function (b) { b.disabled = false; });
        renderError(null, err.message || String(err));
      });
  }

  btnReject.addEventListener("click", function () { runScenario("/api/reject", "reject"); });
  btnHold.addEventListener("click",   function () { runScenario("/api/hold",   "hold"); });
  btnAllow.addEventListener("click",  function () { runScenario("/api/allow",  "allow"); });
}());
