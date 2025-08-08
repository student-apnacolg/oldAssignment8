const mongoose = require('mongoose')
const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config()
const PORT = 3233

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log("MongoDB connection error"))

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    required: true
  },
  priority: {
    type: String,
    required: true
  }
})

const Task = mongoose.model("Task", taskSchema)

let editIndex = -1;
let error = "";

// Get Todo List
app.get('/', async (req, res) => {
  const tasks = await Task.find()
  res.render("list", {tasks, editIndex, error})
  error = ''
})

app.post('/', async (req, res) => {
  const task = req.body.task?.trim();
  const priority = req.body.priority;

  const duplicate = await Task.findOne({text: task, priority})
  if (duplicate ) {
    error="This task already exists!"
    return res.redirect("/")
  }

  if (task && priority) {
    await Task.create({text: task, priority})
  }

  editIndex = null;
  res.redirect("/")
})

app.post('/delete', async (req, res) => {
  const deleteIndex = req.body.deleteIndex;
  await Task.deleteOne({_id: deleteIndex})
  editIndex = null
  res.redirect("/")
})

app.post("/start-edit", (req, res) => {
  editIndex = req.body.editIndex;
  res.redirect('/')
})

app.post('/edit', async (req, res) => {
  const updatedTask = req.body.updatedIndex?.trim();
  const updatedPriority = req.body.updatedPriority;
  if (updatedTask && updatedPriority && editIndex) {
    await Task.updateOne({_id: editIndex}, {
    $set: {
      text: updatedTask,
      priority: updatedPriority
    }
  })
  }
  editIndex = null
  res.redirect('/')
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})