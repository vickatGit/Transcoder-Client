import {createClient} from "redis"
import {SQSClient, SendMessageBatchCommandInput, SendMessageCommand, SendMessageCommandInput} from '@aws-sdk/client-sqs'
import { config } from "dotenv";
config();
const sqsClient = new SQSClient({
    region: `${process.env.MY_AWS_REGION}`,
    credentials: {
      accessKeyId: `${process.env.MY_AWS_ACCESS_ID}`,
      secretAccessKey: `${process.env.MY_AWS_SECRET_ACCESS_KEY}`,
    },
  }
  )
const queueUrl = "https://sqs.ap-south-1.amazonaws.com/332174178835/video-transcoding-queue.fifo"

const client = createClient({
    password: `${process.env.REDIS_CLOUD_PASSWORD}`,
    socket: {
      host: `${process.env.REDIS_CLOUD_HOST}`,
      port: parseInt(`${process.env.REDIS_CLOUD_PORT}`),
    },
})



export const handler = async(event:any) => {
    await client.connect()
    // console.log("event ",event.Records[0].s3.object.key)
    await client.incr("job_size")   
    const res = {
        statusCode:200,
        msg:"Job Size Decremented successfully"
    }
    try {
        
        const msg:SendMessageCommandInput = {
            QueueUrl:queueUrl,
            MessageBody:"S3 msg",
            MessageGroupId:`temp/${Math.random()}`,
            MessageDeduplicationId:`${new Date().getTime()}`,
            MessageAttributes:{
                "path":{
                    DataType: "String",
                    StringValue:event.Records[0].s3.object.key
                }
            }
            
        }
        const sendMessageCmd = new SendMessageCommand(msg)
        const result =  await sqsClient.send(sendMessageCmd)
        console.log("message push result ", result)
    } catch (error) {
        console.log("error :",error)
    }
    await client.quit()
    return res
}