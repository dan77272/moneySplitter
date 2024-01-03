import mongoose from "mongoose";
import {Page} from '../../models/Page'

async function connectToDatabase() {
    if (mongoose.connection.readyState == 1) {
        return;
    }
    return mongoose.connect(process.env.MONGODB);
}

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method === 'GET') {
        const { id } = req.query;
        try {
            const page = await Page.findOne({id: id}).lean(); // Using lean() to get a plain JavaScript object
            res.status(200).json(page);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
