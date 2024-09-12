import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
        content : {
            type : String,
            require : true
        },
        video : {
            type : Schema.Types.ObjectId,
            ref :  "Video"
        }
});

commentSchema.plugin(mongooseAggregatePaginate) 

export default mongoose.model("comments" , commentSchema)