import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name:"sarthak183", 
  api_key:"126659218685841", 
  api_secret:"H5BQWqCx3O__a7XBxJfNqQf7fQ0"
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
      const response = await  cloudinary.uploader.upload(localFilePath , {
            resource_type : "auto"
      })
        //console.log(`file uploaded on cloudinary ${response.url}`);
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the  localy saved uploaded file as upload operation failed 
        console.log(`faild to upload file ${error}`)
        return null
    }
}



export {uploadOnCloudinary}