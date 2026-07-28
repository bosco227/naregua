import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "NaRégua API" });
});

app.get("/api/barbearias", async (_request, response, next) => {
  try {
    const [shops] = await pool.query(`
      SELECT b.id, b.nome_fantasia, b.endereco, b.latitude, b.longitude,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', p.id,
            'nome', p.nome,
            'foto_url', p.foto_url,
            'especialidade', p.especialidade,
            'bio', p.bio,
            'cortes_concluidos', (
              SELECT COUNT(*) FROM agendamentos a
              WHERE a.barbeiro_id = p.id AND a.status = 'concluido'
            )
          )
        ) AS barbeiros
      FROM barbearias b
      LEFT JOIN barbeiros p ON p.barbearia_id = b.id
      GROUP BY b.id
    `);
    response.json(shops);
  } catch (error) {
    next(error);
  }
});

app.get("/api/barbeiros/:id/disponibilidade", async (request, response, next) => {
  try {
    const { id } = request.params;
    const { data } = request.query;
    if (!data) return response.status(400).json({ erro: "Informe a data em YYYY-MM-DD." });

    const slots = ["09:00", "09:30", "10:30", "11:00", "14:00", "15:30", "17:00"];
    const [busy] = await pool.execute(
      `SELECT DATE_FORMAT(data_hora, '%H:%i') AS horario
       FROM agendamentos
       WHERE barbeiro_id = ? AND DATE(data_hora) = ?
         AND status IN ('pendente', 'confirmado')`,
      [id, data],
    );
    const occupied = new Set(busy.map((item) => item.horario));
    response.json({ data, horarios: slots.filter((slot) => !occupied.has(slot)) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/agendamentos", async (request, response, next) => {
  const { cliente_id, barbeiro_id, data_hora } = request.body;
  if (!cliente_id || !barbeiro_id || !data_hora) {
    return response.status(400).json({ erro: "cliente_id, barbeiro_id e data_hora são obrigatórios." });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO agendamentos (cliente_id, barbeiro_id, data_hora)
       VALUES (?, ?, ?)`,
      [cliente_id, barbeiro_id, data_hora],
    );
    response.status(201).json({ id: result.insertId, status: "pendente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ erro: "Este horário não está mais disponível." });
    }
    next(error);
  }
});

app.get("/api/clientes/:id/agendamentos", async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.id, a.data_hora, a.status, p.nome AS barbeiro,
              p.especialidade, b.nome_fantasia AS barbearia
       FROM agendamentos a
       JOIN barbeiros p ON p.id = a.barbeiro_id
       JOIN barbearias b ON b.id = p.barbearia_id
       WHERE a.cliente_id = ?
       ORDER BY a.data_hora DESC`,
      [request.params.id],
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/barbearias/:id/agenda", async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT a.id, a.data_hora, a.status, u.nome AS cliente,
              p.nome AS barbeiro, p.especialidade
       FROM agendamentos a
       JOIN users u ON u.id = a.cliente_id
       JOIN barbeiros p ON p.id = a.barbeiro_id
       WHERE p.barbearia_id = ?
       ORDER BY a.data_hora`,
      [request.params.id],
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/agendamentos/:id/status", async (request, response, next) => {
  const allowed = ["pendente", "confirmado", "concluido", "cancelado"];
  if (!allowed.includes(request.body.status)) {
    return response.status(400).json({ erro: "Status inválido." });
  }
  try {
    const [result] = await pool.execute(
      "UPDATE agendamentos SET status = ? WHERE id = ?",
      [request.body.status, request.params.id],
    );
    if (!result.affectedRows) return response.status(404).json({ erro: "Agendamento não encontrado." });
    response.json({ id: Number(request.params.id), status: request.body.status });
  } catch (error) {
    next(error);
  }
});

app.get("/api/barbearias/:id/clientes", async (request, response, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.nome, u.email, COUNT(a.id) AS visitas,
              MAX(a.data_hora) AS ultima_visita
       FROM users u
       JOIN agendamentos a ON a.cliente_id = u.id
       JOIN barbeiros p ON p.id = a.barbeiro_id
       WHERE p.barbearia_id = ? AND a.status = 'concluido'
       GROUP BY u.id
       ORDER BY visitas DESC`,
      [request.params.id],
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/barbearias/:id/promocoes", async (request, response) => {
  response.json({
    enviada: true,
    mensagem: request.body.mensagem || "Tem horário livre esperando por você!",
    destinatarios: 286,
    simulacao: true,
  });
});

app.use((error, _request, response, _next) => {
  void _next;
  console.error(error);
  response.status(500).json({ erro: "Erro interno. Tente novamente." });
});

const port = Number(process.env.PORT || 3333);
app.listen(port, () => console.log(`NaRégua API em http://localhost:${port}`));
