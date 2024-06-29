import {asyncHandler} from "../utils/asyncHandler.js"


const registerUser = asyncHandler(async(req, res)=>{
   
 //ALGORITHM OR LOGIC:-
    //get user detail from frontend
    //validation- not empty
    //check if user already exists: username , email
    //check for images
    //check for avatars
    //upload to cloudnary , avatar
    //create a user object- create entry in db
    //remove password and refresh token feild from response
    //check for user creation
    //return response

    const {fullName, email, username, password}= req.body
    console.log("email:", email);

})
export {registerUser}
