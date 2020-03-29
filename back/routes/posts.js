const express = require('express');
const db = require('../models');

const router = express.Router();


router.get('/', async (req, res, next) => { //api/posts 게시글 여러개 가져오기
    try {
        const posts = await db.Post.findAll({
            include : [{
                model : db.User,
                attributes : ['id', 'nickname'], 
            }, {
                model : db.Image,
            }, {
                model : db.User,
                through : 'Like',
                as : 'Likers',
                attributes : ['id']
            }],
            order : [['createdAt', 'DESC']] //내림차순
        });
        res.json(posts);
    } catch(e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
