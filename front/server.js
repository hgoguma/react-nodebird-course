const express = require('express');
const next = require('next');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const dotenv = require('dotenv');

//express와 next 연결
const dev = process.env.NODE_ENV !== 'production';
const prod = process.env.NODE_ENV === 'production';

const app = next({ dev });
const handle = app.getRequestHandler(); //요청 처리기
dotenv.config();

app.prepare().then(() => { //next에서 express 돌리기
    const server = express();

    server.use(morgan('dev'));
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use(cookieParser(process.env.COOKIE_SECRET));
    server.use(expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    }));

    server.get('/post/:id', (req, res) => {
        return app.render(req, res, '/post', { id : req.params.id }); 
    });
    server.get('/hashtag/:tag', (req, res) => {
        return app.render(req, res, '/hashtag', { tag : req.params.tag }); 
        //app이 next! 
        // '/hashtag' 는 hashtag 페이지를 의미함!
        //세번째 파라미터로 tag를 넘겨주면 hashtag페이지에서 사용 가능
    });

    server.get('/user/:id', (req, res) => {
        return app.render(req, res, '/user', { id: req.params.id });
    });

    server.get('*', (req, res) => { //모든 요청을 처리함
        return handle(req, res);
    });
    
    server.listen(3000, () => {
        console.log('next+express running on 3000');
    })
});
