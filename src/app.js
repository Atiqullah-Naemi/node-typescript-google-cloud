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
    res.status(200).send({ data: querySnapshot.docs[0].data() });
  } else {
    res.status(200).send({ message: "Not Found" });
  }
});

app.listen(PORT, () => console.log(`app running on ${PORT}`));
