(function () {
  const btnReject = document.getElementById("btn-reject");
  const btnHold   = document.getElementById("btn-hold");
  const btnAllow  = document.getElementById("btn-allow");
  const fieldsArea = document.getElementById("fields-area");
  const jsonPanel  = document.getElementById("json-panel");
  const jsonOutput = document.getElementById("json-output");

  function setLoading(active) {
    [btnReject, btnHold, btnAllow].forEach(function (b) { b.disabled = active; });
    if (active) {
      fieldsArea.innerHTML = '<p class="loading">Evaluating request...</p>';
      jsonPanel.style.display = "none";
    }
  }

  function renderResult(data) {
    var stateClass = "state-" + data.finalState;
    var reasonStr  = Array.isArray(data.reasonCodes) ? data.reasonCodes.join(", ") : String(data.reasonCodes);

    fieldsArea.innerHTML = [
      '<div class="fields">',
      '  <span class="field-label">Decision</span>',
      '  <span class="field-value ' + stateClass + '">' + data.finalState + '</span>',
      '  <span class="field-label">Reason Codes</span>',
      '  <span class="field-value">' + reasonStr + '</span>',
      '  <span class="field-label">Release Authorization</span>',
      '  <span class="field-value">' + (data.releaseAuthorizationExists ? "Yes" : "No") + '</span>',
      '  <span class="field-label">Blocked Action Record</span>',
      '  <span class="field-value">' + (data.blockedActionRecordExists ? "Yes" : "No") + '</span>',
      '</div>'
    ].join("\n");

    jsonOutput.textContent = JSON.stringify(data, null, 2);
    jsonPanel.style.display = "block";
  }

  function renderError(err) {
    fieldsArea.innerHTML = '<p class="loading" style="color:#f87171">Error: ' + err + '</p>';
  }

  function runScenario(endpoint) {
    setLoading(true);
    fetch(endpoint)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setLoading(false);
        renderResult(data);
      })
      .catch(function (err) {
        setLoading(false);
        renderError(err.message || String(err));
      });
  }

  btnReject.addEventListener("click", function () { runScenario("/api/reject"); });
  btnHold.addEventListener("click",   function () { runScenario("/api/hold"); });
  btnAllow.addEventListener("click",  function () { runScenario("/api/allow"); });
}());
