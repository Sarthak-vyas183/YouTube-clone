import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routes
import userRouter from "./routes/userRouter.js"
import videoRouter from "./routes/videoRouter.js"
import subscriptionRouter from "./routes/subscriptionRouter.js"
import tweetRouter from "./routes/tweetRouter.js"

app.use("/api/v1/user" , userRouter)
app.use("/api/v1/videos" ,videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/tweets", tweetRouter);


export { app }