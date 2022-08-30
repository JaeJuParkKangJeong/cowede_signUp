import React from "react";
import { Link } from 'react-router-dom';
import styled from "styled-components";
import pair from "../images/pair.jpg";
import technology from "../images/technology.jpg";

const Container = styled.div`
  padding: 40px 20px;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  max-width: 1000px;
  div {
    width:480px; 
    height:320px;
    border : 1px; 
    float:left; 
    margin:10px;
    line-height 2;
  }
  h1 {
    font-size: 28px;
    font-weight: medium;
  }
  p {
    margin-top: 10px;
    font-size: 24px;
    line-height: 1.5;
  }
  a {
    float:right;
    color: #fff;
    font-size: 16px;
    text-decoration: none;
    background-color: #268FE1;
    padding: 5px 10px;
    border-radius: 8px;
    display: inline-block;

  }
  img {
    width:460px; 
    height:320px;
    margin:10px;
    border-radius: 8px;
  }
`;

export default function Home(props) {
  return (
    <>
      <Container>
        <Wrapper>
          <div>
            <h1>혼자 말고 같이 하는 코딩스터디</h1>
            <p>아직도 혼자 코딩하세요?</p>
            <p>지금 바로 페어를 찾아보세요!</p>
            <a><Link to={'/Matching'}>매칭시작</Link></a>
          </div>
          <div >
            <img src={pair} />
          </div>
        </Wrapper>
      </Container>
      <Container>
      <Wrapper>
        <div >
          <img src={technology} />
        </div>
        <div>
          <h1>페어 프로그래밍</h1>
          <p>
            애자일 개발 방법론 중 하나로 하나의 개발 가능한 pc에서
            개발자 둘이 함께 작업하는 것을 말합니다.
          </p>
          <p>
            네비게이터가 전략을 제시하고 
            드라이버가 실제 코드를 작성하며
            이 역할을 각자 번갈아 가며 수행합니다.
          </p>
          <a><Link to={'/Guide'}>안내시작</Link></a>
        </div>
      </Wrapper>
    </Container>
  </>
  );
}