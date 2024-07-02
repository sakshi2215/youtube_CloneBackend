import {v2} from "cloudinary";
import {extractPublicId} from "cloudinary-build-url";
import fs from "fs";



v2.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});


const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await v2.uploader.upload(localFilePath, {
            resource_type:"auto"
        })

        //file has been uploaded sucessfully
       // console.log("Uploded Succesfully on Cloudniary", response.url);
       fs.unlinkSync(localFilePath)
       console.log(response)
        return response;
        
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;

    }
}

const deleteFilesCloudnary = async(ImagePath)=>{  
  
  try{
    const publicId = extractPublicId(ImagePath)
    if(!publicId) return null;
    const response = await v2.uploader.destroy(publicId)
    //console.log(response)
    return response;
  }
  catch(error){
    return null;
  }
      
}



export {uploadOnCloudinary, deleteFilesCloudnary}