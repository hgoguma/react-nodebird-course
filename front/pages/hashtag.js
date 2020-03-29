import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../componets/PostCard';


const Hashtag = ({tag}) => {
    const { mainPosts } = useSelector(state => state.post);

    return (
        <div>
            {mainPosts.map(c => (
            <PostCard key={+c.createdAt} post={c} />
            ))}
        </div>
    );
};

Hashtag.propTypes = {
    tag: PropTypes.string.isRequired,
};

//메소드 
//getInitialProps는 라이프 사이클의 일종. componentDidMount 보다도 먼저 실행! next가 임의로 추가해준 라이프 사이클.
//역할 : 제일 먼저 실행됨! 가장 최초의 작업이 가능. 이 때 서버의 데이터를 가져오거나 서버쪽에서 실행될 동작을 수행 가능
//특징 : 서버, 프론트 둘 다 실행 됨. 서버 사이드 렌더링을 할 때 중요함!
//이걸 통해서 서버쪽에서 필요한 것을 가져와서 프론트에서 렌더링 가능
//getInitialProps : next에서 제공 -> _app.js에 작업 필요

Hashtag.getInitialProps = async (context) => { //_app.js의 cxt가 context로 넣어짐
    //console.log('hashtag getInitialProps'+context.query.tag); //서버에서 내려준 tag 이름에 대한 데이터가 담겨옴
    const tag = context.query.tag;
    context.store.dispatch({
        type: LOAD_HASHTAG_POSTS_REQUEST,
        data: tag,
    })
    return { tag : context.query.tag } //return 해준 값이 _app.js의 pageProps로 전달됨.
}

export default Hashtag;