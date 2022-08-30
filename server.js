//login branch 생성 test
//npm install debug cookie-parser express morgan socket.io body-parser ejs mongoose nodemon bcrypt
//npm install --legacy-peer-deps mongoose-auto-increment

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var idePageRouter = require("./routes/idePage.js");

var app = express();
app.io = require("socket.io")();

// DB
const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://cowede:cowede12345@cavo.avwd3gl.mongodb.net/cavo?retryWrites=true&w=majority";
const Questions = require("./models/questionsModel");
const { resolve } = require("path");

//DB
const db = 
    mongoose.connect(
        dbUrl,
        {
          dbName: "pairPrograming_new_edit_2",
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (err) {
            return console.log(err);
          } else {
            console.log("DB/ODM is connected");
          }
        }
      );

//app.use(logger("dev")); // 받는 Request 로그 찍어준다.
app.use(express.json()); // JSON 형태의 request body 받았을 경우 파싱
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//app.use("/test", idePageRouter);


/**
sever.js -> 57~165 line 추가
model/userModel.js 추가

회원가입 확인 위해
public/stylesheets/registerform.css 추가
pucblic/registerForm.html 추가
회원가입 기능 추가완료~
*/

////////////////////////
///////여기부터_회원가입///////////
////////////////////////

//라이브러리 가져오기 
const bcrypt = require('bcrypt');    //암호화 모듈 사용

//모델 가져오기
const Users = require('./models/usersModel');

//user_counter Collection에 Document 하나 생성 -> 이미 생성해서 주석처리
//new user_counter().save(); 



// '/signUp'경로로 get요청 -> 화원가입 페이지(registerForm.html) 뜨게하기
app.get('/signUp', function(req, res){
  res.sendFile(__dirname + '/public/registerForm.html');
});


// '/join'으로 post요청하면 -> 계정생성 -> DB에(users Collection에)저장 
app.post('/join', 
  async function register(req, res) {
    //form으로 입력받은거 사용 위해 변수 선언해서 저장
    const input_id = req.body.loginId;
    const input_pw = req.body.loginPw;
    const input_pw_confirm = req.body.loginPwConfirm;
    const input_email = req.body.email;
    const input_nickname = req.body.nickname;

    //아이디 ,이메일, 닉네임 중복확인, 패스워드같은지 확인 -> 계정생성
    try{
        const check_id = await Users.findOne({user_id: input_id});
        const check_email = await Users.findOne({user_email: input_email});
        const check_nickname = await Users.findOne({user_nickName: input_nickname});
        
        if(check_id){
          return res.status(400).json({errors: [{message: "이미 사용중인 아이디입니다ㅠㅠ"}]})
        }

        if(check_email){
            return res.status(400).json({errors: [{message: "이미 가입된 이메일입니다ㅠㅠ"}]})
        }

        if(check_nickname){
            return res.status(400).json({errors: [{message: "이미 사용중인 닉네임입니다ㅠㅠ"}]})
        }

        if(input_pw != input_pw_confirm){
            return res.status(400).json({errors: [{message: "비밀번호를 다시 확인하세욥!"}]})
        }
        
        //계정생성
        const new_user = await new Users(
            {

            user_id: input_id,
            
            user_pw: input_pw,
            
            user_email: input_email,
            
            user_nickName: input_nickname,
            
            user_level:{                    //new_user.user_level.java 로 접근 
                
                java: 1, c: 1, cpp: 1, python: 1 

            },
            
            user_score:{
                
                java: 0, c: 0, cpp: 0, python: 0 

            }
            });
      
        new_user.user_correct_ques = [0];    //new_user.user_correct_ques[1~] --> index 1부터 맞춘문제 저장됨 
        
        //pw암호화 
        const salt = await bcrypt.genSalt(10);
        new_user.user_pw = await bcrypt.hash(input_pw, salt)

        //users Collection에 새로운 계정 Document 저장 -> 홈페이지로 리다이렉트
        await new_user.save().then((res)=>{          
          console.log(res);
          //res.redirect('/');
        });
        
        //홈 페이지로 리다이렉트(로그인 한 상태로??)
        res.redirect('/');
        //방금 저장한 계정 잘 저장되었는지 Document 찾아서 출력
        //쿼리를 날릴때 서버랑 디비랑 
        // await Users.findOne({user_nickName: new_user.user_nickName}, (err, result)=>{       //Query was already executed: users.findOne({ user_nickName: 'asda' })
        //     if(err){console.log(err);}
        //     else{
        //         console.log(result);
        //         }
        //     });
        
        //진짜 끄읕
        //res.send("코위드 구성원이 된걸 환영합니다")
    }
    catch(error){
        //회원가입 안되면 user_counter Collectio Document의 seq_val_for_user_id --1        
        console.error(error.message);         //여기에 뭐가 뜨는거지?
        res.status(500).send("Server Error");
    }
  });

////////////////////////
///////여기까지_회원가입_end///////////
////////////////////////

/**
회원가입 중복확인에 아이디도 추가
.body 는 req받은 data에만 사용?

할것
로그인 후/마이페이지 접속 시에 프론트에 json으로 접속회원 도큐먼트 날라가는지 확인하기
세션, 쿠키 확인 하기
마이페이지, 로그아웃 구현하기

끄읕~
로그인, 화원가입
*/



////////////////////////
///////여기부터_로그인///////////
////////////////////////

//로그인 요청 -> front에서 입력한 비번 암호화 -> 비교후 boolean 값 리턴
// -> true일때 토큰 생성 ->토큰을 세션및 DB에 저장

//라이브러리 설정 -> 사용 middleware 작성 
//npm install --legacy-peer-deps passport passport-local express-session
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

//로그인 페이지 접속
app.get('/login', (req,res)=>{
  res.sendFile(__dirname + '/public/login.html');
})

//로그인 폼 전송 -> 아이디 비번 검사 명령(인증해주세요~)(local 방식으로 인증~)
//passport.authenticate('local') -> 밑에있는 passport.use(new LocalStrategy~ 실행
//응답해주기 전에 local 방식으로 아이디 비번을 인증해주세요~
app.post('/login', passport.authenticate('local',{
  
  //로그인 실패시 'fail'경로로 보내줘
  failureRedirect: '/fail'
}) ,(req, res)=>{
  
  //로그인 성공시 '/'로 보내줭
  res.redirect('/')
  console.log("login_success: " + "아이디: " + req.user_id + " 비번: " + req.user_pw);
})


//로그인 실패시 실행할 api
app.get('/fail', (req,res)=>{
  
  //여기에 로그인 실패시 실행할(띄어줄 .html) 작성
  res.send('로그인 실패~');
})


//아이디 비번 인증하는 세부 코드
passport.use(new LocalStrategy({
    
  // login.html에서 사용자가 제출한 아이디가 어떤 <input>인지 <input>의 name 속성값
  usernameField: 'id',
  passwordField: 'pw',
  session: true,      //로그인 후 세션 저장
  passReqToCallback: false,   
}, (input_id, input_pw, done)=>{
  console.log(input_id, input_pw);        
  
  //디비에 저장된 아이디 비번과 대조해보기
  Users.findOne({user_id: input_id}, (err, result)=>{
      //걍 에러다~~
      //done(서버에러, 성공시 뱉어낼 사용자DB, 에러메세지)
      if(err) return done(err)
      
      //result == null -> 일치하는 user_id가 없는거임
      if(!result) return done(null, false, {message: '존재하지 않는 아이디입니다~ㅠㅠ'})
      
      //아이디 동일하니깐 이젠 비번 확인해야지 
      //front에서 입력한 비번 암호 <-> 위에서 findOne으로 찾아낸 화원정보의 암호화 된 비밀번호(result.pw)와 비교
      //비교하고 -> 
      result.comparePassword(input_pw, result.user_pw, (err, isMatch) => {
        //isMatch가 false이면~ -> 실패리턴
        if(!isMatch) return done(null, false, {message: '비밀번호가 틀렸어요~ㅠㅠ'})
        else{
          console.log(result);
          //어디에 보낸다는거지?
          return done(null, result);
        }
      })
  })
}));


//로그인 -> 세션 정보 만듦(로그인 유지)
//유저의 정보를 저장(씨리얼라이즈 해서)
//로그인 성공시 발동
//사용자 정보 객체를 session에 아이디로 저장!
passport.serializeUser((user, done)=>{
    done(null, user.user_id);      //user.user_id로 세션을 만듦(쿠기로 보냄 ) -> 해당 세션으로 마이페이지 접근 가능
  });
 

//마이페이지 접속시 사용
//session data 찾기
//로그인 한 유저의 개인정보를 DB에서 찾는 역할
//session에 저장한 아이디를 통해서 사용자 정보 객체를 불러옴
passport.deserializeUser((id, done)=>{
  //디비에서 위에 있는 user.id로 유저를 찾은 뒤에 유저 정보를 {}에 넣음 
  //mypage 접속시 DB에서 {user_id: id}인 도큐먼트 하나 찾아서 그 결과 보내줌
  Users.findOne({user_id: id}, (err, result)=>{
    done(null, result);
  });
});



////////////////////////
///////여기까지_로그인_end///////////
////////////////////////

let roomIndex = 1;
let rooms = []; //방정보들 저장
let Lv = 0;
let clients = new Map(); // 접속해있는 소켓 저장할 Map 객체

let result; //

// /editor/?level=num GET 요청 시,
const num_of_ques = 2;

//리액트 홈페이지띄우기
app.use(express.static(path.join(__dirname, 'react-project/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'react-project/build/index.html'));
});

app.get("/editor", (req, res) => {
  Lv = req.query.level; // queryParameter로 받은 level

  run();
  async function run() {
    result = await Questions.aggregate([
      { $match: { problem_level: parseInt(Lv) } },
      { $sample: { size: num_of_ques } },
    ]);
  }

  res.sendFile(__dirname + "/public/editor.html"); // editor.html 띄워준다.
});

app.io.on("connection", (socket) => {
  // 소켓

  socket["nickname"] = "페어"; // 초기 닉네임 설정
  clients.set(socket.id, socket);
  console.log("Matching ....");
  socket.emit("editor_open");


  //기존 방 확인
  socket.on("join_room", () => {
    if (rooms.find((room) => room.level === Lv && room.status === "open")) {
      // 들어가고자 하는 레벨의 방 존재한다면
      const room = rooms.find(
        (room) => room.level === Lv && room.status === "open"
      );
      const roomId = room.roomId;

      socket.join(roomId); // 입장
      socket["room"] = roomId;
      // console.log("B 브라우저 소켓:", room);
      socket
        .to(room.roomId)
        .emit(
          "new_message",
          `${socket.nickname}가 입장했습니다. 매칭이 완료되었습니다.`
        ); // 상대 브라우저에 자신이 들어왔다는 것을 알림
      socket.emit("new_message", "매칭이 완료되었습니다."); // 자기 자신에게 알림
      socket.emit("roomIdPass", roomId, console.log("Room 입장 : ", roomId));
      socket.to(roomId).emit("welcome", roomId);


      const roomMembers = socket.adapter.rooms.get(roomId); // 방에 있는 유저 목록
      const pairId = Array.from(roomMembers)[0]; // 같은 Rooms에 있는 상대방 id
      const pair = clients.get(pairId); // pairId를 통해 상대 소켓 가져오기

      socket["problems"] = pair.problems; // 상대의 문제 정보 받아오기 -> 같은 문제를 띄우기 위해 가져옴

      socket.emit("test", socket.problems);

      room.usable -= 1;
      if (room.usable === 0) room.status = "close";
    } else {
      rooms.push({
        // Room 생성
        roomId: roomIndex,
        level: Lv, //사용자 숙련도 레벨
        usable: 2, //방 최대인원
        status: "open", // 방 입장 가능 여부
      });

      socket.join(roomIndex);
      socket["room"] = roomIndex; // 해당 브라우저가 들어간 방 ID 저장
      rooms[rooms.length - 1].usable -= 1;
      socket.emit(
        "roomIdPass",
        roomIndex,
        console.log("Room 생성 : ", roomIndex)
      );

      socket.emit("new_message", "페어가 매칭될 때까지 기다려주세요.");

      socket["problems"] = result;
      socket.emit("test", socket.problems);

      roomIndex++;
    }
  });
  socket.on("disconnecting", () => {
    const room = rooms.find((room) => room.roomId === socket.room);
    socket
      .to(room.roomId)
      .emit("new_message", `${socket.nickname}가 퇴장했습니다.`);
    if (room.usable === 1) {
      rooms.splice(rooms.indexOf(room), 1);
    } else if (room.usable === 0) {
      room.usable += 1;
      room.status = "open";
    }
  });
  socket.on("disconnect", () => {
    clients.delete(socket.id);
    console.log("접속 끊어짐.");
  });

  socket.on("update", (data) => {
    console.log(data.event, data.delta, data.roomId);

    socket.to(data.roomId).emit("update", data);
  });
  socket.on("offer", (offer, roomId) => {
    socket.to(roomId).emit("offer", offer);
  });
  socket.on("answer", (answer, roomId) => {
    socket.to(roomId).emit("answer", answer);
  });
  socket.on("ice", (ice, roomId) => {
    socket.to(roomId).emit("ice", ice);
  });
  socket.on("new_message", (msg, roomId, done) => {
    socket.to(roomId).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
});

module.exports = app;
