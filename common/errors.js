
var LogicError = function(message, code,data) {
    this.name = 'LogicError';
    this.message = message;
    this.code = code;
    this.data = data==undefined?"":data;
    this.stack = (new Error()).stack;
}
LogicError.prototype = new Error;

exports.LogicError = LogicError;

exports.failRes = function(res,error,formatResult) {
	if (!(error instanceof LogicError)) {
		error = {message:"服务器异常:"+(error.code?error.message:error),code:500000};
	}
	res.send(!formatResult?{code:error.code, message: error.message.toString(),data:null}:formatResult(error.message, error.code));
}