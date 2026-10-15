import { useState } from "react";

export default function Tarea({ tarea, onEliminar, onToggle, onEditar }) {
  const [editando, setEditando] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState(tarea.titulo);

  function confirmarEdicion() {
    const titulo = nuevoTitulo.trim();
    if (titulo && titulo !== tarea.titulo) {
      onEditar(tarea.id, titulo);
    } else {
      setNuevoTitulo(tarea.titulo); // revertir si está vacío o sin cambios
    }
    setEditando(false);
  }

  function manejarTecla(e) {
    if (e.key === "Enter") confirmarEdicion();
    if (e.key === "Escape") {
      setNuevoTitulo(tarea.titulo);
      setEditando(false);
    }
  }

  return (
    <li className={tarea.completada ? "tarea completada" : "tarea"}>
      {editando ? (
        <input
          className="input-editar"
          value={nuevoTitulo}
          onChange={(e) => setNuevoTitulo(e.target.value)}
          onBlur={confirmarEdicion}
          onKeyDown={manejarTecla}
          autoFocus
        />
      ) : (
        <span
          onClick={onToggle}
          onDoubleClick={() => !tarea.completada && setEditando(true)}
          title="Clic para completar · Doble clic para editar"
        >
          {tarea.titulo}
        </span>
      )}
      <button onClick={onEliminar} className="btn-eliminar" title="Eliminar">
        🗑️
      </button>
    </li>
  );
}
