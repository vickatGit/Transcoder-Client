import express from "express"
import router from "./routes/videoRoutes"
import { dbConnect } from "./config/dbConnect"

const app:express.Application = express()
app.use(express.json())
app.use("/video/",router)

app.listen(8080,async() => {
    await dbConnect()
    console.log("application started running on port 8080 🚀🚀")
})


