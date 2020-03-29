const express = require('express');
const db = require('../models');

const router = express.Router();

router.get('/:tag', async (req, res, next) => {
    try {
        const posts = await db.Post.findAll({
            include : [{
                model : db.Hashtag,
                where : { name : decodeURIComponent(req.params.tag) }, //hash 태그에 대한 조건
                //decodeURIComponent : 한글, 특수문자는 주소를 통해 서버로 갈 때 uriComponent로 바뀜. 이걸 다시 글자로 바꿔야 함!
                }, {
                    model : db.User, 
                    attributes : ['id', 'nickname'],
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
        console.log('해시태그 포스트들!'+posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;