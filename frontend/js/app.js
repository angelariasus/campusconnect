import { apiFetch, downloadFile } from "./api.js";
import { getApiBase, setApiBase } from "./config.js";
import { getToken, setToken, getUser, setUser, clearSession } from "./state.js";
import {
  qs,
  qsa,
  showToast,
  setLoading,
  renderCursos,
  renderTareas,
  renderMateriales,
  renderNotas,
  renderNotificaciones,
  renderPerfil,
} from "./ui.js";

const loginSection = qs("#login-section");
const appSection = qs("#app-section");
const loginForm = qs("#login-form");
const loginError = qs("#login-error");
const userName = qs("#user-name");
const userMeta = qs("#user-meta");
const metricCursos = qs("#metric-cursos");
const metricTareas = qs("#metric-tareas");
const metricNotifs = qs("#metric-notifs");
const cursosList = qs("#cursos-list");
const tareasList = qs("#tareas-list");
const materialesList = qs("#materiales-list");
const notasList = qs("#notas-list");
const notifsList = qs("#notifs-list");
const perfilCard = qs("#perfil-card");

const tareasEstado = qs("#tareas-estado");
const tareasCurso = qs("#tareas-curso");
const materialesCurso = qs("#materiales-curso");
const materialesTipo = qs("#materiales-tipo");
const notasCurso = qs("#notas-curso");
const notifsLeida = qs("#notifs-leida");

const settingsDialog = qs("#settings-dialog");
const apiBaseInput = qs("#api-base-input");

let cursosCache = [];

const toggleView = (isLoggedIn) => {
  loginSection.classList.toggle("hidden", isLoggedIn);
  appSection.classList.toggle("hidden", !isLoggedIn);
};

const setUserHeader = (user) => {
  if (!user) return;
  userName.textContent = `${user.nombres} ${user.apellidos}`;
  userMeta.textContent = `${user.email} | ${user.codigo}`;
  renderPerfil(perfilCard, user);
};

const loadCursos = async () => {
  setLoading(cursosList, true);
  const data = await apiFetch("/cursos");
  cursosCache = data.data || [];
  renderCursos(cursosList, cursosCache);
  metricCursos.textContent = cursosCache.length;
  fillCursoFilters(cursosCache);
};

const loadTareas = async () => {
  setLoading(tareasList, true);
  const params = new URLSearchParams();
  if (tareasEstado.value) params.set("estado", tareasEstado.value);
  if (tareasCurso.value) params.set("curso_id", tareasCurso.value);
  const data = await apiFetch(`/tareas?${params.toString()}`);
  renderTareas(tareasList, data.data || []);
  metricTareas.textContent = data.total || 0;
};

const loadMateriales = async () => {
  setLoading(materialesList, true);
  const params = new URLSearchParams();
  if (materialesCurso.value) params.set("curso_id", materialesCurso.value);
  if (materialesTipo.value) params.set("tipo", materialesTipo.value);
  const data = await apiFetch(`/materiales?${params.toString()}`);
  renderMateriales(materialesList, data.data || [], async (id) => {
    try {
      await downloadFile(`/materiales/${id}/descargar`);
    } catch (error) {
      showToast(error.message);
    }
  });
};

const loadNotas = async () => {
  setLoading(notasList, true);
  const params = new URLSearchParams();
  if (notasCurso.value) params.set("curso_id", notasCurso.value);
  const data = await apiFetch(`/notas?${params.toString()}`);
  renderNotas(notasList, data.data || []);
};

const loadNotificaciones = async () => {
  setLoading(notifsList, true);
  const params = new URLSearchParams();
  if (notifsLeida.value) params.set("leida", notifsLeida.value);
  const data = await apiFetch(`/notificaciones?${params.toString()}`);
  renderNotificaciones(notifsList, data.data || [], async (id) => {
    await apiFetch(`/notificaciones/${id}/leer`, { method: "PATCH" });
    showToast("Notificacion marcada.");
    loadNotificaciones();
  });
  metricNotifs.textContent = data.no_leidas ?? 0;
};

const loadPerfil = async () => {
  const data = await apiFetch("/auth/me");
  setUser(data.data);
  setUserHeader(data.data);
};

const fillCursoFilters = (cursos) => {
  const options = ["<option value=\"\">Todos los cursos</option>"]
    .concat(cursos.map(c => `<option value=\"${c.id}\">${c.nombre}</option>`));

  [tareasCurso, materialesCurso, notasCurso].forEach(select => {
    select.innerHTML = options.join("");
  });
};

const initTabs = () => {
  qsa(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      qsa(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const key = tab.dataset.tab;
      qsa(".tab-panel").forEach(panel => panel.classList.add("hidden"));
      qs(`#tab-${key}`).classList.remove("hidden");
    });
  });
};

const initFilters = () => {
  tareasEstado.addEventListener("change", loadTareas);
  tareasCurso.addEventListener("change", loadTareas);
  materialesCurso.addEventListener("change", loadMateriales);
  materialesTipo.addEventListener("change", loadMateriales);
  notasCurso.addEventListener("change", loadNotas);
  notifsLeida.addEventListener("change", loadNotificaciones);
  qs("#btn-refresh-cursos").addEventListener("click", loadCursos);
  qs("#btn-notifs-leer").addEventListener("click", async () => {
    await apiFetch("/notificaciones/leer-todas", { method: "PATCH" });
    showToast("Notificaciones actualizadas.");
    loadNotificaciones();
  });
};

const initSettings = () => {
  qs("#btn-open-settings").addEventListener("click", () => {
    apiBaseInput.value = getApiBase();
    settingsDialog.showModal();
  });

  qs("#btn-save-api").addEventListener("click", () => {
    setApiBase(apiBaseInput.value.trim());
    showToast("API actualizada.");
  });
};

const initAuth = () => {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";
    const email = qs("#login-email").value.trim();
    const password = qs("#login-password").value;

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      setToken(data.data.token);
      setUser(data.data.usuario);
      setUserHeader(data.data.usuario);
      toggleView(true);
      await loadInitial();
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

  qs("#btn-logout").addEventListener("click", async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    clearSession();
    toggleView(false);
  });
};

const loadInitial = async () => {
  await loadCursos();
  await loadTareas();
  await loadMateriales();
  await loadNotas();
  await loadNotificaciones();
  await loadPerfil();
};

const bootstrap = async () => {
  initTabs();
  initFilters();
  initSettings();
  initAuth();

  const token = getToken();
  if (token) {
    try {
      toggleView(true);
      await loadInitial();
    } catch (error) {
      showToast(error.message);
      clearSession();
      toggleView(false);
    }
  } else {
    toggleView(false);
  }
};

bootstrap();
