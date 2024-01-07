import mongoose from "mongoose";
import {config} from "dotenv"
config()

export const dbConnect =async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGOOSE_DB_URL}`)
        console.log("connection made to db successfully")
        console.log(`Host :- ${connection.connection.host}`)
        console.log(`Port :- ${connection.connection.port}`)
    } catch (error) {
        console.log("Error with Connecting to database",error)
        process.exit()
    }
    
}