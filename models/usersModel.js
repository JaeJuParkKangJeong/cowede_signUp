const { default: mongoose } = require('mongoose');
const Mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
const dbUrl =  
    "mongodb+srv://cowede:cowede12345@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";
var connection = mongoose.createConnection(dbUrl);

//mongoose-auto-increment initialize
autoIncrement.initialize(connection);

//화원가입 -> 여기서 만든 모델로 도큐먼트 생성~
const userSchema = new mongoose.Schema({

    _id: {
        type: Number,
        required: false,
        default: 0
    },
    
    user_id: {
        type: String,
        required: true,
    },

    user_pw: {
        type: String,
        required: true,
    },

    user_email: {
        type: String,
        required: true,
    },

    user_nickName: {
        type: String,
        required: true,
    },

    // 레벨테스트 후 (회원마다의 특정값으로) 세팅됨 -> defalut는 모두 1 
    //회원 가입시에 디폴트로 {java: 1, cpp: 1, python: 1, c: 1}
    //으로 저장되게 하기
    user_level: {                 
        type: mongoose.Schema.Types.Mixed,
        required: true,     
    },

    //레벨테스트 후 (회원마다의 특정값으로) 세팅됨 -> defalut는 모두 0 
    //회원 가입시에 디폴트로 {java: 0, cpp: 0, python: 0, c: 0}
    //으로 저장되게 하기
    user_score: {
        type: mongoose.Schema.Types.Mixed,
        required: true,     
    },

    //채점 후에 맞춘 문제의 problem_id가 저장되도록!
    //도큐먼트 생성시에는(화원가입시에는) 디폴트로 0 저장! 
    user_correct_ques: {
        type: [Number],
        required: false,
    }
},
{
    versionKey: false
}
);

//_id field 자동증가
userSchema.plugin(autoIncrement.plugin,'users');

//??이건뭐지? -> _id 값 초기화 위함(Collection이 비어있을때 초기화,,)
var Users = connection.model('users', userSchema);
var users = new Users();

users.save(function(err){
    users._id === 0;
    users.nextCount((err,count)=>{
      count === 1;
      users.resetCount(function(err,nextCount){
        nextCount === 0;
  });
});
});

//users라는 이름의 coolection생성
module.exports = mongoose.model("users", userSchema);