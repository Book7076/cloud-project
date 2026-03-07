const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

let todos = []

app.get("/todos",(req,res)=>{
 res.json(todos)
})

app.post("/todos",(req,res)=>{
 const task=req.body.task
 todos.push(task)
 res.json({message:"added"})
})

app.listen(3000,()=>{
 console.log("Server running on port 3000")
})