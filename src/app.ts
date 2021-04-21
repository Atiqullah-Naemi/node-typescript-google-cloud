import express, { Application, Request, NextFunction, Response } from "express";
import { Firestore } from "@google-cloud/firestore";
import Multer from "multer";
import { format } from "util";
import { Storage } from "@google-cloud/storage";
import * as dotenv from "dotenv";
import path from "path";

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
const db = new Firestore({
  projectId: "gcloud-practice-303820",
  keyFilename: path.join(__dirname, "./cloud_key.json"),
});

// Creates a client
const storage = new Storage({
  keyFilename: path.join(__dirname, "./cloud_key.json"),
});
const bucket = storage.bucket(<string>process.env.CLOUD_BUCKET_ID);

const imageUpload = (file: any) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    const blob = bucket.file(originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      resolve(publicUrl);
    });

    blobStream.end(buffer);
  });

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({ message: "working app..." });
});

app.post(
  "/upload",
  multer.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).send("No file uploaded.");
      return;
    }

    const imageUrl = await imageUpload(req.file);

    console.log({ imageUrl });

    const data = {
      name: req.body.name,
      origin: req.body.origin,
      lifeExpectacy: req.body.lifeExpectacy,
      type: req.body.type,
      imageUrl,
    };

    await db.collection("dogs").doc().set(data);

    res.status(200).send({ success: true, data: { dogs: data } });
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
  console.log({ req });

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
