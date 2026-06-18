const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

document.querySelectorAll(".menu-toggle").forEach((button) => {
  const header = button.closest(".site-header");
  const menu = document.getElementById(button.getAttribute("aria-controls"));

  if (!header || !menu) {
    return;
  }

  const closeMenu = () => {
    header.classList.remove("is-menu-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Öppna meny");
  };

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-menu-open");

    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Stäng meny" : "Öppna meny");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });
});

document.querySelectorAll("[data-card]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});
