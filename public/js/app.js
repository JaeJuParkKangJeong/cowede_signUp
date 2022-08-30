const socket = io();

const muteBtn = document.getElementById("mute");
const micsSelect = document.getElementById("mics");
const call = document.getElementById("call");
const editor = document.getElementById("editor");

let myStream;
let muted = true;
let roomId = 0;
let myPeerConnection;
let myDataChannel;

// 마이크 목록 불러오기
async function getMics() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((device) => device.kind === "audioinput");
    const currentMic = myStream.getAudioTracks()[0];
    mics.forEach((mic) => {
      const option = document.createElement("option");
      option.value = mic.deviceId;
      option.innerText = mic.label;
      if (currentMic.label === mic.label) {
        // stream의 오디오와 paint할 때의 오디오 option을 가져와서 비교 후, stream의 오디오를 paint 하도록 한다.
        option.selected = true;
      }
      micsSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: false, // false로 놓음으로써 카메라 사용 X
  };
  const micsConstraints = {
    audio: { deviceId: { exact: deviceId } },
    video: false,
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? micsConstraints : initialConstraints
    );
    myVoice.srcObject = myStream;
    if (!deviceId) {
      await getMics();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }

  console.log(myStream.getAudioTracks());
}

function handleMicChange() {
  getMedia(micsSelect.value); // 이 코드를 통해 mic의 stream이 변경됐음.
  if (myPeerConnection) {
    const audioTrack = myStream.getAudioTracks()[0];
    const audioSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "audio");
    audioSender.replaceTrack(audioTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
micsSelect.addEventListener("input", handleMicChange);

// Welcome Form (join a room)

async function initCall() {
  await getMedia(); // 음성 장치 불러오기
  makeConnection(); // P2P 연결
}

socket.on("editor_open", async () => {
  await initCall();
  socket.emit("join_room");
});

/**
 * Socket Code
 * P2P 연결
 */

// peerB가 들어왔다는 알림을 받는 peerA에서 실행
socket.on("welcome", async (roomId) => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomId);
});

// peerA의 offer를 받게 되는 peerB에서 실행
socket.on("offer", async (offer) => {
  console.log("received the offer");
  console.log(myPeerConnection);
  myPeerConnection.setRemoteDescription(offer); // 여기가 문제임;;
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomId);
  console.log("sent the answer");
});

// peerB의 answer를 받는 peerA에서 실행
socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
  console.log("received candidate");
});

/**
 * 채팅
 */

const chat = document.getElementById("chat");
const msgForm = chat.querySelector("#msg");
const nameForm = chat.querySelector("#name");

socket.on("new_message", addMessage);

//html에 메시지 출력
function addMessage(message) {
  const ul = chat.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 메시지 전송
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = chat.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomId, () => {
    addMessage(`나: ${value}`);
  });
  input.value = "";
}

msgForm.addEventListener("submit", handleMessageSubmit);

// 닉네임 설정
// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = chat.querySelector("#name input");
//   socket.emit("nickname", input.value);
//   input.value = "";
// }

// nameForm.addEventListener("submit", handleNicknameSubmit);

/**
 * RTC Code
 */

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  console.log("RTCPeerConnection 생성 완료");
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = false; // MIC 기본값이 음소거 상태

    myPeerConnection.addTrack(track, myStream);
  });
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomId);
}

function handleAddStream(data) {
  const peerVoice = document.getElementById("peerVoice");
  peerVoice.srcObject = data.stream; // 상대 브라우저의 stream 정보(data.stream)를 html의 audio#peerVoice에 넣어준다.
}

/**
 * 동시편집, 방 만들기
 */

hljs.configure({
  // optionally configure hljs
  languages: ["javascript", "ruby", "python", "cpp"],
});

const quill = new Quill("#editor", {
  modules: {
    syntax: true, // Include syntax module
    toolbar: [["code-block"]], // Include button in toolbar
  },
  theme: "snow",
});

let code = ""; //code

//https://quilljs.com/docs/api/#editor-change
quill.on("editor-change", function (eventName, ...args) {
  if (eventName === "text-change") {
    // args[0] will be delta
    console.log("text-change: ", args[0]);

    let content = quill.getContents(); ///
    console.log("content", content.ops); ///

    code = content.reduce((acc, el) => (acc += el.insert), ""); ///
    console.log("code", code); ///
  } else if (eventName === "selection-change") {
    // args[0] will be old range
    console.log("selection-change: ", args[0]);
  }

  if (args[2] && args[2] === "user") {
    socket.emit("update", {
      event: eventName,
      delta: args[0],
      roomId: roomId,
    });
  }
});

socket.on("connect", function () {
  console.log("connected");
});

/* 유저정보 최종 형식
    socket.emit("userInfoGet", {
          level: 5,
          language: 1,
        });
    */

socket.on("update", function (data) {
  const eventName = data.event;
  const delta = data.delta;
  if (eventName === "text-change") {
    quill.updateContents(delta);
  } else if (eventName === "selection-change") {
    quill.setSelection(delta.index, delta.length);
  }
});

socket.on("roomIdPass", function (data) {
  roomId = data;
});

/**
 * 문제 출력
 */

let testCases = [
  {
    testCase_input: [],
    testCase_output: [],
  },
  {
    testCase_input: [],
    testCase_output: [],
  },
]; //

socket.on("test", (problems) => {
  console.log(problems);

  for (let i = 0; i < 2; i++) {
    // 제목
    let elProblemTitle = document.querySelector(
      `#question${i} > .problem-title`
    );
    elProblemTitle.textContent = problems[i].problem_title;

    // 문제
    let elProblemContent = document.querySelector(
      `#question${i} > .problem-content`
    );

    let content;
    for (let j = 0; j < problems[i].problem_content.length; j++) {
      content = document.createElement("div");
      content.textContent = problems[i].problem_content[j];
      elProblemContent.appendChild(content);
    }

    // 입력
    let elProblemInput = document.querySelector(
      `#question${i} > .problem-input-ex`
    );

    let input;
    for (let j = 0; j < problems[i].problem_input_ex.length; j++) {
      input = document.createElement("div");
      input.textContent = problems[i].problem_input_ex[j];
      elProblemInput.appendChild(input);
    }

    // 출력
    let elProblemOutput = document.querySelector(
      `#question${i} > .problem-output-ex`
    );

    let output;
    for (let j = 0; j < problems[i].problem_output_ex.length; j++) {
      output = document.createElement("div");
      output.textContent = problems[i].problem_output_ex[j];
      elProblemOutput.appendChild(output);
    }

    // 제한사항
    let elRestriction = document.querySelector(`#question${i} > .restriction`);

    let restriction;
    for (let j = 0; j < problems[i].restriction.length; j++) {
      restriction = document.createElement("div");
      restriction.textContent = problems[i].restriction[j];
      elRestriction.appendChild(restriction);
    }

    // 테스트케이스
    testCases[i].testCase_input = problems[i].testCase.testCase_input;
    testCases[i].testCase_output = problems[i].testCase.testCase_output;
  }
  console.log("testCases: ", testCases);
});

///
let questionNum = 0; // 처음엔 0번 문제, 맞히고 다음 문제 누르면 1번 문제

function handleClick() {
  console.log("click:", code); //

  let language_id = 52; // 50 : C, 52 : C++

  let source_code = btoa(unescape(encodeURIComponent(code)));
  console.log("source_code(encoded) : ", source_code);

  let stdin;
  let expected_output;

  let elTestcase = document.querySelector(".testcase");

  for (let i = 0; i < testCases[questionNum].testCase_input.length; i++) {
    stdin = testCases[questionNum].testCase_input[i];
    stdin = btoa(unescape(encodeURIComponent(stdin)));

    expected_output = testCases[questionNum].testCase_output[i];
    expected_output = btoa(unescape(encodeURIComponent(expected_output)));

    let body = `{"language_id":${language_id},"source_code":"${source_code}","stdin":"${stdin}","expected_output":"${expected_output}"}`;
    console.log(body);

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "be6e69c49emshc222e5e72fe2495p19ab96jsn0fb9cff7c37c",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: body,
    };

    fetch(
      // "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*",
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=stdin%2Cstdout%2Cstderr%2Cstatus",
      options
    )
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((response) => {
        console.log("response: ", response);

        let elTestcaseLi = document.createElement("li");

        let elTestcaseInput = document.createElement("div");
        elTestcaseInput.textContent = `입력값 : ${testCases[questionNum].testCase_input[i]}`;
        elTestcaseLi.appendChild(elTestcaseInput);

        let elTestcaseOutput = document.createElement("div");
        elTestcaseOutput.textContent = `기댓값 : ${testCases[questionNum].testCase_output[i]}`;
        elTestcaseLi.appendChild(elTestcaseOutput);

        let stdout = decodeURIComponent(escape(window.atob(response.stdout)));

        let elStdout = document.createElement("div");
        elStdout.textContent = `출력값 : ${stdout}`;
        elTestcaseLi.appendChild(elStdout);

        elTestcase.appendChild(elTestcaseLi);
      })
      .catch((err) => console.error(err));
  }

  // let expected_output = btoa(unescape(encodeURIComponent("Hello, world!")));

  // let body = `{"language_id":${language_id},"source_code":"${source_code}","expected_output":"${expected_output}"}`;
  // console.log(body);

  // const options = {
  //   method: "POST",
  //   headers: {
  //     "content-type": "application/json",
  //     "Content-Type": "application/json",
  //     "X-RapidAPI-Key": "be6e69c49emshc222e5e72fe2495p19ab96jsn0fb9cff7c37c",
  //     "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  //   },
  //   // body: '{"language_id":52,"source_code":"I2luY2x1ZGUgPHN0ZGlvLmg+DQoNCmludCBtYWluKHZvaWQpIHsNCiAgICBjaGFyIG5hbWVbMTBdOw0KICAgIHNjYW5mKCIlcyIsIG5hbWUpOw0KICAgIHByaW50ZigiaGVsbG8sICVzXG4iLCBuYW1lKTsNCiAgICByZXR1cm4gMDsNCn0=","stdin":"SnVkZ2Uw","expected_output":"aGVsbG8sIEp1ZGdlMA=="}',
  //   body: body,
  // };

  // fetch(
  //   // "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=*",
  //   "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true&fields=stdin%2Cstdout%2Cstderr%2Cstatus",
  //   options
  // )
  //   .then((response) => {
  //     console.log(response);
  //     return response.json();
  //   })
  //   .then((response) => {
  //     console.log(response);
  //   })
  //   .catch((err) => console.error(err));
}

const submission = document.getElementById("submission");
submission.addEventListener("click", handleClick);

const next = document.getElementById("next");
next.addEventListener("click", handleClickNext);

const prev = document.getElementById("prev");
prev.addEventListener("click", handleClickPrev);

function handleClickNext() {
  console.log("clicked next");
  questionNum = 1;

  let elQuestion0 = document.querySelector("#question0");
  elQuestion0.classList.add("hidden");

  let elQuestion1 = document.querySelector("#question1");
  elQuestion1.classList.remove("hidden");

  prev.classList.remove("hidden");
  next.classList.add("hidden");
}

function handleClickPrev() {
  console.log("clicked prev");
  questionNum = 0;

  let elQuestion0 = document.querySelector("#question0");
  elQuestion0.classList.remove("hidden");

  let elQuestion1 = document.querySelector("#question1");
  elQuestion1.classList.add("hidden");

  prev.classList.add("hidden");
  next.classList.remove("hidden");
}
