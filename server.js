const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

let todos = []

// ดึงรายการทั้งหมด
app.get("/todos", (req, res) => {
  res.json(todos)
})

// เพิ่มรายการใหม่
app.post("/todos", (req, res) => {
  const task = req.body.task
  todos.push(task)
  res.json({ message: "added" })
})

// ลบรายการ
app.delete("/todos/:index", (req, res) => {
  const i = parseInt(req.params.index)
  todos.splice(i, 1)
  res.json({ message: "deleted" })
})

// อัปเดตรายการ
app.put("/todos/:index", (req, res) => {
  const i = parseInt(req.params.index)
  todos[i] = req.body.task
  res.json({ message: "updated" })
})

app.listen(3000, () => {
  console.log("Server running on port 3000")
})