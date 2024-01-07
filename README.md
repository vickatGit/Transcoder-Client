### Postman Api Collection Link
https://api.postman.com/collections/21349319-813be182-2835-42ef-ab8d-19a11e634bca?access_key=PMAT-01HKJ3ZGPDQD0X4TQ511N2A4XN

### Architecture

<img src="https://github.com/vickatGit/Transcoder-Client/assets/96293449/917f7c84-100e-45a6-beed-0b0533e62501">

## Tech Stack

- `Nodejs`
- `Typescript`
- `Express.js`
- `MongoDB`
- `Redis`
- `Docker`
- `FFMEPEG`
- `Serverless ( for working with AWS lambdas Seamlessly )`
- `AWS Related Services`
    
    `S3 ( Simple Storage Service )`
    
    `Lambda`
    
    `ECS ( ECS with Fargate )`
    
    `SQS`
    
    `Event Bridge`
    

## Environment Variable That You Need for this Project

- PORT
- MY_AWS_REGION
- MY_AWS_ACCESS_ID
- MY_AWS_SECRET_ACCESS_KEY
- MONGOOSE_DB_URL
- JWT_AUTH_SECRET_KEY
- REDIS_CLOUD_PASSWORD
- REDIS_CLOUD_HOST
- REDIS_CLOUD_PORT
- SQS_QUEUE_URL (AWS SQS Queue URL so you can enqueue the messages)
- SQS_ARN ( it is an ARN value of SQS service )

## Key Points

- Lambda Functions
    
    All lambda functions are located in the "`src/functions/`" path within the project structure. These functions are used by the `serverless.yml` file.
    
    To push these lambda functions to AWS, run the following command:
    
    ```markdown
    serverless deploy
    ```
    
    But before pushing it to AWS, make sure you have logged in using your AWS AccessID and Secret Access Key, and have also configured these credentials to the Serverless framework. You can do this by following the commands below:
    
    ```jsx
    // For aws login
    aws configure
    
    //For Configuring AWS Credentials to the Serverless
    serverless config credentials --provider aws --key "AWS AccessId" --secret "Secret Access Key" -o
    
    // Remember dont use quotes when specifying  AWS AccessId and Secret Access Key 
    ```
    
    You can also create the environment to test this functions locally using this command
    
    ```jsx
    serverless offline
    ```
    
    you can also invoke the function individually using this command
    
    ```jsx
    // JobConsumer is function name which is mentioned in the serverless.yml
    
    serverless invoke local -f JobConsumer
    ```
    
- ECS ( for Video Transcoding service )
    
    The Video Transcoding service is a node application located in "`src/VideoEncodingService/`". We create a Docker image from this service and push it to ECR.
    
    The Video Transcoding service has its own index file, `package.json`, and `package-lock.json` file. If you are unsure how to push the image to ECR, you can go to the AWS console and visit the AWS ECR service. Create a Repository and click on the "View Pushing Commands" button at the top of the Repository for help with the commands.
    
    If you are a Windows user like me (slowly realizing that being a Windows user really sucks 😥😅), you may encounter errors while pushing the image to the ECR Repository. I found a fix for this by exporting the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. If you are a Windows user, use `set` to export the environment variable. If you are a Linux user, use `export`.
    
    Before pushing the image, make sure to build it using Docker. Also, ensure that the Docker Compose App is running. After building the image, refer to the push commands provided by the AWS ECR service management console.
    
    In the Docker File, you will see the following code:
    
    ```jsx
    COPY src/VideoEncodingService/package*.json .
    COPY tsconfig.json tsconfig.json
    
    RUN npm ci --maxsockets 1
    ```
    
    Why do we use `RUN npm ci —maxsockets 1`? Let's find out.
    
    When I used `RUN npm i`, I encountered some errors related to I was unsure of what was happening, and it took me 3 days to resolve this issue (yes, embarrassing for a software developer 😂😅😥😥). Finally, I found the solution by using the command `RUN npm ci —maxsockets 1`. After successfully building this image, I never touched the Dockerfile again. It was a case of "If it Works, Don't Touch it".
    
    Before building the image, please ensure that the `package-lock.json` file is present. If it is not, the image building process will fail at the point of `RUN npm ci —maxsockets 1`. This is because `npm ci` depends on the `package-lock.json` file, not on `package.json`.
    


## Documentation

**If You want High Level Design of this project like How Video gets processing Then You Can Refer to Architecture of this Project Which is Mentioned at the Top of the Readme**

You Can Use this using in the postman by importing the API using this URl : https://api.postman.com/collections/21349319-813be182-2835-42ef-ab8d-19a11e634bca?access_key=PMAT-01HKJ3ZGPDQD0X4TQ511N2A4XN

### **Signup**

```jsx
URl : {{base_url}}/video/signup
{
  "userName":"guest",
  "email":"guest@gmail.com",
  "password":"123456"
}
```

**Login**

```jsx
URl : {{base_url}}/video/login
{
   "email":"guest@gmail.com",
   "password":"123456"
}
```

**Get Video Upload URL**

Here you will send the name of the video you want to name it and video extension in URL path

this API will generate the Pre Signed URL of S3 Put Object and you will get that URL in response
using that URL you will upload the video to S3 Bucket using this API called *Upload Video URL*  which is mentioned Below

Remember you don’t need to add the video into body of this  API this API will not handle the Video Uploading it is Handled By the Below API called *Upload Video* 

We are doing this to avoid the load on our server 

```jsx
URL : {{base_url}}/video/upload_video_url/{video_name}/{video_extension}
```

**Upload Video**

Here we are Uploading the Video  to the S3 Bucket using URL generated by API called *Get Video Upload URL.* 

After Uploading the Video if you get 200 Response code then video will sent for the Processing ( for Transcoding video to Multiple Resolutions )

```jsx
//Here you will send request to the link which you will get from this API called "Get Video Upload URL" as a Response
```

Get Videos

```jsx
URL : {{base_url}}/video/get_videos
```

Using this you can get the videos which are uploaded by you and you can see the status of every video of every resolution transcoding status like Pending, Starting, Done
