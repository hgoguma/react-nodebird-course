import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { Button, List, Card, Icon } from 'antd';
import NickNameEditForm from '../containers/NickNameEditForm';
import { LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWINGS_REQUEST, UNFOLLOW_USER_REQUEST, REMOVE_FOLLOWER_REQUEST } from '../reducers/user';
import { LOAD_USER_POSTS_REQUEST } from '../reducers/post';
import PostCard from '../containers/PostCard';
import FollowList from '../components/FollowList';

const Profile = () => {

    const dispatch = useDispatch();
    const { followingList, followerList, hasMoreFollowers, hasMoreFollowings } = useSelector(state => state.user);
    const { mainPosts } = useSelector(state => state.post);

    
    const onUnfollow = useCallback(userId => () => {
        dispatch({
          type: UNFOLLOW_USER_REQUEST,
          data: userId,
        });
    }, []);

    const onRemoveFollower = useCallback(userId => () => {
        dispatch({
        type: REMOVE_FOLLOWER_REQUEST,
        data: userId,
        });
    }, []);

    const loadMoreFollowings = useCallback( () => {
        dispatch({
            type : LOAD_FOLLOWINGS_REQUEST,
            offset : followingList.length,
        });
    }, [followingList.length]);

    const loadMoreFollowers = useCallback( () => {
        dispatch({
            type : LOAD_FOLLOWERS_REQUEST,
            offset : followerList.length,
        });
    }, [followerList.length]);


    
    return (
        <div>
            <NickNameEditForm />
            <FollowList 
                header="팔로잉 목록"
                hasMore={hasMoreFollowings}
                onClickMore={loadMoreFollowings}
                data={followingList}
                onClickStop={onUnfollow}
            />
            <FollowList 
                header="팔로워 목록"
                hasMore={hasMoreFollowers}
                onClickMore={loadMoreFollowers}
                data={followerList}
                onClickStop={onRemoveFollower}
            />
            <List
                style={{ marginBottom : '20px' }}
                grid={{ gutter : 4, xs: 2, md: 3 }}
                size="small"
                header={<div>팔로워 목록</div>}
                loadMore={ hasMoreFollowers && <Button style={{width:'100%'}} onClick={loadMoreFollowers}>더 보기</Button>}
                bordered
                dataSource={followerList}
                renderItem={item => (
                    <List.Item style={{ marginTop : '20px' }}>
                        <Card actions={[<Icon key="stop" type="stop" onClicK={onRemoveFollower(item.id)}  />]}>
                            <Card.Meta description={item.nickname} />
                        </Card>
                    </List.Item>
                )}
            />
            <div>
                { mainPosts.map(c => (
                <PostCard key={c.id} post={c} />
                ))}
            </div>
        </div>
    )
};

Profile.getInitialProps = async (context) => {

    const state = context.store.getState();

    //이 직전에 LOAD_USERS_REQUEST가 실행됨 -> 이게 되고 나서 state.user.me가 생김

    context.store.dispatch({
        type : LOAD_FOLLOWERS_REQUEST,
        data : state.user.me && state.user.me.id,
    });
    context.store.dispatch({
        type : LOAD_FOLLOWINGS_REQUEST,
        data : state.user.me && state.user.me.id,
    });
    context.store.dispatch({ //내가 쓴 게시물 가져오기
        type : LOAD_USER_POSTS_REQUEST,
        data : state.user.me && state.user.me.id,
    });

    //이 쯤에서 LOAD_USERS_SUCCESS가 실행됨
};

export default Profile;