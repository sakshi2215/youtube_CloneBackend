class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something Went Wrong",
        errors=[],
        stack=""
    ){ //We are overwriting the defaultconstructor of error class of express
        super(message)
        this.statusCode = statusCode
        this.data= null
        this.message = message
        this.success = false;
        this.errors =  errors 

        //API error stack trace
        if(stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export{ ApiError}