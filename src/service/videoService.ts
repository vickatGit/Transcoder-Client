import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { VideoModel } from "../model/videoModel";
import { config } from "dotenv";
config();
const s3Client = new S3Client({
  region: `${process.env.MY_AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.MY_AWS_ACCESS_ID}`,
    secretAccessKey: `${process.env.MY_AWS_SECRET_ACCESS_KEY}`,
  },
});

type VideoResolutionModelType = {
  resolution: String;
  url: String;
  status: String;
};
type VideoModelType = {
  _id:String
  videoName: String;
  resolutions: VideoResolutionModelType[];
  belongsTo: any;
  ext: String;
};
export const GetVideoUploadingSigneddUrl = async (
  vid_title: String,
  vid_ext: String,
  userId: String
) => {
  const videoObj = await VideoModel.create({
    videoName: vid_title,
    belongsTo: userId,
    ext: vid_ext,
  });
  const command = new PutObjectCommand({
    Bucket: "transcoder-proj-bucket",
    Key: `temp/${videoObj._id}.${vid_ext}`,
    ContentType: `video/${vid_ext}`,
  });

  return await getSignedUrl(s3Client, command);
};

export const GetUserVideos = async (userId: string) => {
  const videos: VideoModelType[] = [];
  const userVideos: VideoModelType[] = await VideoModel.find({
    belongsTo: userId,
  });
  await Promise.all(
  userVideos.map(async (video: VideoModelType) => {
    const processedVideo: VideoModelType | undefined =
      await GetVideoPresignedUrls(video);
    if (processedVideo) videos.push(processedVideo);
  }))
  return videos;
};
const GetVideoPresignedUrls = async (
  video: VideoModelType
): Promise<VideoModelType | undefined> => {
  // video.videoName='Mikasa x Eren _ Dandelions'
    let videoResolutions: VideoResolutionModelType[] = [];
    await Promise.all(
    video.resolutions.map(async (resolution: VideoResolutionModelType) => {
      console.log("key : ",`${resolution.resolution}/${video.videoName}.${video.ext}`)
      const command = new GetObjectCommand({
        Bucket: "transcoder-proj-bucket",
        Key: `${resolution.resolution}/${video._id}.${video.ext}`,
      });
      const resolutionUrl: string = await getSignedUrl(s3Client, command);
      const processedResolution: VideoResolutionModelType = {
        resolution: resolution.resolution,
        url: resolutionUrl,
        status: resolution.status,
      };
      // console.log("url ",resolutionUrl)
      videoResolutions.push(processedResolution);
    })
    )
    console.log("done",videoResolutions)
    video.resolutions = videoResolutions;
    return video;
};

function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `${timestamp}${randomString}`;
}
