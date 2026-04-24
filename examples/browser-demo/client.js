(function () {
  var btnReject  = document.getElementById("btn-reject");
  var btnHold    = document.getElementById("btn-hold");
  var btnAllow   = document.getElementById("btn-allow");
  var fieldsArea = document.getElementById("fields-area");
  var jsonPanel  = document.getElementById("json-panel");
  var jsonOutput = document.getElementById("json-output");

  var allButtons = [btnReject, btnHold, btnAllow];

  function setLoading(active) {
    allButtons.forEach(function (b) { b.disabled = active; });
    if (active) {
      fieldsArea.innerHTML = '<p class="loading">Evaluating request...</p>';
      jsonPanel.style.display = "none";
      jsonOutput.textContent = "";
    }
  }

  function renderResult(data) {
    var stateClass = "state-" + data.finalState;
    var reasonStr  = Array.isArray(data.reasonCodes)
      ? data.reasonCodes.join(", ")
      : String(data.reasonCodes);

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

  function renderError(err, rawText) {
    fieldsArea.innerHTML =
      '<p class="loading" style="color:#f87171">Request failed: ' + err + '</p>';
    if (rawText) {
      jsonOutput.textContent = rawText;
      jsonPanel.style.display = "block";
    } else {
      jsonPanel.style.display = "none";
    }
  }

  function runScenario(endpoint) {
    setLoading(true);
    fetch(endpoint)
      .then(function (res) {
        return res.text().then(function (text) {
          return { status: res.status, text: text };
        });
      })
      .then(function (payload) {
        setLoading(false);
        try {
          var data = JSON.parse(payload.text);
          if (payload.status >= 400 || data.error) {
            renderError(data.error || ("HTTP " + payload.status), payload.text);
          } else {
            renderResult(data);
          }
        } catch (_) {
          renderError("Could not parse server response", payload.text);
        }
      })
      .catch(function (err) {
        setLoading(false);
        renderError(err.message || String(err), null);
      });
  }

  btnReject.addEventListener("click", function () { runScenario("/api/reject"); });
  btnHold.addEventListener("click",   function () { runScenario("/api/hold"); });
  btnAllow.addEventListener("click",  function () { runScenario("/api/allow"); });
}());
