const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const { isLoggedIn } = require('./middleware');
const router = express.Router();


//multer 설정
const upload = multer({
    storage : multer.diskStorage({
        destination(req, file, done) {
            done(null, 'uploads'); //upload 폴더에 저장
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext); //제로초.png 일 때 ext==.png, basename==제로초
            done(null, basename + new Date().valueOf() + ext); //파일 이름 중복되지 않게 처리
        },
    }),
    limits : { fileSize : 20 * 1024 * 1024 },
});

//formData 파일 -> req.file(s)
//formData 일반 값 -> req.body
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
    try {
        const hashtags = req.body.content.match(/#[^\s]+/g); //정규표현식 활용해서 뽑기
        const newPost = await db.Post.create({
            content : req.body.content, //ex)'제로초 파이팅 #구독 #좋아요' -> 해시태그를 문자열에서 추출
            UserId : req.user.id,
        });
        if(hashtags) {
            const result = await Promise.all(hashtags.map( tag => db.Hashtag.findOrCreate({ //findOrCreate : 없으면 만들고 있으면 아무것도 안함
                where : { name : tag.slice(1).toLowerCase() } //영어 hashtag는 소문자로 통일함
            })));
            console.log(result);
            await newPost.addHashtags(result.map( r => r[0] ));
            //post에 연결된 hashtag를 만들어줌 
            //result는 2차원 배열 
        }
        if(req.body.image) { //이미지 주소를 여러개 올리면 image : [주소1, 주소2]
            if(Array.isArray(req.body.image)) { //array 형태로 오는지 아닌지 판단하기
                const images = await Promise.all(req.body.image.map((image) =>{ //한번에 insert 여러번하기
                    return db.Image.create({src : image});
                }));
                await newPost.addImages(images);
            } else { //이미지를 하나만 올리면 image : 주소1
                const image = await db.Image.create({src : req.body.image}); //이미지 주소 저장
                await newPost.addImage(image); //이미지와 게시글 연결
            }
        }
        // const User = await newPost.getUser(); //sequelize에서 자동으로 생성해주는 메소드
        // newPost.User = User;
        // res.json(newPost);
        
        // 위 방법 대신에 새로 db에서 조회하기
        const fullPost = await db.Post.findOne({
            where : { id : newPost.id},
            include : [{
                model : db.User,
                attributes: ['id', 'nickname'],
            },{
                model : db.Image,
            }]
        });
        console.log('포스트!'+fullPost);
        res.json(fullPost);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//댓글 가져오기
router.get('/:id/comments', async (req, res, next) => {
    try {
        //게시글이 있는지 검사
        const post = await db.Post.findOne({ where : { id : req.params.id }}); //게시글이 있는지 확인
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const comments = await db.Comment.findAll({
            where : {
                PostId : req.params.id,
            },
            order : [['createdAt', 'ASC']],
            include : [{
                model : db.User,
                attributes : ['id', 'nickname'],
            }]
        });
        res.json(comments);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//댓글 달기
router.post('/:id/comment', isLoggedIn, async(req, res, next) => { //POST /api/post/3/comment
    try {
        const post = await db.Post.findOne({ where : { id : req.params.id }}); //게시글이 있는지 확인
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        const newComment = await db.Comment.create({
            PostId : post.id,
            UserId : req.user.id,
            content : req.body.content,
        });
        await post.addComment(newComment.id); //게시글과 comment id 이어주기 sequelize에서 associate! 
        const comment = await db.Comment.findOne({
            where : {
                id : newComment.id,
            },
            include : [{
                model : db.User,
                attributes : ['id', 'nickname'], //댓글 사용자 넣어주기
            }],
        });
        console.log('댓글 달렸어?'+comment);
        return res.json(comment);
    } catch(e) {
        console.error(e);
        return next(e);
    }
});


router.post('/images', upload.array('image'), (req, res) => { 
    // upload.array('image') 에서 image는 formData에서 append 했을 때의 key값
    // 이미지 한 장 -> upload.single / 여러장 -> upload.array 
    // 이미지, 파일을 하나도 안 올린 경우 -> none
    // formData key 값이 여러개일 때 -> fields 
    console.log(req.files); //array -> req.files / single -> req.file
    res.json(req.files.map( v => v.filename)); //v는 이미지 업로드 결과에 대한 데이터가 있음

});


//좋아요
router.post('/:id/like', isLoggedIn, async (req, res, next) => {
    try {
        //게시글 확인
        const post = await db.Post.findOne({ where : { id : req.params.id}});
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        await post.addLiker(req.user.id);
        res.json({userId : req.user.id});
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//좋아요 취소
router.delete('/:id/like', isLoggedIn, async (req, res, next) => {
    try {
        //게시글 확인
        const post = await db.Post.findOne({ where : { id : req.params.id}});
        if(!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        await post.removeLiker(req.user.id);
        res.json({userId : req.user.id});
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//리트윗
router.post('/:id/retweet', isLoggedIn, async (req, res, next) => {
    try {
        //게시글 확인
        const post = await db.Post.findOne({ 
            where : { id : req.params.id},
            include : [{
                model : db.Post,
                as : 'Retweet',
            }]
        });
        if (!post) {
            return res.status(404).send('포스트가 존재하지 않습니다.');
        }
        if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
            return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
        }
        const retweetTargetId = post.RetweetId || post.id; //리트윗된 게시글 리트윗 할 때랑 원본 게시글 리트윗 동시에 처리
        const exPost = await db.Post.findOne({
            where : {
                UserId : req.user.id,
                RetweetId : retweetTargetId,
            },
        });
        if(exPost) {
            return res.status(403).send('이미 리트윗 했습니다.');
        }
        const retweet = await db.Post.create({
            UserId : req.user.id,
            RetweetId : retweetTargetId,
            content : 'retweet', //임의로 넣기
        });

        //리트윗한 게시글 불러오기
        const retweetWithPrevPost = await db.Post.findOne({
            where : { id : retweet.id},
            include : [{
                model : db.User, //작성자 정보
                attributes : ['id', 'nickname'],
            }, {
                model : db.Post, //리트윗한 게시글 가져오기
                as : 'Retweet',
                include : [{
                    model : db.User, //리트윗한 게시글의 사용자 정뵈, 이미지 가져오기
                    attributes : ['id', 'nickname'],
                }, {
                    model : db.Image,
                }],
            }],
        });
        console.log('리트윗한 게시글 가져오기!');
        console.log(retweetWithPrevPost);
        res.json(retweetWithPrevPost);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

//게시글 삭제
router.delete('/:id', isLoggedIn, async (req, res, next) => {
    console.log('게시글 삭제 라우터?');
    try {
      const post = await db.Post.findOne({ where: { id: req.params.id } });
      if (!post) {
        return res.status(404).send('포스트가 존재하지 않습니다.');
      }
      await db.Post.destroy({ where: { id: req.params.id } });
      res.send(req.params.id);
    } catch (e) {
      console.error(e);
      next(e);
    }
});

module.exports = router;

