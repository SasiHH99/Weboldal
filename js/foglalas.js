document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabase?.createClient) {
    console.error("Supabase CDN nincs betöltve");
    return;
  }

  const supabase =
    window.supabaseClient ||
    window.supabase.createClient(
      "https://hxvhsxppmdzcbklcberm.supabase.co",
      "sb_publishable_feNwyFggYsuxRqOr85cIng_h2pP4zn8"
    );

  if (!window.supabaseClient) {
    window.supabaseClient = supabase;
  }

  const form = document.getElementById("bookingForm");
  if (!form) return;

  const dateInput = document.getElementById("bookingDate");
  const gdprCheck = document.getElementById("gdpr");
  const submitButton = document.getElementById("bookingSubmit");
  const packageSelect = document.getElementById("packageSelect");
  const packageInfo = document.getElementById("packageInfo");
  const successBox = document.getElementById("bookingSuccess");
  const errorBox = document.getElementById("bookingError");
  const successClose = document.getElementById("successClose");
  const errorClose = document.getElementById("errorClose");

  const lang = window.location.pathname.startsWith("/hu") ? "hu" : "de";

  const TEXT = {
    hu: {
      packagePlaceholder: "A csomag kiválasztása után itt látod röviden, milyen igényhez illik a legjobban.",
      invalidDate: "Kérlek legalább két nappal későbbi dátumot válassz.",
      packages: {
        Essence:
          "Rövid, lendületes fotózás egy gyors portré- vagy páros sorozathoz, ha tiszta és használható képeket szeretnél rövid idő alatt.",
        Signature:
          "A legerősebb középcsomag többféle beállításhoz, több outfithez vagy tudatosabb online megjelenéshez.",
        Prestige:
          "Hosszabb, kreatívabb fotózás márkának, kampányhoz vagy prémium megjelenéshez, amikor nagyobb súlyú anyagra van szükség.",
        Event:
          "Nem fix dobozcsomag, hanem külön ajánlat eseményre, céges jelenlétre vagy egyedi projektre.",
        Custom:
          "Ha még nem döntötted el, melyik irány a jó, írd meg a célodat, és segítek kiválasztani a megfelelő csomagot."
      }
    },
    de: {
      packagePlaceholder: "Nach der Paketauswahl siehst du hier kurz, wofür es am besten passt.",
      invalidDate: "Bitte wähle ein Datum, das mindestens zwei Tage in der Zukunft liegt.",
      packages: {
        Essence:
          "Kurzes, klares Shooting für eine schnelle Porträt- oder Paarserie mit sauberem Ergebnis.",
        Signature:
          "Das stärkste Gesamtpaket, wenn du mehr Variation, mehrere Looks oder vielseitig nutzbares Material willst.",
        Prestige:
          "Mehr Zeit, mehr kreative Führung und deutlich größeres Bildmaterial für Branding, Kampagne oder Premium-Auftritt.",
        Event:
          "Kein starres Paket, sondern ein individuelles Angebot für Event, Firmenanfrage oder besonderes Projekt.",
        Custom:
          "Wenn du noch unsicher bist, beschreibe einfach dein Ziel und ich helfe dir bei der passenden Wahl."
      }
    }
  };

  let isSubmitting = false;

  function getMinBookingDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 2);
    return today;
  }

  function formatIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function updateSubmitState() {
    submitButton.disabled = isSubmitting || !(dateInput.value && gdprCheck.checked);
  }

  function updatePackageInfo() {
    const selectedPackage = packageSelect.value;
    packageInfo.textContent = TEXT[lang].packages[selectedPackage] || TEXT[lang].packagePlaceholder;
  }

  function isDateValid(value) {
    if (!value) return false;
    const selected = new Date(`${value}T12:00:00`);
    const minDate = getMinBookingDate();
    return selected >= minDate;
  }

  const minDate = getMinBookingDate();
  dateInput.min = formatIsoDate(minDate);
  updatePackageInfo();
  updateSubmitState();

  gdprCheck.addEventListener("change", updateSubmitState);
  dateInput.addEventListener("input", updateSubmitState);
  packageSelect.addEventListener("change", updatePackageInfo);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!isDateValid(dateInput.value)) {
      window.alert(TEXT[lang].invalidDate);
      return;
    }

    isSubmitting = true;
    updateSubmitState();

    try {
      const bookingData = {
        booking_date: dateInput.value,
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        package: form.package.value,
        message: form.message.value.trim(),
        status: "pending",
        lang
      };

      const { error: insertError } = await supabase.from("bookings_v2").insert([bookingData]);
      if (insertError) throw insertError;

      try {
        const mailResp = await fetch("/.netlify/functions/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData)
        });

        if (!mailResp.ok) {
          const body = await mailResp.text();
          console.warn("Booking email error:", body);
        }
      } catch (mailErr) {
        console.warn("Booking email request error:", mailErr);
      }

      successBox.classList.add("show");
      form.reset();
      dateInput.min = formatIsoDate(getMinBookingDate());
      updatePackageInfo();
      updateSubmitState();
    } catch (error) {
      console.error("Booking error:", error);
      errorBox.classList.add("show");
    } finally {
      isSubmitting = false;
      updateSubmitState();
    }
  });

  successClose.addEventListener("click", () => successBox.classList.remove("show"));
  errorClose.addEventListener("click", () => errorBox.classList.remove("show"));
});
