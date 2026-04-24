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

  var scenarieTitleLabel = document.getElementById("scenario-title-label");
  var displayStateBadge  = document.getElementById("display-state-badge");
  var consequenceText    = document.getElementById("consequence-text");
  var reasonText         = document.getElementById("reason-text");
  var pvFinalState       = document.getElementById("pv-final-state");
  var pvReasonCodes      = document.getElementById("pv-reason-codes");
  var pvRelease          = document.getElementById("pv-release");
  var pvBlocked          = document.getElementById("pv-blocked");
  var proofDetails       = document.getElementById("proof-details");
  var proofOutput        = document.getElementById("proof-output");

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
      '  <div class="proof-grid">',
      '    <div class="proof-cell"><div class="proof-label">Final State</div><div class="proof-value" id="pv-final-state"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Reason Codes</div><div class="proof-value" id="pv-reason-codes"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Release Authorization</div><div class="proof-value" id="pv-release"></div></div>',
      '    <div class="proof-cell"><div class="proof-label">Blocked Action Record</div><div class="proof-value" id="pv-blocked"></div></div>',
      '  </div>',
      '  <div class="proof-expand"><details id="proof-details"><summary>View enforcement proof</summary>',
      '    <div class="proof-body"><p class="proof-note">This proof is generated from the actual CerbaSeal evaluation result.</p>',
      '    <pre id="proof-output"></pre></div></details></div>',
      '</div>',
      '<div id="error-panel" style="display:none" class="result-wrap">',
      '  <div class="result-header"><span>Demo request failed</span></div>',
      '  <div class="error-msg" id="error-text"></div>',
      '</div>'
    ].join("\n");

    scenarieTitleLabel = document.getElementById("scenario-title-label");
    displayStateBadge  = document.getElementById("display-state-badge");
    consequenceText    = document.getElementById("consequence-text");
    reasonText         = document.getElementById("reason-text");
    pvFinalState       = document.getElementById("pv-final-state");
    pvReasonCodes      = document.getElementById("pv-reason-codes");
    pvRelease          = document.getElementById("pv-release");
    pvBlocked          = document.getElementById("pv-blocked");
    proofDetails       = document.getElementById("proof-details");
    proofOutput        = document.getElementById("proof-output");
    resultWrap         = document.getElementById("result-wrap");
    errorPanel         = document.getElementById("error-panel");
    errorText          = document.getElementById("error-text");
  }

  function renderResult(data) {
    resetContent();
    resultWrap.style.display  = "block";
    errorPanel.style.display  = "none";

    var ds = data.outcome.displayState;

    scenarieTitleLabel.textContent = data.scenario.title;
    displayStateBadge.textContent  = ds;
    displayStateBadge.className    = "state-badge badge-" + ds;

    consequenceText.textContent = data.outcome.consequence;
    reasonText.textContent      = data.outcome.reason;

    setText(pvFinalState,  data.outcome.finalState, colorClass(data.outcome.finalState, "state"));

    var codes = Array.isArray(data.outcome.reasonCodes)
      ? data.outcome.reasonCodes.join(", ")
      : String(data.outcome.reasonCodes);
    pvReasonCodes.textContent = codes;
    pvReasonCodes.className   = "proof-value";

    var relLabel = data.proof.releaseAuthorizationExists ? "present" : "none";
    setText(pvRelease, relLabel, colorClass(data.proof.releaseAuthorizationExists, "bool"));

    var blkLabel = data.proof.blockedActionRecordExists ? "present" : "none";
    setText(pvBlocked, blkLabel, colorClass(data.proof.blockedActionRecordExists, "bool"));

    var proofContent = data.proof.certificate
      ? data.proof.certificate
      : JSON.stringify(data.raw.gateResult, null, 2);
    proofOutput.textContent = proofContent;
    proofDetails.open = false;
  }

  function renderError(status, rawText) {
    resetContent();
    resultWrap.style.display  = "none";
    errorPanel.style.display  = "block";
    var msg = "Request failed";
    if (status) msg += " (HTTP " + status + ")";
    if (rawText) msg += ":\n\n" + rawText;
    errorText.textContent = msg;
  }

  function runScenario(endpoint) {
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
            renderResult(data);
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

  btnReject.addEventListener("click", function () { runScenario("/api/reject"); });
  btnHold.addEventListener("click",   function () { runScenario("/api/hold"); });
  btnAllow.addEventListener("click",  function () { runScenario("/api/allow"); });
}());
