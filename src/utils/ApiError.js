class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something Went Wrong",
        errors=[],
        statck=""
    ){ //We are overwriting the defaultconstructor of error class of express
        super(message)
        this.statusCode = statusCode
        this.data= null
        this.message = message
        this.sucess = false;
        this.errors =  errors 

        //API error stack trace
        if(statck) {
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export{ ApiError}