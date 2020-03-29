import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import { LOAD_USER_REQUEST } from '../reducers/user';
import { Card, Avatar } from 'antd';
import PostCard from '../componets/PostCard';

const User = () => {

    const { mainPosts } = useSelector(state => state.post);
    const { userInfo } = useSelector(state => state.user);

    return (
        <div>
            {userInfo 
                ? (
                <Card
                    actions={[
                        <div key="twit">
                            짹짹
                            <br />
                            {userInfo.Posts}
                        </div>,
                        <div key="following">
                            팔로잉
                            <br />
                            {userInfo.Followings}
                        </div>,
                        <div key="follower">
                            팔로워
                            <br />
                            {userInfo.Followers}
                        </div>,
                        ]}
                >
                    <Card.Meta
                        avatar={<Avatar>{userInfo.nickname[0]}</Avatar>}
                        title={userInfo.nickname}
                    />
                </Card>
                ) 
                : null}
            {mainPosts.map(c => {
                <PostCard key={+c.createdAt} post={c} />
            })}
        </div>
    )
};

User.propTypes = {
    id : PropTypes.number.isRequired,
}

User.getInitialProps = async (context) => { 
    //console.log('id getInitialProps'+context.query.id); //서버에서 데이터 가져옴
    const id = context.query.id;

    context.store.dispatch({ //남의 정보 가져오기
        type : LOAD_USER_REQUEST,
        data : id,
    });

    context.store.dispatch({ //남의 게시글 가져오기
        type : LOAD_USER_POSTS_REQUEST,
        data : id,
    });
    return { id }  //return 해서 프론트에 데이터 전달 가능
}

export default User;