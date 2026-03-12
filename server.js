require("dotenv").config()

const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose')
const Port = 3000;
const OpenAI = require("openai")

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

mongoose.connect("mongodb+srv://Iamnoam_23:kingbr123@noam.cyi4okn.mongodb.net/recipesDB")
.then(() => {
    console.log("MongoDB connected")
})
.catch((err) => {
    console.log(err)
})

const recipeSchema = new mongoose.Schema({
    title: String,
    ingredients:[String],
    instructions: String
})

const Recipe = mongoose.model("Recipe", recipeSchema)

app.use(cors({
      origin: "http://localhost:5173"
}))

app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Server works " })
})


app.get("/all-recipes",async (req,res) => {
    const recipes = await Recipe.find()
    res.json(recipes)
})

app.post("/all-recipes" , async (req,res) => {
    const NewRecipe = await Recipe.create(req.body)
    res.json(NewRecipe)
})

app.delete("/all-recipes/:id", async (req,res) => {
    const id = req.params.id
    await Recipe.findByIdAndDelete(id)
    res.json({message:"recipe deleted"})
})


app.post("/generate-recipe", async (req, res) => {
  try {

    const { title, ingredients } = req.body

    const response = await client.responses.create({
  model: "gpt-4o-mini",
  input: `Write cooking instructions for ${title} using ${ingredients.join(", ")}. Maximum 30 words.`
})

const instructions = response.output_text
  .split(" ")
  .slice(0,30)
  .join(" ")

res.json({
  instructions
})

    res.json({
      instructions: response.output_text
    })

  } catch (error) {
  console.log("OPENAI ERROR:")
  console.log(error.message)
  console.log(error)

  res.status(500).json({ error: "GPT failed" })
  }
})

app.listen(Port,() => {
    console.log(`server is running on port ${Port}`)
})