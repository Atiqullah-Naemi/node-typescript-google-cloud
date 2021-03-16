import express, { Application, Request, NextFunction, Response } from "express";
import { Firestore } from "@google-cloud/firestore";
import Multer from "multer";
import { format } from "util";
import { Storage } from "@google-cloud/storage";
import * as dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create a new client
const db = new Firestore();

// Creates a client
const storage = new Storage();
const bucket = storage.bucket(<string>process.env.CLOUD_BUCKET_ID);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({ message: "working app" });
});

app.post(
  "/upload",
  multer.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      next(err);
    });

    blobStream.on("finish", () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      return res.status(200).send(publicUrl);
    });

    blobStream.end(req.file.buffer);
  }
);

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

app.post("/", async (req: Request, res: Response) => {
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
