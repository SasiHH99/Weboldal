const GALLERY_LOGIN_COPY = {
  hu: {
    heroTitle: "A galériád itt érhető el privát és kényelmes formában.",
    heroCopy: "A foglaláskor megadott emaillel és az általunk küldött jelszóval tudsz belépni. Itt tudod végignézni az összes átadott képet és kijelölni a kedvenceidet.",
    cardTitle: "Online galéria belépés",
    cardCopy: "A belépés után azonnal megnyílik a privát galériád. Ha még nem kaptad meg a hozzáférést, várj a képátadásról küldött emailre.",
    home: "Vissza a főoldalra",
    email: "Email",
    password: "Jelszó",
    submit: "Belépés",
    loading: "Ellenőrzés...",
    forgot: "Elfelejtett jelszó",
    forgotLoading: "Küldés...",
    forgotMissing: "Az új jelszó kéréséhez add meg az email címedet.",
    forgotSuccess: "Küldtem egy jelszó-visszaállító emailt. Nyisd meg a benne lévő linket ugyanazon az eszközön.",
    missingFields: "Kérlek tölts ki minden mezőt.",
    invalidEmail: "Adj meg érvényes email címet.",
    invalidLogin: "Hibás email vagy jelszó.",
    unexpected: "Váratlan hiba történt. Próbáld meg újra.",
    note: "Amint a galériád készen áll, emailben küldjük a belépési adatokat. Ugyanazzal az email címmel jelentkezz be, amit a foglaláskor megadtál."
  },
  de: {
    heroTitle: "Deine Galerie ist hier privat und direkt erreichbar.",
    heroCopy: "Melde dich mit der E-Mail-Adresse aus deiner Buchung und dem zugesendeten Passwort an. Danach kannst du alle Bilder ansehen und Favoriten markieren.",
    cardTitle: "Login zur Online Galerie",
    cardCopy: "Nach dem Login landest du direkt in deiner privaten Galerie. Wenn du noch keinen Zugang erhalten hast, warte bitte auf unsere E-Mail zur Bildübergabe.",
    home: "Zur Startseite",
    email: "E-Mail",
    password: "Passwort",
    submit: "Login",
    loading: "Prüfung...",
    forgot: "Passwort vergessen",
    forgotLoading: "Senden...",
    forgotMissing: "Für ein neues Passwort brauche ich deine E-Mail-Adresse.",
    forgotSuccess: "Ich habe dir eine E-Mail zum Zurücksetzen geschickt. Öffne den Link am besten auf demselben Gerät.",
    missingFields: "Bitte alle Felder ausfüllen.",
    invalidEmail: "Bitte eine gültige E-Mail-Adresse eingeben.",
    invalidLogin: "Falsche E-Mail oder falsches Passwort.",
    unexpected: "Ein unerwarteter Fehler ist aufgetreten. Bitte erneut versuchen.",
    note: "Sobald deine Galerie bereit ist, senden wir dir die Zugangsdaten per E-Mail. Bitte melde dich mit derselben E-Mail-Adresse an, die du bei der Buchung verwendet hast."
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const shell = document.querySelector("[data-gallery-login]");
  if (!shell) return;

  const lang = shell.dataset.lang === "de" ? "de" : "hu";
  const copy = GALLERY_LOGIN_COPY[lang];
  const redirectUrl = lang === "de" ? "/de/galeria.html" : "/hu/galeria.html";
  const homeUrl = lang === "de" ? "/de/index.html" : "/hu/index.html";
  const resetUrl = `${window.location.origin}${lang === "de" ? "/de/galeria-jelszo.html" : "/hu/galeria-jelszo.html"}`;
  const supabase = window.supabaseClient;
  if (!supabase) return;

  const heroTitle = document.getElementById("galleryLoginHeroTitle");
  const heroCopy = document.getElementById("galleryLoginHeroCopy");
  const cardTitle = document.getElementById("galleryLoginTitle");
  const cardCopy = document.getElementById("galleryLoginCopy");
  const homeLink = document.getElementById("galleryLoginHome");
  const note = document.getElementById("galleryLoginNote");
  const emailLabel = document.getElementById("galleryLoginEmailLabel");
  const passwordLabel = document.getElementById("galleryLoginPasswordLabel");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const button = document.getElementById("loginBtn");
  const forgotButton = document.getElementById("galleryForgotBtn");
  const errorBox = document.getElementById("galleryLoginError");
  const successBox = document.getElementById("galleryLoginSuccess");

  heroTitle.textContent = copy.heroTitle;
  heroCopy.textContent = copy.heroCopy;
  cardTitle.textContent = copy.cardTitle;
  cardCopy.textContent = copy.cardCopy;
  homeLink.textContent = copy.home;
  homeLink.href = homeUrl;
  note.textContent = copy.note;
  emailLabel.textContent = copy.email;
  passwordLabel.textContent = copy.password;
  emailInput.placeholder = copy.email;
  passwordInput.placeholder = copy.password;
  button.textContent = copy.submit;
  forgotButton.textContent = copy.forgot;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    window.location.href = redirectUrl;
    return;
  }

  function setError(message = "") {
    errorBox.textContent = message;
  }

  function setSuccess(message = "") {
    successBox.textContent = message;
    successBox.classList.toggle("is-visible", Boolean(message));
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError(copy.missingFields);
      return;
    }

    if (!isValidEmail(email)) {
      setError(copy.invalidEmail);
      return;
    }

    button.disabled = true;
    button.textContent = copy.loading;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(copy.invalidLogin);
        return;
      }
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Gallery login error:", error);
      setError(copy.unexpected);
    } finally {
      button.disabled = false;
      button.textContent = copy.submit;
    }
  }

  async function handleForgotPassword() {
    const email = emailInput.value.trim();

    setError("");
    setSuccess("");

    if (!email) {
      setError(copy.forgotMissing);
      return;
    }

    if (!isValidEmail(email)) {
      setError(copy.invalidEmail);
      return;
    }

    forgotButton.disabled = true;
    forgotButton.textContent = copy.forgotLoading;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
      if (error) {
        setError(copy.unexpected);
        return;
      }
      setSuccess(copy.forgotSuccess);
    } catch (error) {
      console.error("Gallery forgot password error:", error);
      setError(copy.unexpected);
    } finally {
      forgotButton.disabled = false;
      forgotButton.textContent = copy.forgot;
    }
  }

  button.addEventListener("click", handleLogin);
  forgotButton.addEventListener("click", handleForgotPassword);

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") handleLogin();
    });
  });
});
