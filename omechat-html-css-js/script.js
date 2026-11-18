(function () {
  // ---------- Menu toggle ----------
  const menuBtn = document.getElementById("menu-btn");
  const menu = document.getElementById("site-menu");
  const menuLabel = document.getElementById("menu-label");

  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    menuLabel.textContent = open ? "Close menu" : "Open menu";
  }

  menuBtn.addEventListener("click", function () {
    setMenu(menu.hidden);
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // ---------- Mode selection ----------
  const startBtn = document.getElementById("start-btn");
  const modeInputs = document.querySelectorAll('input[name="mode"]');

  modeInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      document.querySelectorAll(".mode").forEach(function (label) {
        label.classList.toggle("is-active", label.contains(input) && input.checked);
      });
      startBtn.href = "chat.html?mode=" + input.value;
    });
  });

  // ---------- Live active counter ----------
  const countEl = document.getElementById("active-count");
  let count = 4910;
  setInterval(function () {
    count = Math.max(4500, count + Math.round((Math.random() - 0.45) * 12));
    countEl.textContent = count.toLocaleString("en-US");
  }, 3000);
})();
