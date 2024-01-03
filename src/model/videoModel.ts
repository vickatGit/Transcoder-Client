import { truncateSync } from 'fs'
import mongoose from 'mongoose'

const VideoResolutionModel = {
    resolution:String,
    url:String,
    status:String
}

export const VideoModel = mongoose.model("VideoModel", new mongoose.Schema({
    videoName:{type:String, required:true},
    resolutions:{type:[VideoResolutionModel]},
    belongsTo:{type:mongoose.Types.ObjectId , ref: 'UserModel', required:true},
    ext:{type:String, required:true}

})
)

