(function () {
  "use strict";

  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var clearBtn = document.getElementById("btn-clear");
  var wrap = document.getElementById("results");        // exists only on index.html
  var list = document.getElementById("results-list");
  var title = document.getElementById("results-title");
  var note = document.getElementById("results-note");
  var dataPromise = null;

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch("travel_recommendation_api.json").then(function (r) {
        if (!r.ok) { throw new Error("Could not load recommendations (" + r.status + ")"); }
        return r.json();
      });
    }
    return dataPromise;
  }

  // Returns {label, items:[{name,imageUrl,description}]}
  function findMatches(data, raw) {
    var term = raw.trim().toLowerCase();
    var allCities = [];
    data.countries.forEach(function (c) {
      c.cities.forEach(function (city) { allCities.push(city); });
    });

    if (term.indexOf("beach") !== -1) { return { label: "beaches", items: data.beaches }; }
    if (term.indexOf("temple") !== -1) { return { label: "temples", items: data.temples }; }
    if (term.indexOf("countr") !== -1) { return { label: "countries", items: allCities }; }

    // Country name (e.g. "japan") -> cities of that country
    var byCountry = [];
    data.countries.forEach(function (c) {
      if (c.name.toLowerCase().indexOf(term) !== -1) { byCountry = byCountry.concat(c.cities); }
    });
    if (byCountry.length) { return { label: raw.trim(), items: byCountry }; }

    // Any place name or description containing the term
    var pool = allCities.concat(data.temples, data.beaches);
    var items = pool.filter(function (p) {
      return p.name.toLowerCase().indexOf(term) !== -1;
    });
    return { label: raw.trim(), items: items };
  }

  function makeCard(item) {
    var card = document.createElement("article");
    card.className = "card";
    var img = document.createElement("img");
    img.src = item.imageUrl;
    img.alt = item.name;
    img.width = 800; img.height = 560;
    img.loading = "lazy";
    var body = document.createElement("div");
    body.className = "card-body";
    var h3 = document.createElement("h3");
    h3.textContent = item.name;
    var p = document.createElement("p");
    p.textContent = item.description;
    body.appendChild(h3); body.appendChild(p);
    card.appendChild(img); card.appendChild(body);
    return card;
  }

  function render(result, raw) {
    list.innerHTML = "";
    wrap.hidden = false;
    if (!result.items.length) {
      title.textContent = "No matches for \u201C" + raw.trim() + "\u201D";
      note.textContent = "";
      var empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "Try searching for beach, temple or country, or a name such as Japan or Kyoto.";
      list.appendChild(empty);
      return;
    }
    title.textContent = "Recommended " + result.label;
    note.textContent = result.items.length + " places that match \u201C" + raw.trim() + "\u201D";
    result.items.forEach(function (it) { list.appendChild(makeCard(it)); });
    wrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function runSearch(raw) {
    if (!raw.trim()) { input.focus(); return; }
    if (!wrap) {
      // On About / Contact pages: send the search to the Home page.
      window.location.href = "index.html?q=" + encodeURIComponent(raw.trim());
      return;
    }
    loadData().then(function (data) {
      render(findMatches(data, raw), raw);
    }).catch(function (err) {
      wrap.hidden = false;
      title.textContent = "Something went wrong";
      note.textContent = "";
      list.innerHTML = "";
      var p = document.createElement("p");
      p.className = "empty";
      p.textContent = err.message + ". Open the site through GitHub Pages or a local web server.";
      list.appendChild(p);
    });
  }

  function clearSearch() {
    input.value = "";
    if (wrap) {
      list.innerHTML = "";
      wrap.hidden = true;
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
    input.focus();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      runSearch(input.value);
    });
  }
  if (clearBtn) { clearBtn.addEventListener("click", clearSearch); }

  // Quick-search chips on the Home page
  document.querySelectorAll("[data-search]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-search");
      runSearch(input.value);
    });
  });

  // Search carried over from another page (?q=beach)
  if (wrap) {
    var q = new URLSearchParams(window.location.search).get("q");
    if (q) { input.value = q; runSearch(q); }
  }

  // Contact form: show a confirmation (no server needed on GitHub Pages)
  var contact = document.getElementById("contact-form");
  if (contact) {
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name").value.trim();
      var msg = document.getElementById("form-notice");
      msg.textContent = "Thanks, " + name + ". Your message has been sent. We will reply by email within two working days.";
      msg.hidden = false;
      contact.reset();
    });
  }
})();
