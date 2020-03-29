import React, { useCallback } from 'react';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN_REQUEST } from '../reducers/user';
import { useInput } from '../pages/signup'; //커스텀 훅 재사용 > export const니까 { } 로 받음

const LoginForm = () => {

    const [id, onChangeId] = useInput('');
    const [password, onChangePassword] = useInput('');
    const { isLoggingIn } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const onSubmitForm = useCallback((e) => {
        e.preventDefault();
        dispatch({
            type : LOG_IN_REQUEST,
            data : {
                userId : id, 
                password
            }
        }); //로그인 하는 순간 state가 변함
    }, [id, password]);
    

    return (
        <Form onSubmit={onSubmitForm} style={{padding:'10px'}}>
            <div>
                <label htmlFor="user-id">아이디</label>
                <br />
                <Input name="user-id" value={id} onChange={onChangeId} requried />
            </div>
            <div>
                <label htmlFor="user-password">비밀번호</label>
                <br />
                <Input name="user-password" value={password} onChange={onChangePassword} type="password" requried />
            </div>
            <div style={{ marginTop : '10px' }}>
                <Button type="primary" htmlType="submit" loading={isLoggingIn}>로그인</Button>
                <Link href="/signup"><Button><a>회원가입</a></Button></Link>
            </div>
        </Form>
    )
}

export default LoginForm;