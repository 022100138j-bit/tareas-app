require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ── Esquema Mongoose ──────────────────────────────────────────────────────────
const tareaSchema = new mongoose.Schema({
  titulo:     { type: String, required: true, trim: true },
  completada: { type: Boolean, default: false },
});

// Transforma _id → id en las respuestas JSON
tareaSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Tarea = mongoose.model("Tarea", tareaSchema);

// ── Conexión a MongoDB ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

if (!MONGODB_URI || MONGODB_URI.includes("<usuario>")) {
  console.warn("⚠️  MONGODB_URI no configurada. Usando datos en memoria.");
  usarMemoria();
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("✅ Conectado a MongoDB Atlas");
      registrarRutas();
      app.listen(PORT, () => console.log(`API corriendo en http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error("❌ Error conectando a MongoDB:", err.message);
      console.warn("⚠️  Usando datos en memoria como fallback.");
      usarMemoria();
    });
}

// ── Rutas con MongoDB ─────────────────────────────────────────────────────────
function registrarRutas() {
  // GET - Obtener todas las tareas
  app.get("/api/tareas", async (req, res) => {
    try {
      const tareas = await Tarea.find().sort({ _id: 1 });
      res.json(tareas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST - Crear una tarea
  app.post("/api/tareas", async (req, res) => {
    try {
      const { titulo } = req.body;
      if (!titulo || !titulo.trim()) {
        return res.status(400).json({ error: "El titulo es obligatorio" });
      }
      const nueva = await Tarea.create({ titulo: titulo.trim() });
      res.status(201).json(nueva);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT - Editar título y/o marcar como completada
  app.put("/api/tareas/:id", async (req, res) => {
    try {
      const cambios = {};
      if (req.body.titulo !== undefined) {
        const titulo = req.body.titulo.trim();
        if (!titulo) return res.status(400).json({ error: "El titulo no puede estar vacío" });
        cambios.titulo = titulo;
      }
      if (req.body.completada !== undefined) {
        cambios.completada = req.body.completada;
      }
      const actualizada = await Tarea.findByIdAndUpdate(
        req.params.id,
        cambios,
        { new: true, runValidators: true }
      );
      if (!actualizada) return res.status(404).json({ error: "Tarea no encontrada" });
      res.json(actualizada);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE - Eliminar una tarea
  app.delete("/api/tareas/:id", async (req, res) => {
    try {
      const eliminada = await Tarea.findByIdAndDelete(req.params.id);
      if (!eliminada) return res.status(404).json({ error: "Tarea no encontrada" });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ── Fallback: datos en memoria (si no hay MongoDB configurado) ────────────────
function usarMemoria() {
  let tareas = [
    { id: 1, titulo: "Aprender React", completada: false },
    { id: 2, titulo: "Conectar con Node.js", completada: false },
  ];
  let siguienteId = 3;

  app.get("/api/tareas", (req, res) => res.json(tareas));

  app.post("/api/tareas", (req, res) => {
    const { titulo } = req.body;
    if (!titulo || !titulo.trim())
      return res.status(400).json({ error: "El titulo es obligatorio" });
    const nueva = { id: siguienteId++, titulo: titulo.trim(), completada: false };
    tareas.push(nueva);
    res.status(201).json(nueva);
  });

  app.put("/api/tareas/:id", (req, res) => {
    const tarea = tareas.find((t) => t.id === Number(req.params.id));
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    if (req.body.titulo !== undefined) {
      const titulo = req.body.titulo.trim();
      if (!titulo) return res.status(400).json({ error: "El titulo no puede estar vacío" });
      tarea.titulo = titulo;
    }
    if (req.body.completada !== undefined) {
      tarea.completada = req.body.completada;
    } else if (req.body.titulo === undefined) {
      tarea.completada = !tarea.completada;
    }
    res.json(tarea);
  });

  app.delete("/api/tareas/:id", (req, res) => {
    const existe = tareas.some((t) => t.id === Number(req.params.id));
    if (!existe) return res.status(404).json({ error: "Tarea no encontrada" });
    tareas = tareas.filter((t) => t.id !== Number(req.params.id));
    res.status(204).send();
  });

  app.listen(PORT, () =>
    console.log(`API corriendo en http://localhost:${PORT} (modo memoria)`)
  );
}
