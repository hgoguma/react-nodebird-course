import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Input } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_COMMENT_REQUEST } from '../reducers/post';


const CommentForm = ({post}) => {

    const [commentText, setcommentText] = useState('');
    const { commentAdded, isAddingComment } = useSelector(state => state.post);
    const dispatch = useDispatch();

    useEffect(() => {
        setcommentText('');
        
    }, [ commentAdded === true]);

    const onChangeCommentText = useCallback((e) => {
        setcommentText(e.target.value);
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

    return (
        <Form onSubmit={onSubmitComment}>
            <Form.Item>
                <Input.TextArea rows={4} value={commentText} onChange={onChangeCommentText} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isAddingComment}>삐약</Button>
        </Form>
    );
};

CommentForm.propTypes = {
    post: PropTypes.object.isRequired,
}

export default CommentForm;