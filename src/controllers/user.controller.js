import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from  "../utils/ApiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary, deleteFilesCloudnary} from "../utils/FileUploadAndDelete.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAcessAndrefreshTokens =  async(userId)=>{
    try{
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforesave: false })
        return { accessToken, refreshToken }
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while Generating Access and Refresh Tokens")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
 
   
    //remove password and refresh token feild from response
    //check for user creation
    //return response


    //get user detail from frontend
    const {fullname, email, username, password}= req.body
    // console.log(req.body)
    // console.log(req.files)
    //check if user already exists: username , email
    const exitedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(exitedUser){
        throw new ApiError(409, "User With Email or Username already exists")
    }


    //validation- not empty
    if(
        [fullname, email, username, password].some((feild)=>{
            return feild?.trim()===""
        })
    ){
       throw new ApiError(400, "All Feilds are compulsory or required")
    }

    
    //check for images
    //check for avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

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
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
     })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user" )
    }
    

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Sucessfully")
    )
})


const loginUser = asyncHandler(async(req,res)=>{
    //req body ->data
    //username or email
    //find the user
    //password check
    //Access and Refresh Token
    //send cookies- Secure Cookies

    const{email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "Username or Password is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User credentials")
    }
    
    const{accessToken, refreshToken}= await generateAcessAndrefreshTokens(user._id)


    const loggedInUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",
        accessToken, options
    )
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    //clear the cooking
    //reset the refreshAcessToken
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
)
const options = {
    httpOnly: true,
    secure: true
}
return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAcessToken = asyncHandler(async(req,res)=>{
    

    try{
        const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")

    }
    
    const decodedToken = jwt.verify(incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid RefreshToken")
    }


    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token is Expired or Used")
    }


    const options = {
        httpOnly:true,
        secure:true
    }

    const {accessToken, newrefreshToken} = await generateAcessAndrefreshTokens(user._id)

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(200, {accessToken, refreshToken : newrefreshToken},
            "Acess Tokenrefreshed"
        )
    )
    }
    catch(error){
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})


const  changeCurrentPassword= asyncHandler(async(req, res)=>{
    //get the user
    //check the password
    //update the password
    //send response
    const {oldPassword, newPassword}= req.body


    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Current Password")
    }

    user.password = newPassword //set the new password

    await user.save({ validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            {}, 
            "Password Changed Successfully"
        )
    )
})

const getCurrentUser =  asyncHandler(async(req, res)=>{
    return res.status(200)
    .json(
        200, req.user, "Current User Fetched SuccessFully"
    )
})

const updateAccountDetails = asyncHandler(async(req, res)=>{

    const {fullname, email } = req.body

    if(!fullname || !email){
        throw new ApiError(400, "Fullname and Email are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id
        ,{
            $set:{
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "User Details successfully Changed!!") 
    )
})

const updateAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = await req.file?.path

    const imageTobeDeleted = await req.user?.coverImage

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Required")
    }


    const avatar= await uploadOnCloudinary(avatarLocalPath)


    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on Avatar")
    }

    await User.findByIdAndUpdate(
        req.user._id , 

        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    

    const deleteimage= await deleteFilesCloudnary(imageTobeDeleted)

    if(!deleteimage){
        throw new ApiError(400, "Error while deleting the Avatar")
    }
    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Avatar successfully Changed!!") 
    )

})

const updateCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover File is Required")
    }

    const imageTobeDeleted = await req.user?.coverImage

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)


    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on Cloudinary")
    }

    await User.findByIdAndUpdate(
        req.user._id , 

        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")
    
    

    const deleteimage= await deleteFilesCloudnary(imageTobeDeleted)

    if(!deleteimage){
        throw new ApiError(400, "Error while deleting the Avatar")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "CoverImage successfully Changed!!") 
    )
})


export {registerUser,
     loginUser,
     logoutUser,
     refreshAcessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateAvatar,
     updateCoverImage}
