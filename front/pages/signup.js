import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Router from 'next/router';
import { SIGN_UP_REQUEST } from '../reducers/user';

//커스텀 훅 활용하기
export const useInput = (initValue = null) => {
    const [value, setter] = useState(initValue);
    const handler = useCallback((e) => {
        setter(e.target.value);
    }, []);
    return [value, handler];
};

const Signup = () => {
    
    const [id, onChangeId] = useInput('');
    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [term, setTerm] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [termError, setTermError] = useState(false);

    const dispatch = useDispatch();

    const { isSigningUp, me } = useSelector(state => state.user);

    useEffect(() => {
        if(me) {
            alert('로그인 했으니 메인 페이지로 이동합니다.');
            Router.push('/'); //signup -> main 페이지 이동
        }
    }, [ me && me.id]); //로그인해서 id가 생겼을 때

    //props로 넘겨주는 함수들은 use callback으로 감싸주기!
    //why? 함수 컴포넌트가 state가 바뀔 때마다 통째로 실행되고 함수들이 새로 생성됨! 
    //그 함수를 전달받은 자식 컴포넌트들은 객체가 새로 생성됨(이전 객체와 달라짐) 다시 렌더링됨

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        if(password !== passwordCheck) {
            return setPasswordError(true);
        }
        if(!term) {
            return setTermError(true);
        }
        dispatch({
            type : SIGN_UP_REQUEST,
            data : {
                userId : id,
                password : password,
                nickname : nick
            }
        })
    }, [id, nick, password, passwordCheck, term]);

    const onChangeNick = useCallback((e) => {
        setNick(e.target.value);
    },[password]);
    const onChangePassword = (e) => {
        setPassword(e.target.value);
    };
    const onChangePasswordChk = (e) => {
        setPasswordError(e.target.value !== password);
        setPasswordCheck(e.target.value);
    };
    const onChangeTerm = useCallback((e) => {
        setTermError(false);
        setTerm(e.target.checked);
    }, []);

    if(me) { //로그인 한 상태면 회원가입 화면 안 보여주기!
        return null;
    }

    return (
        <>
            <Form onSubmit={onSubmit} style={{ padding : 10 }}>
                <div>
                    <label htmlFor="user-id">아이디</label>
                    <br />
                    <Input name="user-id" value={id} required onChange={onChangeId} />
                </div>
                <div>
                    <label htmlFor="user-nick">닉네임</label>
                    <br />
                    <Input name="user-nick" value={nick} required onChange={onChangeNick} />
                </div>
                <div>
                    <label htmlFor="user-password">비밀번호</label>
                    <br />
                    <Input name="user-password" value={password} type="password" required onChange={onChangePassword} />
                </div>
                <div>
                    <label htmlFor="user-password-check">비밀번호 체크</label>
                    <br />
                    <Input name="user-password-check" value={passwordCheck} type="password" required onChange={onChangePasswordChk} />
                    {passwordError && <div style={{color:'red'}}>비밀번호가 일치하지 않습니다.</div>}

                </div>
                <div>
                    <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
                        제로초 말을 잘 들을 것을 동의합니다.
                    </Checkbox>
                    {termError && <div style={{color:'red'}}>약관에 동의해주세요.</div>}
                </div>
                <div style={{marginTop:10}}>
                    <Button type="primary" htmlType="submit" loading={isSigningUp}>가입하기</Button>
                </div>
            </Form>
        </>
    )
}

export default Signup;