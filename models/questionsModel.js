const mongoose = require("mongoose");

//collection(table) 에 들어갈 document의 value type 설정 => 스키마 작성 => ex. class 정의
const questionsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    problem_id: {
      type: Number,
      required: true,
    },
    problem_title: {
      type: String,
      required: true,
    },
    problem_content: {
      type: [String],
      required: true,
    },
    problem_illust: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: undefined,
    },
    problem_input_ex: {
      type: [mongoose.Schema.Types.Mixed],
      required: false,
    },
    problem_output_ex: {
      type: [mongoose.Schema.Types.Mixed],
      required: false,
    },
    problem_level: {
      type: Number,
      required: true,
    },
    restriction: {
      type: [String],
      required: false,
    },

    testCase: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Questions", questionsSchema);
