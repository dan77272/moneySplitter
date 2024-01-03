import mongoose, {models} from 'mongoose'
const {Schema} = mongoose

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members : Number
}, {timestamp: true})

export const Group = models.Group || mongoose.model('Group', groupSchema)