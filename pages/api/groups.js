import mongoose from "mongoose"
import {Group} from '../../models/Group'


export default async function post(req, res){
    mongoose.connect(process.env.MONGODB)

    if(req.method === 'POST'){
        try{
            const {groupSize, groupName} = req.body
            const group = new Group({name: groupName, members: groupSize})
            await group.save()
            res.status(201).json({message: "Group created successfully", group})
        }catch(error){
            res.status(500).json({ message: "Error creating group", error });
        }
    }else if(req.method === 'GET'){
        const { id } = req.query;
        const group = await Group.findById(id)
        res.status(200).json(group)
    }else{
        res.status(405).json({ message: "Method not allowed" });
    }


}