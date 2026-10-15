import { useEffect, useState } from "react";
import Formulario from "./components/Formulario.jsx";
import ListaTareas from "./components/ListaTareas.jsx";

const API = "http://localhost:3001/api/tareas";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("No se pudieron cargar las tareas");
      setTareas(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function agregarTarea(titulo) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo }),
    });
    const nueva = await res.json();
    setTareas((prev) => [...prev, nueva]);
  }

  async function eliminarTarea(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTareas((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleTarea(id) {
    const tarea = tareas.find((t) => t.id === id);
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada: !tarea.completada }),
    });
    const actualizada = await res.json();
    setTareas((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
  }

  // 🥇 Editar título
  async function editarTarea(id, nuevoTitulo) {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: nuevoTitulo }),
    });
    const actualizada = await res.json();
    setTareas((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
  }

  // 🥈 Eliminar todas las completadas
  async function eliminarCompletadas() {
    const completadas = tareas.filter((t) => t.completada);
    await Promise.all(
      completadas.map((t) => fetch(`${API}/${t.id}`, { method: "DELETE" }))
    );
    setTareas((prev) => prev.filter((t) => !t.completada));
  }

  if (cargando) return <p className="estado">Cargando...</p>;
  if (error) return <p className="estado">❌ {error}</p>;

  // 🥉 Contador
  const completadas = tareas.filter((t) => t.completada).length;
  const total = tareas.length;

  return (
    <main className="contenedor">
      <h1>✅ Mis tareas</h1>
      <Formulario onAgregar={agregarTarea} />

      {/* 🥉 Contador */}
      {total > 0 && (
        <p className="contador">
          {completadas} de {total} tareas completadas
        </p>
      )}

      {/* 🥈 Botón eliminar completadas */}
      {completadas > 0 && (
        <button className="btn-eliminar-completadas" onClick={eliminarCompletadas}>
          🗑️ Eliminar completadas ({completadas})
        </button>
      )}

      <ListaTareas
        tareas={tareas}
        onEliminar={eliminarTarea}
        onToggle={toggleTarea}
        onEditar={editarTarea}
      />
    </main>
  );
}
