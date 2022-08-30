import * as React from 'react';
import { useState } from "react";
import Loading from '../components/Loading';
import styled from "styled-components";

const Container = styled.div`
  padding: 40px 20px;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 1000px;
  header{
    text-align : center;
    font-size: 32px;
    font-weight: 700;
  }
  h1 {
    font-size: 28px;
  }
  h3{
    text-align : center;
    font-size: 28px;
    font-weight: 500;
  }
  p {
    margin-top : 10px;
    font-size: 24px;
    line-height: 1.5;
  }
  input{
    font-size: 16px;
    text-decoration: none;
    padding: 5px 10px;
    margin: 4px;
  }
  button{
    color: #fff;
    font-size: 15px;
    text-decoration: none;
    background-color: #268FE1;
    padding: 6px 10px;
    border : 0;
    border-radius: 8px;
    display: inline-block;
  }
`;

const Matching = () => {
  const [level, setLevel] = useState("");
  const onChangeLevel = (e) => {
    setLevel(e.target.value);
  };
  // const [loading, setLoading] = useState(null);
  const onClickMatch = () => {
    // 매칭 누르면 먼저 로딩중 띄우고, 매칭되면 페이지 이동하게 수정하고싶음..
    window.open("http://localhost:3000/editor", "_blank");
  };
  return (
    <>
      <Container>
        <Wrapper>
          <h1>페어 매칭</h1>
          <p>레벨을 입력하세요</p>
          <input placeholder="level(1~5)" onChange={onChangeLevel}></input>
          <button onClick={onClickMatch}>매칭</button>
          </Wrapper>
      </Container>
      <Container>
        <Wrapper>
          <header>페어를 찾는 중 입니다</header>
          <h3>잠시만 기다려주세요</h3>
          <Loading />
        </Wrapper>
      </Container>
    </>
  );
};

export default Matching;