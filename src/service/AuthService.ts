import {UserModel} from '../model/userModel'
import * as bcrypt from 'bcrypt'
import {Response} from 'express'
import jwt from 'jsonwebtoken'
import {config} from 'dotenv'
config()


export const signup =async (userName:string,email:string,password:string,res:Response) => {
    const user = await UserModel.findOne({email:email})
    if(!user){
        const hashedPassword = await bcrypt.hash(password,10)
        await UserModel.create({
            userName:userName,
            email:email,
            password:hashedPassword
        })
    }else{
        res.status(409)
        throw new Error("User Already Exist Try Login")
    }
}

export const login =async (email:string,password:string,res:Response) => {
    const user = await UserModel.findOne({email:email})
    if(user){
        const ispasswordMatched = await bcrypt.compare(password,user.password)
        if(ispasswordMatched){
            const token = await jwt.sign({email:email, userId:user._id},`${process.env.JWT_AUTH_SECRET_KEY}`,{expiresIn:'40d'})
            return { token:token }
        }else{
            res.status(400)
            throw new Error("Invalid Credentials")
        }
    }else{
        res.status(409)
        throw new Error("No User Found Try Signing up")
    }
}