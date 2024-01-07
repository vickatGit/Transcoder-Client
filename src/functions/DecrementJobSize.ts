import {createClient} from "redis"
import { config } from "dotenv";
config();
const client = createClient({
    password: `${process.env.REDIS_CLOUD_PASSWORD}`,
    socket: {
      host: `${process.env.REDIS_CLOUD_HOST}`,
      port: parseInt(`${process.env.REDIS_CLOUD_PORT}`),
    },
})

export const handler = async(event:any) => {
    const res = {
        statusCode:200,
        msg:"Job Size Decreamented successfully"
    }
    try {
        console.log("Decrement Job",event)
        await client.connect()
        await client.decr("job_size")   
        await client.quit()  
        console.log("dec")
    } catch (error) {
        console.log("error",error)
        return JSON.stringify(error)
    }
    return res
}