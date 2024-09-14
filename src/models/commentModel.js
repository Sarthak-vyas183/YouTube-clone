import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
        content : {
            type : String,
            require : true
        },
        video : {
            type : Schema.Types.ObjectId,
            ref :  "Video",
            require : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User",
            require : true
        }
});

commentSchema.plugin(mongooseAggregatePaginate) 

export default mongoose.model("comments" , commentSchema)