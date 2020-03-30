import React, { useState, useCallback, useEffect } from 'react';
import { Avatar, Button, Card, Comment, Form, Icon, Input, List, Popover } from 'antd';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST, LOAD_COMMENTS_REQUEST, UNLIKE_POST_REQUEST, LIKE_POST_REQUEST, RETWEET_REQUEST, REMOVE_POST_REQUEST } from '../reducers/post';
import PostImages from '../components/PostImages';
import PostCardContent from '../components/PostCardContent';
import { FOLLOW_USER_REQUEST, UNFOLLOW_USER_REQUEST } from '../reducers/user';
import styled from 'styled-components';

const CardWrapper = styled.div`
    margin-bottom: 20px;
`;

const PostCard = ( {post} ) => {
    const [commentFormOpened, setCommentFormOpened] = useState(false);
    const [commentText, setcommentText] = useState('');
    const { me } = useSelector(state => state.user);
    const { commentAdded, isAddingComment } = useSelector(state => state.post);
    const dispatch = useDispatch();
    const liked = me && post.Likers && post.Likers.find(v => v.id === me.id);

    //댓글창 켜기
    const onToggleComment = useCallback(() => {
        setCommentFormOpened(prev => !prev);
        if (!commentFormOpened) {
          dispatch({
            type: LOAD_COMMENTS_REQUEST,
            data: post.id,
          });
        }
    }, []);

    const onSubmitComment = useCallback((e) => {
        e.preventDefault();
        if(!me){ //로그인 안 한 유저가 댓글 달려고 할 때 막기
            return alert('로그인이 필요합니다.');
        }
        return dispatch({
            type : ADD_COMMENT_REQUEST,
            data : {
                postId: post.id,
                content: commentText,
            },
        });
    },[ me && me.id, commentText]);

    useEffect(() => {
       setcommentText('');
    }, [ commentAdded === true]);

    const onChangeCommentText = useCallback((e) => {
        setcommentText(e.target.value);
    }, []);

    const onToggleLike = useCallback(() => {
        if(!me){
            return alert('로그인이 필요합니다.');
        }
        //좋아요 눌렀는지 아닌지 확인
        //likers에 좋아요 누른 사람들의 배열이 있음
        if(liked) { //좋아요 누른 상태
            return dispatch({
                type : UNLIKE_POST_REQUEST,
                data : post.id,
            })
        } else { //좋아요 안 누른 상태
            return dispatch({
                type : LIKE_POST_REQUEST,
                data : post.id,
            });
        }
    }, [ me && me.id , post && post.id, liked]);


    const onRetweet = useCallback(() => {
        if(!me) {
            return alert('로그인이 필요합니다.');
        }
        return dispatch({
            type : RETWEET_REQUEST,
            data : post.id,
        })
    }, [me && me.id , post && post.id]);


    const onFollow = useCallback(userId => () => {
        dispatch({
            type : FOLLOW_USER_REQUEST,
            data : userId,
        });
    }, []);

    const onUnfollow = useCallback(userId => () => {
        dispatch({
            type : UNFOLLOW_USER_REQUEST,
            data : userId,
        });
    }, []);

    //게시글 삭제
    const onRemovePost = useCallback( userId => () => {
        dispatch({
            type : REMOVE_POST_REQUEST,
            data : userId,
        })

    }, []);

    return (
    <CardWrapper>
        <Card
            key={+post.createdAt}
            cover={post.Images[0] && <PostImages images={post.Images} />}
            actions={[
            <Icon type="retweet" key="retweet" onClick={onRetweet} />,
            <Icon 
                type="heart" 
                key="heart" 
                theme={ liked ? 'twoTone' : 'outlined' } twoToneColor="#eb2f96" 
                onClick={onToggleLike}
            />,
            <Icon type="message" key="message" onClick={onToggleComment} />,
            <Popover
                key="ellipsis"
                content={(
                    <Button.Group>
                        {me && post.UserId === me.id
                        ?(
                            <>
                            <Button>수정</Button>
                            <Button type="danger" onClick={onRemovePost(post.id)}>삭제</Button>
                            </>
                        )
                        : <Button>신고</Button>}
                    </Button.Group>
                )}
            >
                <Icon type="ellipsis" />
            </Popover>
            ]}
            title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null }
            extra={!me || post.User.id == me.id //로그인 안했거나 자기 게시글 일때
                ? null
                : me.Followings && me.Followings.find( v => v.id === post.User.id)
                ?   <Button onClick={onUnfollow(post.User.id)}>언팔로우</Button>
                :   <Button onClick={onFollow(post.User.id)}>팔로우</Button>
            }
        >
            {
                post.RetweetId && post.Retweet 
                ? (  //리트윗 여부에 따라 나누기
                <Card
                    cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images}/>}
                >
                    <Card.Meta
                    avatar={(
                        <Link href={{ pathname : '/user', query : {id : post.Retweet.User.id}}} as={`/user/${post.Retweet.User.id}`}>
                            <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                        </Link>
                    )}
                    title={post.Retweet.User.nickname} 
                    description={<PostCardContent postData={post.Retweet.content} />} 
                    />
                </Card>
                )
                : (
                <Card.Meta
                // href={`/user/${post.User.id}`} -> 동적 주소를 프론트에서 처리x -> express로 넘어감 -> 그래서 페이지가 새로 렌더링됨..ㅠㅠ..
                //프론트에서 처리할 수 있게 링크를 바꿔야함 (**동적 링크는 주의해야 함!)
                //query : express 서버에서 render 하는 거랑 같음!
                    avatar={(
                        <Link href={{ pathname : '/user', query : {id : post.User.id}}} as={`/user/${post.User.id}`}>
                            <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                        </Link>
                    )}
                    title={post.User.nickname} 
                    description={<PostCardContent postData={post.content} />} 
                />
            )}   
        </Card>
        {commentFormOpened && (
            <>
            <Form onSubmit={onSubmitComment}>
                <Form.Item>
                    <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isAddingComment}>삐약</Button>
            </Form>
            <List
                header={`${post.Comments ? post.Comments.length : 0} 댓글`}
                itemLayout="horizontal"
                dataSource={post.Comments || []}
                renderItem={item => (
                <li>
                    <Comment
                    author={item.User.nickname}
                    avatar={(
                        <Link href={{ pathname: '/user', query: { id: item.User.id } }} as={`/user/${item.User.id}`}>
                        <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                        </Link>
                    )}
                    content={item.content}
                    />
                </li>
                )}
            />
            </>
        )}
    </CardWrapper>
    )
}

PostCard.propTypes = {
    post: PropTypes.shape({
      User: PropTypes.object,
      content: PropTypes.string,
      img: PropTypes.string,
      createdAt: PropTypes.string,
    }).isRequired,
};

export default PostCard;