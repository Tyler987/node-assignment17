const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect(
    "mongodb+srv://tylerkorth12:Harpswell0!@tyler.mfrtbgb.mongodb.net/"
  )
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const workoutSchema = new mongoose.Schema({
    name: String,
    description: String,
    exercises: [String],
    img: String,
  });
  
  const Workout = mongoose.model("Workout", workoutSchema);


  app.get("/api/workouts", (req, res) => {
    getWorkouts(res);
  });

  const getWorkouts = async (res) => {
    const workouts = await Workout.find();
    res.send(workouts);
  };


app.post("/api/workouts", upload.single("img"), (req, res) => {
    const result = validateWorkout(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const workout = new Workout({
        name: req.body.name,
        description: req.body.description,
        exercises: req.body.exercises.split(","),
      });
    
      if (req.file) {
        workout.img = "images/" + req.file.filename;
      }
    
      createWorkout(workout, res);
    });

app.put("/api/workouts/:id", upload.single("img"), (req, res) => {
        const result = validateWorkout(req.body);
      
        if (result.error) {
          res.status(400).send(result.error.details[0].message);
          return;
        }
      
        updateWorkout(req, res);
      });

      const updateWorkout = async (req, res) => {
        let fieldsToUpdate = {
          name: req.body.name,
          description: req.body.description,
          exercises: req.body.exercises.split(","),
        };
      
        if (req.file) {
          fieldsToUpdate.img = "images/" + req.file.filename;
        }
      
        const result = await Workout.updateOne({ _id: req.params.id }, fieldsToUpdate);
        const workout = await Workout.findById(req.params.id);
        res.send(workout);
      };
      
      app.delete("/api/workouts/:id", upload.single("img"), (req, res) => {
        removeWorkout(res, req.params.id);
      });
      
      const removeWorkout = async (res, id) => {
        const workout = await Workout.findByIdAndDelete(id);
        res.send(workout);
      };
      
      const validateWorkout = (workout) => {
        const schema = Joi.object({
          _id: Joi.allow(""),
          exercises: Joi.allow(""),
          name: Joi.string().min(3).required(),
          description: Joi.string().min(3).required(),
        });
      
        return schema.validate(workout);
      };
      
      app.listen(3000, () => {
        console.log("I'm listening");
      });