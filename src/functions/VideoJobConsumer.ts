import { AssignPublicIp, ECS, LaunchType } from "@aws-sdk/client-ecs";
import { createClient } from "redis";
import { config } from "dotenv";
import { SQSClient, ChangeMessageVisibilityCommand } from "@aws-sdk/client-sqs";
config();
const sqsClient = new SQSClient({
  region: `${process.env.MY_AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.MY_AWS_ACCESS_ID}`,
    secretAccessKey: `${process.env.MY_AWS_SECRET_ACCESS_KEY}`,
  },
}
);
const queueUrl = `${process.env.SQS_QUEUE_URL}`

const ecs = new ECS();
const redisClient = createClient({
  password: `${process.env.REDIS_CLOUD_PASSWORD}`,
  socket: {
    host: `${process.env.REDIS_CLOUD_HOST}`,
    port: parseInt(`${process.env.REDIS_CLOUD_PORT}`),
  },
});

export const handler = async (event:any) => {
  console.log("msgAttributes", event.Records[0].messageAttributes);
  try { await redisClient.connect();} catch (error) { console.log("failed to connect to the redis ",error)}
  
  let serverCount
  try { serverCount=await redisClient.get("server_count") || 5 } catch (error) { console.log(error)}
  console.log("serverCount",serverCount)
   
  const receiptHandle = event.Records[0].receiptHandle;

  console.log("eveent : ", event);
  const taskParams = {
    cluster: "arn:aws:ecs:ap-south-1:332174178835:cluster/trans-vid-cluster",
    launchType: LaunchType.FARGATE,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: AssignPublicIp.ENABLED,
        securityGroups: ["sg-08b7f15047256c2f0"],
        subnets: [
          "subnet-0ce961f573bb3970c",
          "subnet-025aa16eccaff00a9",
          "subnet-092bed5aa0496748f",
        ],
      },
    },
    taskDefinition:
      "arn:aws:ecs:ap-south-1:332174178835:task-definition/transcoder-task-new:6",
    overrides: {
      containerOverrides: [
        {
          name: "transcoder-image",
          environment: [
            {
              name: "path",
              value: `${event.Records[0].messageAttributes.path.stringValue}`,
            },
            {
              name: "receiptHandle",
              value: `${receiptHandle}`,
            },
          ],
        },
      ],
    },
  };

  if (serverCount) {
    try {
      const count = parseInt(serverCount+"", 5);
      if (count < 5) {
        const client = await ecs.runTask(taskParams);
        console.log("client cconnection to the ECS ", client);
      } else {
        if (receiptHandle && queueUrl) {
          const sqsMsgVisiblityParams = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: 600,
          };
          try {
            await sqsClient.send(new ChangeMessageVisibilityCommand(sqsMsgVisiblityParams));
            console.log(
              "Can't Spin up the ECS Container dut to heavy Traffic changing the visibility of sqs messga with receiptHandle ",
              receiptHandle
            );
          } catch (error) {
            console.log(`Error in Changing visibilty of SQS message ${receiptHandle}`,error)
          }
          
          
        }
        console.log("Heavy Traffic")
      }
    } catch (error) {
      console.log("Some Error Occurred ", error);
    }
  }else{
    console.log("cant fetch server count",serverCount)
  }
  try {
    redisClient.quit();
  } catch (error) {
    console.log("failed to quit the redisclient ",error)
  }
  console.log('finish')
  
};
