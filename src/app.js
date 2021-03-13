const express = require("express");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
const PORT = process.env.PORT || 8080;

// Create a new client
const db = new Firestore();

app.get("/", (req, res) => {
  res.status(200).send({ message: "working app" });
});

app.get("/:breed", async (req, res) => {
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
    name: req.params.name,
    origin: req.params.origin,
    lifeExpectacy: req.params.lifeExpectacy,
    type: req.params.type,
  };

  await db.collection("dogs").doc().set(data);

  res.status(200).send({ success: true, data: { dogs: data } });
});

app.listen(PORT, () => console.log(`app running on ${PORT}`));
