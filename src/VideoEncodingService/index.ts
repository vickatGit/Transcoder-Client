import express from "express";
import { config } from "dotenv";
import routes from "./routes/routes";
import { createClient } from "redis";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import AWS from "aws-sdk";
import { configObject } from "./credentials";
import { dbConnect } from "./dbConnect";
import {
  SQSClient,
  DeleteMessageCommand,
  DeleteMessageCommandInput,
} from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import { VideoModel } from "./videoModel";
config();

const queueUrl =
  "https://sqs.ap-south-1.amazonaws.com/332174178835/TranscodingJobQueue.fifo";
const sqsClient = new SQSClient(configObject);
const s3 = new AWS.S3(configObject);
const redisClient = createClient({
  password: `${process.env.REDIS_CLOUD_PASSWORD}`,
  socket: {
    host: `${process.env.REDIS_CLOUD_HOST}`,
    port: parseInt(`${process.env.REDIS_CLOUD_PORT}`),
  },
});

ffmpeg.setFfmpegPath(ffmpegPath.path);
AWS.config.update(configObject);

const app = express();
const port = process.env.PORT || 80;
app.use(express.json());
app.use("/", routes);

type VideoCodec = {
  resolution: string;
  folder: string;
  videoBitrate: string;
};

//Resoltions
const videoCodecs: VideoCodec[] = [
  { resolution: "256x144", folder: "144p", videoBitrate: "80" },
  { resolution: "426x240", folder: "240p", videoBitrate: "700" },
  { resolution: "640x360", folder: "360p", videoBitrate: "1000" },
  { resolution: "854x480", folder: "480p", videoBitrate: "2500" },
  { resolution: "1280x720", folder: "720p", videoBitrate: "5000" },
  { resolution: "1920x1080", folder: "1080p", videoBitrate: "8000" },
];

app.listen(port, async () => {
  console.log("checking new version is uploaded or not")
  try {
    let videoPath: string = extractPath(`${process.env.path}`);
    let promises: Promise<string>[] = [];

    const sqsMessageReceipientHandle: string = extractPath(
      `${process.env.receiptHandle}`
    );
    console.log("path : ", videoPath);
    console.log("videopath : ", extractPath(`${videoPath}`));

    try {
      await dbConnect();
      await redisClient.connect();
      await redisClient.incr("server_count");
      await redisClient.quit();
    } catch (error) {
      console.log("redis", error);
    }

    // videoPath = "temp/Mikasa x Eren _ Dandelions.mp4";

    const { fileName, extension } = separateFileNameAndExtension(videoPath);
    const videoObjectParams = {
      Bucket: "transcoder-proj-bucket",
      Key: videoPath,
    };

    let videoStream = await s3.getObject(videoObjectParams).createReadStream();
    const localVideoFolder = `./temp/local`;
    const localVideoFilePath = `./temp/local/${fileName}.${extension}`;

    try {
      await createFile(localVideoFolder);
      console.log("file");
      const videoWriteStream = fs.createWriteStream(localVideoFilePath);
      videoStream.pipe(videoWriteStream);
      videoWriteStream
        .on("finish", async () => {
          console.log("file downloaded");
          videoCodecs.forEach((videoCodec: VideoCodec) => {
            try {
              const folderPath = `./temp/${videoCodec.folder}`;
              if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`Created folder: ${folderPath}`);
              } else {
                console.log(`Folder already exists: ${folderPath}`);
              }
            } catch (error) {
              console.log("mkdir error ", error);
            }
            const vidTrancodingPromice = transcodeVideo(
              localVideoFilePath,
              videoCodec,
              fileName,
              extension
            );
            promises.push(vidTrancodingPromice);
          });
          await Promise.all(promises);
          await deleteMessageFromSqs(sqsMessageReceipientHandle, queueUrl);
          endTask();
        })

        .on("error", (err: any, stdout: any, stderr: any) => {
          console.error("Downloading Error:", {
            message: err.message,
            stdout: stdout,
            stderr: stderr,
            stage: "Downloading", // Replace with context-specific stage
          });
          endTask();
        });
    } catch (error) {
      console.log("mkdir error ", error);
    }
  } catch (error) {
    console.log("catch error ", error);
    endTask();
  }
});

async function endTask() {
  try {
    await redisClient.connect();
    await redisClient.decr("server_count");
    await redisClient.quit();
  } catch (error) {
    console.log("redis", error);
  }
  process.exit(0);
}
function extractPath(inputString: String) {
  const tempIndex = inputString.indexOf("temp/");
  if (tempIndex !== -1) {
    return inputString.substring(tempIndex);
  }
  return ""; // 'temp/' not found in the input string
}

function separateFileNameAndExtension(filePath: string): {
  fileName: string;
  extension: string;
} {
  const lastSlashIndex = filePath.lastIndexOf("/");
  const fileNameWithExtension =
    lastSlashIndex !== -1 ? filePath.substring(lastSlashIndex + 1) : filePath;

  const lastDotIndex = fileNameWithExtension.lastIndexOf(".");
  const fileName =
    lastDotIndex !== -1
      ? fileNameWithExtension.substring(0, lastDotIndex)
      : fileNameWithExtension;
  const extension =
    lastDotIndex !== -1
      ? fileNameWithExtension.substring(lastDotIndex + 1)
      : "";

  return { fileName, extension };
}
async function deleteVideoFile(
  videoCodec: VideoCodec,
  fileName: string,
  extension: string
) {
  try {
    fs.unlinkSync(`./temp/${videoCodec.folder}/${fileName}.${extension}`);
    console.log(
      `File ${videoCodec.folder}/${fileName}.${extension} has been deleted successfully.`
    );
  } catch (err) {
    console.error(
      `Error deleting file ${videoCodec.folder}/${fileName}.${extension}: ${err}`
    );
  }
}

async function uploadeVideoToS3(
  videoCodec: VideoCodec,
  fileName: string,
  extension: string
) {
  const s3Params: AWS.S3.PutObjectRequest = {
    Bucket: "transcoder-proj-bucket",
    Key: `${videoCodec.folder}/${fileName}.${extension}`,
    Body: fs.createReadStream(
      `./temp/${videoCodec.folder}/${fileName}.${extension}`
    ),
  };
  try {
    const uploadResult = await s3.upload(s3Params).promise();
    console.log(`Video uploaded to S3: ${uploadResult.Location}`);
  } catch (uploadError) {
    console.error("Error uploading to S3:", uploadError);
  }
}

function deleteMessageFromSqs(receiptHandle: string, queueUrl: string) {
  if (receiptHandle) {
    const deleteSqsMessageParams: DeleteMessageCommandInput = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };
    try {
      sqsClient.send(new DeleteMessageCommand(deleteSqsMessageParams));
    } catch (error) {
      console.log("Error deleting message from SQS ", error);
    }
  }
}
function createFile(folderPath: string): Promise<String> {
  return new Promise<string>((resolve, reject) => {
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folderPath}`);
        resolve("Folder Created");
      } else {
        console.log(`Folder already exists: ${folderPath}`);
        resolve("Folder Already Exists");
      }
    } catch (error) {
      console.log(" mkdir error ", error);
      reject("Failed to create ");
    }
  });
}
function transcodeVideo(
  localVideoFilePath: string,
  videoCodec: VideoCodec,
  fileName: string,
  extension: string
): Promise<string> {
  return new Promise<string>((resolve) => {
    ffmpeg(localVideoFilePath)
      .format(`${extension}`) // Set the correct format if not automatically determined
      .videoCodec("libx264")
      .audioCodec("aac")
      .videoBitrate(`${videoCodec.videoBitrate}`)
      .size(`${videoCodec.resolution}`)
      .on("start", async() => {
        console.log("Transcoding Started")
        await saveResolutionToDB(fileName,videoCodec,'',"Started");
      })
      .on("end", async () => {
        console.log("Transcoding Ended");
        await uploadeVideoToS3(videoCodec, fileName, extension);
        await saveResolutionToDB(fileName,videoCodec,'',"DONE");
        await deleteVideoFile(videoCodec, fileName, extension);
        resolve("");
      })
      .on("error", async (err: any, stdout: any, stderr: any) => {
        console.error("Transcoding Error:", {
          message: err.message,
          stdout: stdout,
          stderr: stderr,
          stage: "Encoding", // Replace with context-specific stage
        });
        resolve("");
      })
      .output(`./temp/${videoCodec.folder}/${fileName}.${extension}`)
      .run();
  });
}

async function saveResolutionToDB(fileName: string,videoCodec:VideoCodec,url:string,status:string) {
  // fileName='658452c5d0b0f3b208264fd6'
  const vidResolution = {
    resolution: `${videoCodec.folder}`, // Example resolution value
    url: url || '', // Example URL
    status: status || 'Started'
  }
  try{
    await VideoModel.updateOne({ _id: fileName }, { $pull: {resolutions:{ resolution:vidResolution.resolution}} } );
    await VideoModel.updateOne({ _id: fileName }, { $addToSet : {resolutions:vidResolution} } );
  }catch(err){
    console.log("failed to update the resoltion ", err)
  }
}
