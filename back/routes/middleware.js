exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next(); //next(e) : 에러처리 미들웨어로 넘어감 그냥 next()  : 미들웨어로 넘어감
        //에러처리 미들웨어는 express가 기본적으로 제공함!
    } else {
        res.status(401).send('로그인이 필요합니다.');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next(); //next(e) : 에러처리 미들웨어로 넘어감 그냥 next()  : 미들웨어로 넘어감
    } else {
        res.status(401).send('로그인한 사용자는 접근할 수 없습니다.');
    }
};
