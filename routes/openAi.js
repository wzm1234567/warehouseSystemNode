const express = require("express");
const db = require("../db");
const router = express.Router();
const OpenAI = require("openai"); // 最后一个自带 Headers ponyfill 的小版本
// 引入node-fetch node18 及以上版本不需要引入 18以下open不自带fetch
const fetch = require("node-fetch"); // npm install node-fetch@2 安装2的版本
const openai = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY,
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
  fetch,
});

router.post("/", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "doubao-seed-1-6-lite-251015",
      messages: [{ role: "user", content: "解释js" }],
      stream: true,
      /**
       * 采样控制（四选一，不要同时用）
       * temperature 越高越随机 number  0–2  默认 1
       * top_p 核采样阈值  number  0–1  默认 1
       * seed 固定随机种子，配合 temperature=0 可复现输出。 integer  可选
       * logit_bias 给指定 token id 加减概率，格式 { “token_id”: bias }。 object  可选
       */
      /**
       * 长度与截断 integer  可选
       * max_tokens 本次生成最多多少 token（不含 prompt）；integer  可选
       * stream true 时流失返回数据 boolean； 默认 false
       */
      /**
       * 多样性与重复惩罚
       * presence_penalty 正值鼓励引入新话题 ； number  -2.0–2.0  默认 0
       * frequency_penalty 正值抑制重复用词； number  -2.0–2.0  默认 0
       */
      /**
       * 停止条件
       * stop 遇到指定字符串立即停止。； string | string[]  可选
       */
      /**
       * 返回格式
       * response_format  object 可选： 强制 JSON 输出：{ type: "json_object" } 或者 JSON Schema（需模型支持 function calling）：{ type: "json_schema", json_schema: { name: "xxx", schema: {...} } }
       */
      /**
       * Function / Tool 调用
       * tools  Array<Tool>
       * tool_choice  控制模型是否主动调用工具  "none" | "auto" | { type: "function", function: { name: string } }
       */
      /**
       * 高级调试
       * n 一次返回几条候选消息  integer  默认 1
       * logprobs  是否返回每个 token 的对数概率  boolean  默认 false
       * top_logprobs 返回前 N 个候选 token 的 logprob  integer  0–20  需 logprobs=true
       * user 最终用户标识，供后台审计/限流。 string  可选
       * seed 前面已提及，可复现输出。
       */
      /**
       * 火山方舟（OpenAI 兼容）额外注意
       * 1.以上所有字段都支持，但 model 必须填 推理接入点 ID（ep-xxxxxxxx），而不是裸模型名。
       * 2.目前豆包系列不支持 functions/tools 时，传了会 400；需要工具调用请选支持函数调用的接入点。
       */
    });
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        // SSE 格式：data: 内容\n\n
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
    // 4. 结束
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    res.send({ code: -1, data: error, msg: "获取失败" });
  }
});
module.exports = router;
