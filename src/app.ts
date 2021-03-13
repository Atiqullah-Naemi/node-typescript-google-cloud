import express, { Application, Request, Response } from "express";
import { Firestore } from "@google-cloud/firestore";

const app: Application = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
// Create a new client
const db = new Firestore();

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({ message: "working app" });
});

app.get("/:breed", async (req: Request, res: Response) => {
  const breed = req.params.breed;

  const query = db.collection("dogs").where("name", "==", breed);
  const querySnapshot = await query.get();

  if (querySnapshot.size > 0) {
    res.status(200).send({ success: true, data: querySnapshot.docs[0].data() });
  } else {
    res.status(200).send({ success: false, message: "Not Found" });
  }
});

app.post("/", async (req, res) => {
  const data = {
    name: req.body.name,
    origin: req.body.origin,
    lifeExpectacy: req.body.lifeExpectacy,
    type: req.body.type,
  };

  await db.collection("dogs").doc().set(data);

  res.status(200).send({ success: true, data: { dogs: data } });
});

app.listen(PORT, () => console.log(`app running on ${PORT}`));
