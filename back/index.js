const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

const passportConfig = require('./passport');
const db = require('./models');
const userAPIRouter = require('./routes/user');
const postAPIRouter = require('./routes/post');
const postsAPIRouter = require('./routes/posts');
const hashtagAPIRouter = require('./routes/hashtag');

dotenv.config();
const app = express();
db.sequelize.sync(); //자동으로 테이블 생성
passportConfig(); //passport 연결


//미들웨어
app.use(morgan('dev'));

//static은 경로를 지정해주면 다른 서버에서 이 안에 있는 파일을 자유롭게 가져갈 수 있게 함
//첫번째 '/'는 프론트에서 접근하는 주소
app.use('/', express.static('uploads'));
app.use(cors({  //쿠키 교환
    origin : true, 
    credentials : true
}));

//req.body 사용하기
app.use(express.json()); //json 처리
app.use(express.urlencoded({extended : true })); //form 처리
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave : false,
    saveUninitialized : false,
    secret : process.env.COOKIE_SECRET,
    cookie : {
        httpOnly : true, //cookie를 js에서 접근 못함
        secure : false // https를 쓸 때 true
    },
    name : 'rnbck' //connect.sid 대신에 임의의 이름을 써서 보안 강화하기
}));
//express session 다음에 써주기
app.use(passport.initialize());
app.use(passport.session());

//라우터
app.use('/api/user', userAPIRouter);
app.use('/api/post', postAPIRouter);
app.use('/api/posts', postsAPIRouter);
app.use('/api/hashtag', hashtagAPIRouter);

app.listen(5000, () =>{
    console.log('server is running on localhost:5000');
});