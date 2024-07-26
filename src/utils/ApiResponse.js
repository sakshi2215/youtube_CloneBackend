//For response we are using express not node and express does not provide
//classes for response.
class ApiResponse{
    constructor(statusCode,data, message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success= statusCode < 400

    }
}

export {ApiResponse}