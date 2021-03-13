import express, { Application, Request, Response } from "express";
import { Firestore } from "@google-cloud/firestore";

const app: Application = express();
const PORT = process.env.PORT || 8080;

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
    res.status(200).send({ data: querySnapshot.docs[0].data() });
  } else {
    res.status(200).send({ message: "Not Found" });
  }
});

app.listen(PORT, () => console.log(`app running on ${PORT}`));
