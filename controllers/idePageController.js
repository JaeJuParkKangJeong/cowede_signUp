const Questions = require("../models/questionsModel");

const num_of_ques = 2;

//프론트에서 './test/선택레벨'로 get request ->
//선택된 레벨에서 문제 2개 랜덤으로 추려서 aggregate () ->
//json 객체 배열로 리턴
const send_questions = (req, res) => {
  run();
  async function run() {
    const result = await Questions.aggregate([
      { $match: { problem_level: parseInt(req.params.Lv) } },
      { $sample: { size: num_of_ques } },
    ]);
    //console.log(result[0]);
    //console.log(result[1]);
    //문제 2개 json으로 response
    res.json({ ques_data: result });
  }
};

module.exports = {
  send_questions,
};
