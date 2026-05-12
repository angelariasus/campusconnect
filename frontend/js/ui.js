export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const showToast = (message) => {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
};

export const setLoading = (container, isLoading) => {
  if (!container) return;
  if (isLoading) {
    container.innerHTML = "<p class=\"muted\">Cargando...</p>";
  }
};

export const renderCursos = (container, cursos = []) => {
  if (!container) return;
  if (!cursos.length) {
    container.innerHTML = "<p class=\"muted\">Sin cursos matriculados.</p>";
    return;
  }
  container.innerHTML = cursos.map(curso => `
    <article class="item-card">
      <div class="item-row">
        <h4>${curso.nombre}</h4>
        <span class="badge">${curso.codigo}</span>
      </div>
      <p class="muted">${curso.descripcion || "Sin descripcion"}</p>
      <p class="muted">Docente: ${curso.docente || "-"}</p>
      <p class="muted">Creditos: ${curso.creditos ?? "-"} | Semestre: ${curso.semestre || "-"}</p>
    </article>
  `).join("");
};

export const renderTareas = (container, tareas = []) => {
  if (!container) return;
  if (!tareas.length) {
    container.innerHTML = "<p class=\"muted\">No hay tareas por mostrar.</p>";
    return;
  }
  container.innerHTML = tareas.map(tarea => `
    <article class="item-card">
      <div class="item-row">
        <div>
          <h4>${tarea.titulo}</h4>
          <p class="muted">${tarea.curso?.nombre || ""}</p>
        </div>
        <span class="badge">${tarea.entrega_estado}</span>
      </div>
      <p class="muted">Entrega: ${new Date(tarea.fecha_entrega).toLocaleString()}</p>
      <p class="muted">Puntaje max: ${tarea.puntaje_max}</p>
      ${tarea.vencida ? "<p class=\"error\">Vencida</p>" : ""}
    </article>
  `).join("");
};

export const renderMateriales = (container, materiales = [], onDownload) => {
  if (!container) return;
  if (!materiales.length) {
    container.innerHTML = "<p class=\"muted\">Sin materiales disponibles.</p>";
    return;
  }
  container.innerHTML = materiales.map(material => `
    <article class="item-card">
      <div class="item-row">
        <div>
          <h4>${material.titulo}</h4>
          <p class="muted">${material.curso?.nombre || ""}</p>
        </div>
        <span class="badge">${material.tipo}</span>
      </div>
      <p class="muted">${material.descripcion || "Sin descripcion"}</p>
      <p class="muted">${material.nombre_archivo || "-"}</p>
      <button class="ghost" data-material="${material.id}">Abrir</button>
    </article>
  `).join("");

  container.querySelectorAll("button[data-material]").forEach(button => {
    button.addEventListener("click", () => onDownload(button.dataset.material));
  });
};

export const renderNotas = (container, notas = []) => {
  if (!container) return;
  if (!notas.length) {
    container.innerHTML = "<p class=\"muted\">Sin notas disponibles.</p>";
    return;
  }
  container.innerHTML = notas.map(curso => `
    <article class="item-card">
      <div class="item-row">
        <div>
          <h4>${curso.curso?.nombre || "Curso"}</h4>
          <p class="muted">Promedio: ${curso.promedio} (${curso.aprobado ? "Aprobado" : "Desaprobado"})</p>
        </div>
        <span class="badge">${curso.curso?.codigo || ""}</span>
      </div>
      <div class="stack">
        ${curso.evaluaciones.map(ev => `
          <div class="item-row">
            <div>
              <p>${ev.tarea?.titulo || "Evaluacion"}</p>
              <p class="muted">${ev.puntaje} / ${ev.puntaje_max}</p>
            </div>
            <span class="badge">${ev.tarea?.tipo || ""}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
};

export const renderNotificaciones = (container, notifs = [], onRead) => {
  if (!container) return;
  if (!notifs.length) {
    container.innerHTML = "<p class=\"muted\">No hay notificaciones.</p>";
    return;
  }
  container.innerHTML = notifs.map(notif => `
    <article class="item-card">
      <div class="item-row">
        <div>
          <h4>${notif.titulo || "Notificacion"}</h4>
          <p class="muted">${notif.mensaje || ""}</p>
        </div>
        <span class="badge">${notif.leida ? "Leida" : "Nueva"}</span>
      </div>
      <p class="muted">${new Date(notif.created_at).toLocaleString()}</p>
      ${notif.leida ? "" : `<button class=\"ghost\" data-notif=\"${notif.id}\">Marcar leida</button>`}
    </article>
  `).join("");

  container.querySelectorAll("button[data-notif]").forEach(button => {
    button.addEventListener("click", () => onRead(button.dataset.notif));
  });
};

export const renderPerfil = (container, user) => {
  if (!container) return;
  if (!user) {
    container.innerHTML = "<p class=\"muted\">Sin datos disponibles.</p>";
    return;
  }
  container.innerHTML = `
    <h4>${user.nombres} ${user.apellidos}</h4>
    <p class="muted">Correo: ${user.email}</p>
    <p class="muted">Codigo: ${user.codigo}</p>
  `;
};
