const CHAT_COPY = {
  hu: {
    kicker: "Gyors segítség",
    title: "Kérdezz gyorsan, és kapsz azonnali választ.",
    intro: "Válassz egy gyakori kérdést. Ha többre van szükséged, megnyithatod a kapcsolat oldalt vagy kimásolhatod az email címet.",
    mailLabel: "Kapcsolat oldal megnyitása",
    copyLabel: "Email cím másolása",
    copied: "Az email cím a vágólapra került.",
    copyFail: "Az email cím: busi.sandor@bphoto.at",
    ariaOpen: "Segéd megnyitása",
    ariaClose: "Bezárás",
    options: [
      {
        id: "prices",
        label: "Melyik csomag való nekem?",
        answer: "Az Essence rövid és gyors sorozatra jó, a Signature a legerősebb középcsomag, a Prestige pedig akkor működik igazán jól, ha nagyobb, tudatosabb képanyagot szeretnél."
      },
      {
        id: "booking",
        label: "Hogyan működik a foglalás?",
        answer: "Kiválasztod a dátumot, elküldöd az igényt, én pedig általában 24 órán belül visszajelzek, és pontosítjuk a részleteket."
      },
      {
        id: "gallery",
        label: "Mikor kapom meg a galériát?",
        answer: "A kész képeket online galériában adom át. Ha a galéria elkészült, emailben megkapod a hozzáférést és a belépési adatokat."
      },
      {
        id: "location",
        label: "Hol vállalsz fotózást?",
        answer: "Főként Bécsben és környékén dolgozom, de megfelelő projekt esetén más helyszín is megoldható."
      }
    ]
  },
  de: {
    kicker: "Schnelle Hilfe",
    title: "Kurze Frage, direkte Antwort.",
    intro: "Wähle eine häufige Frage aus. Für alles Weitere kannst du die Kontaktseite öffnen oder die E-Mail-Adresse kopieren.",
    mailLabel: "Kontaktseite öffnen",
    copyLabel: "E-Mail kopieren",
    copied: "Die E-Mail-Adresse wurde kopiert.",
    copyFail: "Die E-Mail-Adresse lautet: busi.sandor@bphoto.at",
    ariaOpen: "Hilfe öffnen",
    ariaClose: "Schließen",
    options: [
      {
        id: "prices",
        label: "Welches Paket passt zu mir?",
        answer: "Essence ist gut für eine kurze, klare Serie, Signature ist das stärkste Gesamtpaket, und Prestige passt, wenn du ein größeres, strategischeres Bildmaterial brauchst."
      },
      {
        id: "booking",
        label: "Wie läuft die Buchung ab?",
        answer: "Du wählst ein Datum, sendest deine Anfrage und ich melde mich in der Regel innerhalb von 24 Stunden zurück, damit wir alles konkret abstimmen."
      },
      {
        id: "gallery",
        label: "Wann erhalte ich die Galerie?",
        answer: "Die finalen Bilder bekommst du über eine Online-Galerie. Sobald sie fertig ist, erhältst du den Zugang per E-Mail."
      },
      {
        id: "location",
        label: "Wo fotografierst du?",
        answer: "Hauptsächlich in Wien und Umgebung. Für passende Projekte plane ich auch andere Orte ein."
      }
    ]
  }
};

function initSiteChat() {
  if (document.querySelector(".site-chat")) return;
  if (window.location.pathname.startsWith("/admin")) return;

  const lang = window.location.pathname.startsWith("/hu") ? "hu" : "de";
  const copy = CHAT_COPY[lang];
  const contactUrl = lang === "hu"
    ? "/hu/kapcsolat.html?source=chatbot"
    : "/de/kontakt.html?source=chatbot";

  const host = document.createElement("div");
  host.className = "site-chat";
  host.innerHTML = `
    <button type="button" class="site-chat-toggle" aria-label="${copy.ariaOpen}">
      <span class="site-chat-toggle-icon">✦</span>
      <span class="site-chat-toggle-text">AI</span>
    </button>
    <div class="site-chat-panel" aria-live="polite">
      <div class="site-chat-head">
        <div>
          <p class="site-chat-kicker">${copy.kicker}</p>
          <h2 class="site-chat-title">${copy.title}</h2>
        </div>
        <button type="button" class="site-chat-close" aria-label="${copy.ariaClose}">×</button>
      </div>
      <p class="site-chat-intro">${copy.intro}</p>
      <div class="site-chat-options"></div>
      <div class="site-chat-answer-box">
        <p class="site-chat-answer">${copy.options[0].answer}</p>
      </div>
      <div class="site-chat-actions">
        <a class="site-chat-mail" href="${contactUrl}">${copy.mailLabel}</a>
        <button type="button" class="site-chat-copy">${copy.copyLabel}</button>
      </div>
      <p class="site-chat-feedback" aria-live="polite"></p>
    </div>
  `;

  document.body.appendChild(host);
  document.body.classList.add("has-site-chat");

  const toggle = host.querySelector(".site-chat-toggle");
  const close = host.querySelector(".site-chat-close");
  const options = host.querySelector(".site-chat-options");
  const answer = host.querySelector(".site-chat-answer");
  const copyButton = host.querySelector(".site-chat-copy");
  const feedback = host.querySelector(".site-chat-feedback");

  options.innerHTML = copy.options
    .map((item, index) => `<button type="button" class="site-chat-option" data-answer-index="${index}">${item.label}</button>`)
    .join("");

  toggle.addEventListener("click", () => {
    host.classList.toggle("is-open");
  });

  close.addEventListener("click", () => {
    host.classList.remove("is-open");
  });

  options.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer-index]");
    if (!button) return;

    const item = copy.options[Number(button.dataset.answerIndex)];
    if (!item) return;

    answer.textContent = item.answer;
    feedback.textContent = "";
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("busi.sandor@bphoto.at");
      feedback.textContent = copy.copied;
    } catch {
      feedback.textContent = copy.copyFail;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteChat, { once: true });
} else {
  initSiteChat();
}
