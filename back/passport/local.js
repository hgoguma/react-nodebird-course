const passport = require('passport');
const { Strategy : LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField : 'userId',
        passwordField : 'password'
    }, async(userId, password, done) => {
        //로그인 전략 수행
        try {
            const user = await db.User.findOne({ where : { userId } }); //userId db에서 찾기
            if(!user) {
                return done(null, false, {reason : '존재하지 않는 사용자입니다.'});
                //done(첫번째 에러, 성공했을 때, 로직상에서의 에러)
            }
            //비번 비교
            const result = await bcrypt.compare(password, user.password); //일치하면 true 리턴
            if(result) {
                return done(null, user);
            }
            return done(null, false, {reason : '비밀번호가 틀립니다.'});
        } catch(e) {
            console.error(e);
            return done(e);
        }
    }));
};