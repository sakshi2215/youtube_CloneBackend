import {v2} from cloudinary;
import fs from"fs";



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
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
        console.log("Uploded Succesfully on Cloudniary", response.url);
        return response;
        
    }
    catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;

    }
}

export {uploadOnCloudinary}