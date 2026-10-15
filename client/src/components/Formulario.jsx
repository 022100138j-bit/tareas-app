import { useState } from "react";

export default function Formulario({ onAgregar }) {
  const [titulo, setTitulo] = useState("");

  function manejarEnvio(e) {
    e.preventDefault();          // evita que la pagina se recargue
    if (!titulo.trim()) return;  // no permitir tareas vacias
    onAgregar(titulo.trim());
    setTitulo("");               // limpiar el input
  }

  return (
    <form onSubmit={manejarEnvio} className="formulario">
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
}
