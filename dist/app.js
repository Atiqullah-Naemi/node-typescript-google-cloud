"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firestore_1 = require("@google-cloud/firestore");
const app = express_1.default();
const PORT = process.env.PORT || 8080;
// Create a new client
const db = new firestore_1.Firestore();
app.get("/", (req, res) => {
    res.status(200).send({ message: "working app" });
});
app.get("/:breed", async (req, res) => {
    const breed = req.params.breed;
    const query = db.collection("dogs").where("name", "==", breed);
    const querySnapshot = await query.get();
    if (querySnapshot.size > 0) {
        res.status(200).send({ data: querySnapshot.docs[0].data() });
    }
    else {
        res.status(200).send({ message: "Not Found" });
    }
});
app.listen(PORT, () => console.log(`app running on ${PORT}`));
