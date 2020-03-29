import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { LOAD_POST_REQUEST } from '../reducers/post';
import Helmet from 'react-helmet'; 

const Post = ({id}) => {
    const { singlePost } = useSelector(state => state.post);
    return (
        <>
        <Helmet //head 태그 관리! 검색엔진은 meta 태그를 봄! -> SSR해야 검색엔진이 meta 태그를 인식함!
            title={`${singlePost.User.nickname}님의 글`}
            description={singlePost.content}
            meta={[{
                name : 'description', content : singlePost.content,
            }, {
                property : 'og:title', content : `${singlePost.User.nickname}님의 글`,
            }, {
                property : 'og:description', content : singlePost.content,
            }, {
                property : 'og:image', content : singlePost.Images[0] && `http://localhost:5000/${singlePost.Images[0].src}`,
            }, {
                property : 'og:url', content : `http://localhost:5000/post/${id}`,
            }]}
        />
            <div>{singlePost.content}</div>
            <div>{singlePost.User.nickname}</div>
            <div>
                {singlePost.Images[0] && <img src={`http://localhost:5000/${singlePost.Images[0].src}`} /> }
            </div>
        </>
    );
}

Post.getInitialProps = async (context) => {
    context.store.dispatch({
        type : LOAD_POST_REQUEST,
        data : context.query.id,
    });
    return { id : parseInt(context.query.id, 10)};
};

Post.propTypes = {
    id : PropTypes.number.isRequired,
};

export default Post;