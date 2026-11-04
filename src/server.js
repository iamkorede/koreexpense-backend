import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "koreExpense API" }));
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`koreExpense API running on port ${port}`));
