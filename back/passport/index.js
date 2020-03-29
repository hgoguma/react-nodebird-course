const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
    //서버쪽에 [{id : 3, cookie : 'sjsj' }] 배열 형태로 저장 -> 쿠키랑 id를 연결시켜줌
    passport.serializeUser((user, done) => { 
        return done(null, user.id);
    });

    //id를 다시 serialize 해서 유저 정보를 db에서 되찾음
    passport.deserializeUser(async(id, done) => {
        try{
            const user = await db.User.findOne({
                where : {id},
                include: [{
                    model: db.Post,
                    as: 'Posts',
                    attributes: ['id'],
                }, {
                model: db.User,
                as: 'Followings',
                attributes: ['id'],
                }, {
                model: db.User,
                as: 'Followers',
                attributes: ['id'],
                }],
            });
            return done(null, user); //req.user에 유저 정보가 저장됨
        } catch(e) {
            console.error(e);
            return done(e);
        }
    });
    local();
}

// 프론트에서 서버로는 cookie만 보냄
// 서버가 cookie-parser, express-session을 분석해서 쿠키를 검사 후 id : 3 발견
// id : 3이 deserializeUser에 들어감
// req.user로 사용자 정보가 들어감

// 프론트에서 서버로 요청 보낼 때 마다 deserializeUser가 실행됨 
// 실무에서는 deserializeUser 결과를 캐싱함 
// (db 요청을 최소화 하는 게 제일 좋음 -> 한번 찾은 유저는 안 찾아도 되게 캐싱함.. 노드 교과서 참고)