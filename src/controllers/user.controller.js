import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from  "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/src/utils/FileUpload.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async(req, res)=>{
 
   
    //remove password and refresh token feild from response
    //check for user creation
    //return response


    //get user detail from frontend
    const {fullName, email, username, password}= req.body
    

    //check if user already exists: username , email
    const exitedUser = User.findOne({
        $or: [{username},{email}]
    })

    if(exitedUser){
        throw new ApiError(409, "User With Email or Username already exists")
    }


    //validation- not empty
    if(
        [fullName, email, username, password].some((feild)=>{
            return feild?.trim()===""
        })
    ){
       throw new ApiError(400, "All Feilds are compulsory or required")
    }

    
    //check for images
    //check for avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Required")
    }

    //upload to cloudnary , avatar
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

     //create a user object- create entry in db
     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
     })

    const createdUser = await UserfindById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user" )
    }
    

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Sucessfully")
    )
})
export {registerUser}
