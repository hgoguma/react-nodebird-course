const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isLoggedIn } = require('./middleware');

const router = express.Router();

//API는 다른 서비스가 내 서비스의 기능을 실행할 수 있게 열어둔 창구

//유저 정보 가져오기
router.get('/', isLoggedIn, (req, res) => {
    console.log('유저 정보 가져오기!');
    console.log(req.user);
    const user = Object.assign({}, req.user.toJSON());
    delete user.password;
    console.dir(user);
    return res.json(user);
});

//회원가입
router.post('/', async (req, res, next) => { //next는 보통 에러 넘길 때 씀
    try {
        //기존 가입된 사람이 있는지 검사
        const exUser = await db.User.findOne({
            where : { //where 절 넣어주기
                userId : req.body.userId,
            }
        });
        if(exUser) {
            return res.status(403).send('이미 사용중인 아이디입니다.');
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12); //비밀번호 암호화 , salt는 10~13 사이로 많이 함
        const newUser = await db.User.create({
            nickname : req.body.nickname,
            userId : req.body.userId,
            password : hashedPassword
        });
        console.log(newUser);
        return res.status(200).json(newUser);
    } catch(e) {
        console.error(e);
        //여기서 에러 처리하기
        return next(e); //알아서 front로 에러 발생했다고 알려줌
    }
});

router.get('/:id', async (req, res, next) => { //남의 정보 가져오는 것 ex) /3 (id가 3인 유저 정보 가져오기)
    try {
        const user = await db.User.findOne({
            where : {id : parseInt(req.params.id, 10)},
            include : [{
                model : db.Post,
                as : 'Posts',
                attributes : ['id'],
            }, {
                model : db.User,
                as : 'Followings',
                attributes : ['id'],
            }, {
                model: db.User,
                as: 'Followers',
                attributes: ['id'],
              }],
            attributes : ['id', 'nickname']
        });
        const jsonUser = user.toJSON();
        //개별 아이디가 아니라 몇 명의 팔로잉/팔로워가 있는지 보내기
        jsonUser.Posts = jsonUser.Posts ? jsonUser.Posts.length : 0;
        jsonUser.Followings = jsonUser.Followings ? jsonUser.Followings.length : 0;
        jsonUser.Followers = jsonUser.Followers ? jsonUser.Followers.length : 0;
        res.json(jsonUser);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.post('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('logout 성공');
});

router.post('/login', (req, res, next) => { 
    //패스포트 전략 실행
    passport.authenticate('local', (err, user, info) => { //done에서 가져옴
        if(err) { //서버 에러
            console.error(err);
            return next(err);
        }
        if(info) { //로직상 에러
            return res.status(401).send(info.reason);
        }
        return req.login(user, async (loginErr) => { //serializeUser() 실행됨.
            try {
                if (loginErr) {
                  return next(loginErr);
                }
                const fullUser = await db.User.findOne({
                  where: { id: user.id },
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
                  attributes: ['id', 'nickname', 'userId'],
                });
                return res.json(fullUser);
              } catch (e) {
                next(e);
              }
        });
    }) (req, res, next);
});

//팔로우
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({ //내 정보 요청
            where : { id : req.user.id },
        }); 
        await me.addFollowing(req.params.id); 
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//언팔로우
router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where : { id : req.user.id },
        });
        await me.removeFollowing(req.params.id); 
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//다른사람이 올린 게시물들 가져오기
router.get('/:id/posts', async (req, res, next) => {
    try {
        const posts = await db.Post.findAll({
            where : {
                UserId : parseInt(req.params.id, 10) || (req.user && req.user.id) || 0, 
                //게시글 작성자 찾기
                //남의 아이디가 파라미터로 전달되는 경우 / 내 게시글인 경우(0으로 들어옴)
                RetweetId : null,
            },
            include : [{
                model : db.User, //게시글 작성자
                attributes : ['id', 'nickname'], //비번 빼기
            }, {
                model : db.Image,
            }, {
                model : db.User,
                through : 'Like',
                as : 'Likers',
                attributes : ['id']
            }, {
                model : db.Post,
                as : 'Retweet',
                include : [{
                    model : db.User,
                    attributes : ['id', 'nickname']
                }, {
                    model : db.Image
                }]
            }],
        });
        res.json(posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.get('/:id/followings', isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where : { id : parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },
        });
        const followings = await user.getFollowings({
            attributes : ['id', 'nickname'],
            limit: parseInt(req.query.limit, 10),
            offset: parseInt(req.query.offset, 10),
        });
        res.json(followings);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.get('/:id/followers', isLoggedIn, async (req, res, next) => {
    try {
        const user = await db.User.findOne({
            where : { id : parseInt(req.params.id, 10) || (req.user && req.user.id) || 0 },
        });
        const followers = await user.getFollowers({
            attributes : ['id', 'nickname'],
            limit: parseInt(req.query.limit, 10),
            offset: parseInt(req.query.offset, 10),
        });
        res.json(followers);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

router.delete('/:id/follower', async (req, res, next) => {
    try {
        const me = await db.User.findOne({
            where : { id : req.user.id},
        });
        await me.removeFollower(req.params.id);
        res.send(req.params.id);
    } catch(e) {
        console.error(e);
        next(e);
    } 
});

//닉네임 부분수정
router.patch('/nickname', isLoggedIn, async (req, res, next) => { 
    try {
        await db.User.update({
            nickname : req.body.nickname,
        }, {
            where : { id : req.user.id },
        });
        res.send(req.body.nickname);
    } catch(e) {
        console.error(e);
        next(e);
    } 
});

module.exports = router;