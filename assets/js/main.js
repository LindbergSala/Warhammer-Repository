const yearTarget = document.querySelector("[data-year]");

if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

document.querySelectorAll("[data-card]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});
