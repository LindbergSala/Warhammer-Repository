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

const loreDocs = [
  "01_chapter_overview.md",
  "02_founding_context.md",
  "03_gene_line_inheritance.md",
  "04_primaris_origin_and_greyshield_legacy.md",
  "05_the_opening_of_the_indomitus_crusade.md",
  "06_the_wound_of_the_era.md",
  "07_pre_armageddon_deeds.md",
  "08_chapter_doctrine.md",
  "09_organisation_in_transition.md",
  "10_elite_units_and_honour_formations.md",
  "11_notable_figures.md",
  "12_heraldry_arms_and_relics.md",
  "13_fleet_holdings_and_strategic_base.md",
  "14_brotherhood_culture_and_rites.md",
  "15_enemies_oaths_and_fractures.md",
  "16_chronicle_from_founding_to_armageddon.md",
  "17_arrival_at_armageddon.md",
];

const escapeHTML = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderInlineMarkdown = (value) =>
  escapeHTML(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

const titleFromLoreFile = (fileName) => {
  const withoutExtension = fileName.replace(/\.md$/, "").replace(/^\d+_/, "");

  return withoutExtension
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
};

const renderMarkdown = (markdown) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let quote = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) {
      return;
    }

    html.push(`<ul>${list.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  const flushQuote = () => {
    if (!quote.length) {
      return;
    }

    html.push(`<blockquote><p>${renderInlineMarkdown(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);

    if (heading) {
      flushParagraph();
      flushList();
      flushQuote();

      const level = Math.min(heading[1].length + 1, 5);
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const listItem = trimmed.match(/^-\s+(.*)$/);

    if (listItem) {
      flushParagraph();
      flushQuote();
      list.push(listItem[1]);
      return;
    }

    const quoteLine = trimmed.match(/^>\s?(.*)$/);

    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      return;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushQuote();

  return html.join("");
};

document.querySelectorAll("[data-lore-reader]").forEach((reader) => {
  const basePath = reader.dataset.loreBase || "";
  const listTarget = reader.querySelector("[data-lore-list]");
  const output = reader.querySelector("[data-lore-output]");
  const previousButton = reader.querySelector("[data-lore-prev]");
  const nextButton = reader.querySelector("[data-lore-next]");
  const allButton = reader.querySelector("[data-lore-all]");
  let activeIndex = 0;

  if (!listTarget || !output) {
    return;
  }

  const setLoading = (message) => {
    output.innerHTML = `<p class="lore-reader__empty">${escapeHTML(message)}</p>`;
  };

  const setActiveButton = () => {
    listTarget.querySelectorAll("button").forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
    });

    if (previousButton) {
      previousButton.disabled = activeIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled = activeIndex === loreDocs.length - 1;
    }
  };

  const fetchLore = async (fileName) => {
    const response = await fetch(`${basePath}${fileName}`);

    if (!response.ok) {
      throw new Error(`Could not load ${fileName}`);
    }

    return response.text();
  };

  const loadLore = async (index) => {
    activeIndex = Math.max(0, Math.min(index, loreDocs.length - 1));
    setActiveButton();
    setLoading("Laddar lore-dokument...");

    try {
      const markdown = await fetchLore(loreDocs[activeIndex]);
      output.innerHTML = renderMarkdown(markdown);
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      output.innerHTML = `
        <p class="lore-reader__empty">
          Det gick inte att ladda dokumentet. Starta sidan via en lokal server
          eller Pages, eftersom webbläsaren ofta blockerar fetch från filsystemet.
        </p>
      `;
    }
  };

  const loadAllLore = async () => {
    setLoading("Laddar hela lore-arkivet...");

    try {
      const documents = await Promise.all(
        loreDocs.map(async (fileName) => {
          const markdown = await fetchLore(fileName);
          return `<section class="markdown-document">${renderMarkdown(markdown)}</section>`;
        }),
      );

      output.innerHTML = documents.join("");
      listTarget.querySelectorAll("button").forEach((button) => button.classList.remove("is-active"));
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      output.innerHTML = `
        <p class="lore-reader__empty">
          Det gick inte att ladda hela arkivet. Kontrollera att sidan körs via
          en lokal server eller Pages och att lore_docs finns med i projektet.
        </p>
      `;
    }
  };

  listTarget.innerHTML = loreDocs
    .map(
      (fileName, index) => `
        <button type="button" data-lore-index="${index}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          ${titleFromLoreFile(fileName)}
        </button>
      `,
    )
    .join("");

  listTarget.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lore-index]");

    if (button) {
      loadLore(Number(button.dataset.loreIndex));
    }
  });

  previousButton?.addEventListener("click", () => loadLore(activeIndex - 1));
  nextButton?.addEventListener("click", () => loadLore(activeIndex + 1));
  allButton?.addEventListener("click", loadAllLore);

  loadLore(0);
});
