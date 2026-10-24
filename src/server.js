import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "koreExpense API" }));
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`koreExpense API running on port ${port}`));
