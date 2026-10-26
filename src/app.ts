import express from "express";

const app = express();
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) throw error;

    console.log(`Express Node Template - listening on port ${PORT}!`);
})