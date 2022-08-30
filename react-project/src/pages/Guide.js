import React from "react";
import styled from "styled-components";
import question from "../images/question.jpg";
import goal from "../images/goal.jpg";

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
  }
  p {
    margin-top : 10px;
    font-size: 24px;
    line-height: 1.5;
  }
  a {
    color: #fff;
    font-size: 16px;
    text-decoration: none;
    background-color: #268FE1;
    padding: 5px 10px;
    border-radius: 8px;
    display: inline-block;
    float:right;
  }
  img {
    width:460px; 
    height:320px;
    margin:10px;
    border-radius: 8px;
  }
`;

export default function Guide(props) {
  return (
    <>
      <Container>
        <Wrapper>
          <div>
          <h1>페어 프로그래밍이란</h1>
          <p>
            애자일 개발 방법론 중 하나로 하나의 개발 가능한 pc에서
            개발자 둘이 함께 작업하는 것을 말합니다.
          </p>
          <p>
            네비게이터가 전략을 제시하고 
            드라이버가 실제 코드를 작성하며
            이 역할을 각자 번갈아 가며 수행합니다.
          </p>
          </div>
          <div >
            <img src={question} />
          </div>
        </Wrapper>
      </Container>
      <Container>
      <Wrapper>  
        <div>
          <h1>페어 프로그래밍을 하는 이유</h1>
          <p>
            현업에서는 팀 내의 다른 개발자 외에도 개발에 대한 
            이해도가 낮은 다른 직무와 소통하는 일이 자주 있습니다.
          </p>
          <p>
            페어 프로그래밍으로 소통 경험을 쌓고 피드백을 통해 
            서로의 강점과 부족한 점을 파악하고 개선할 수 있습니다.
          </p>
        </div>
        <div >
          <img src={goal} />
        </div>
      </Wrapper>
    </Container>
  </>
  );
}
