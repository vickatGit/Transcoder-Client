import { Request, Response, NextFunction } from 'express'
import { GetVideoUploadingSigneddUrl,GetUserVideos } from '../service/videoService'


export const GetVideoUploadingUrlController = async (req:Request,res:Response,next:NextFunction) => {
    const result = await GetVideoUploadingSigneddUrl(req.params.title,req.params.ext,req.body.userId)
    res.status(200).send({
        url:result
    })
}

export const GetUserVideosController = async (req:Request,res:Response,next:NextFunction) => {
    const result = await GetUserVideos(req.body.userId)
    res.status(200).send({
        videos:result
    })
}