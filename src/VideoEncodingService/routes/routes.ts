import {Router,Request,Response} from 'express'

const router = Router()

router.route("/").get((req:Request,res:Response) => {
    res.status(200).send("Base Url")
})

router.route("/health").get((req:Request,res:Response) => {
    res.send("Health is good 💪💪")
})

export default router