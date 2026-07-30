export type StageStatus = "cleared" | "current" | "locked";
export type Stage = { id:string; title:string; subtitle:string; questions:number; status:StageStatus; score?:number; progress?:number };
export type Category = { id:string; label:string; caption:string; stages:Stage[] };

export type Question = {
  id: string; kind: "transform"|"cloze"|"pattern"; prompt: string;
  subject?: string; reading?: string;
  sentenceBefore?: string; sentenceAfter?: string; translation?: string; situation?: string; optionNotes?: string[];
  options: string[]; answerIndex: number; explanation: string; rule?: string;
};

const clozePrompt = "空欄に入る助詞を選んでください";
const patternPrompt = "場面に合う文型を選んでください";

/* ================================================================
   各关卡 8 题，严格由易到难：
   Q1: 最基础概念，一眼能答
   Q2-3: 稍有变化，仍需基本知识
   Q4-5: 不同用法模式，需要分辨
   Q6-7: 边界情况、易错点
   Q8: 最难，需要综合判断
   ================================================================ */

// ── j1: は vs が（Q1最容易 → Q8最难） ──
const waGaQuestions: Question[] = [
  {id:"j1q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたし",sentenceAfter:"田中です。",translation:"我是田中。",options:["は","が","を","も"],answerIndex:0,rule:"主題の提示",explanation:"自我介绍时提示话题用「は」，最简单最常用。"},
  {id:"j1q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"日本語",sentenceAfter:"おもしろいです。",translation:"日语很有趣。",options:["は","が","を","で"],answerIndex:0,rule:"一般的な説明",explanation:"对已知话题进行一般评价时用「は」。"},
  {id:"j1q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"あ、バス",sentenceAfter:"来た！",translation:"啊，公交来了！",options:["は","も","が","を"],answerIndex:2,rule:"新情報・発見",explanation:"发现眼前新发生的事情，用「が」表示新信息。"},
  {id:"j1q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"だれ",sentenceAfter:"来ますか。",translation:"谁会来？",options:["は","が","に","で"],answerIndex:1,rule:"疑問詞が主語",explanation:"疑问词作主语时必须用「が」。"},
  {id:"j1q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"へやに だれ",sentenceAfter:"いますか。",translation:"房间里有人吗？",options:["は","が","を","に"],answerIndex:1,rule:"存在の主語",explanation:"存在动词「いる/ある」+疑问词，双重规则都要求「が」。"},
  {id:"j1q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"ぞう",sentenceAfter:"鼻が長いです。",translation:"大象鼻子长。",options:["が","は","を","に"],answerIndex:1,rule:"大主語",explanation:"整句主题「ぞうは」，谓语中小主语用「が」。注意这里填的是「ぞう」后面的助词。"},
  {id:"j1q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"ぞうは鼻",sentenceAfter:"長いです。",translation:"大象的鼻子长。",options:["が","は","も","を"],answerIndex:0,rule:"小主語",explanation:"「は」引出主题后，谓语部分的小主语用「が」。「鼻が長い」描述状态。"},
  {id:"j1q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたし",sentenceAfter:"ケーキが好きです。",translation:"我喜欢蛋糕。",options:["が","を","は","に"],answerIndex:2,rule:"は+が構文",explanation:"最难：需要判断主题和对象的双层关系。主题「わたしは」+对象「ケーキが」+「好きだ」。"},
];

// ── j2: に vs で ──
const niDeQuestions: Question[] = [
  {id:"j2q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"教室",sentenceAfter:"勉強します。",translation:"在教室学习。",options:["に","で","を","へ"],answerIndex:1,rule:"動作の場所",explanation:"动作发生场所用「で」，最基础的规则。"},
  {id:"j2q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"七時",sentenceAfter:"起きます。",translation:"七点起床。",options:["に","で","を","から"],answerIndex:0,rule:"時点",explanation:"具体时间点用「に」。"},
  {id:"j2q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"東京",sentenceAfter:"住んでいます。",translation:"住在东京。",options:["で","に","を","から"],answerIndex:1,rule:"存在の場所",explanation:"「住む・いる・ある」等存在动词的地点用「に」。"},
  {id:"j2q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"バス",sentenceAfter:"学校へ行きます。",translation:"坐公交去学校。",options:["に","で","を","と"],answerIndex:1,rule:"手段",explanation:"交通工具用「で」表示手段。"},
  {id:"j2q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"いす",sentenceAfter:"座ります。",translation:"坐在椅子上。",options:["で","に","を","が"],answerIndex:1,rule:"到達点",explanation:"动作的到达点/接触点用「に」。区别于动作场所「で」。"},
  {id:"j2q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"図書館",sentenceAfter:"本を借ります。",translation:"在图书馆借书。",options:["に","で","を","へ"],answerIndex:1,rule:"動作の場所",explanation:"「借りる」是具体动作，场所用「で」。不要和存在动词混淆。"},
  {id:"j2q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"かべ",sentenceAfter:"写真をはります。",translation:"把照片贴在墙上。",options:["で","を","に","が"],answerIndex:2,rule:"着点 vs 作業場所",explanation:"难：「貼る」是附着动作，附着点是「に」。如果用「で」就变成在墙上做贴的动作。"},
  {id:"j2q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"はさみ",sentenceAfter:"紙を切ります。",translation:"用剪刀剪纸。",options:["に","を","で","が"],answerIndex:2,rule:"道具",explanation:"最难：工具用「で」，区别于场所「で」和附着点「に」，需要从语境判断。"},
];

// ── j3: を vs が ──
const oGaQuestions: Question[] = [
  {id:"j3q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたしはコーヒー",sentenceAfter:"飲みます。",translation:"我喝咖啡。",options:["が","を","に","で"],answerIndex:1,rule:"他動詞の目的語",explanation:"「飲む」是他动词，对象用「を」。"},
  {id:"j3q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"ドア",sentenceAfter:"開きます。",translation:"门开了。",options:["を","が","に","は"],answerIndex:1,rule:"自動詞の主語",explanation:"「開く」是自动词，自然变化的主语用「が」。"},
  {id:"j3q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたしがドア",sentenceAfter:"開けます。",translation:"我把门打开。",options:["が","に","を","で"],answerIndex:2,rule:"他動詞の目的語",explanation:"他动词「開ける」的有意识操作对象用「を」。"},
  {id:"j3q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"電気",sentenceAfter:"消えました。",translation:"灯灭了。",options:["が","を","に","は"],answerIndex:0,rule:"自動詞の主語",explanation:"自动词「消える」，自然发生的变化用「が」。"},
  {id:"j3q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたしは電気",sentenceAfter:"消しました。",translation:"我关了灯。",options:["が","を","に","で"],answerIndex:1,rule:"他動詞の目的語",explanation:"他动词「消す」，有意识操作对象用「を」。注意和上题自动词对比。"},
  {id:"j3q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたしは水",sentenceAfter:"ほしいです。",translation:"我想要水。",options:["を","が","に","も"],answerIndex:1,rule:"願望の対象",explanation:"形容词谓语「ほしい」的对象用「が」，区别于他动词用「を」。"},
  {id:"j3q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"日本語の意味",sentenceAfter:"分かります。",translation:"明白日语的意思。",options:["を","が","に","で"],answerIndex:1,rule:"自動詞の対象",explanation:"「分かる」虽是理解义，但语法上作自动词，对象用「が」。"},
  {id:"j3q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"毎朝、公園",sentenceAfter:"散歩します。",translation:"每天早上在公园散步。",options:["に","が","を","も"],answerIndex:2,rule:"移動の経路",explanation:"最难：「を」表示移动经过的路径，既非宾语也非他动词对象。"},
];

// ── j4: も・と・や ──
const moToYaQuestions: Question[] = [
  {id:"j4q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"わたし",sentenceAfter:"学生です。",translation:"我也是学生。",options:["は","も","が","を"],answerIndex:1,rule:"同類追加",explanation:"最基础：「も」表示同类追加，相当于中文的“也”。"},
  {id:"j4q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"りんご",sentenceAfter:"みかんが好きです。",translation:"喜欢苹果和橘子。",options:["と","も","が","は"],answerIndex:0,rule:"並列列挙",explanation:"「と」全部列举两个确定项目。"},
  {id:"j4q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"彼",sentenceAfter:"兄は医者です。",translation:"他和他哥哥都是医生。",options:["や","も","と","が"],answerIndex:2,rule:"人物の並列",explanation:"「AとB」列举两个人。"},
  {id:"j4q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"山田さん",sentenceAfter:"会いました。",translation:"也见到了山田先生。",options:["が","も","と","は"],answerIndex:1,rule:"「も」の対象",explanation:"前面见过别人，这里用「も」表示“也”。"},
  {id:"j4q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"かばんの中に本",sentenceAfter:"ペンがあります。",translation:"包里有书和笔等。",options:["も","や","と","が"],answerIndex:1,rule:"例示列挙",explanation:"「や」暗示还有其他，不完全列举。"},
  {id:"j4q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"部屋に机",sentenceAfter:"いすなどがあります。",translation:"房间里有桌子和椅子等。",options:["も","や","と","は"],answerIndex:1,rule:"や＋など",explanation:"「や」常和「など」搭配使用。"},
  {id:"j4q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"日本語",sentenceAfter:"英語を勉強しています。",translation:"在学日语和英语。",options:["と","も","や","が"],answerIndex:0,rule:"名詞の並列",explanation:"两个确定项目用「と」。区别于「や」的暗示性。"},
  {id:"j4q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"どこに行って",sentenceAfter:"だめです。",translation:"去哪儿都不行。",options:["と","や","も","は"],answerIndex:2,rule:"疑問詞＋も＋否定",explanation:"最难：疑问词+「も」+否定=全面否定。"},
];

// ── j5: から・まで・より ──
const karaMadeYoriQuestions: Question[] = [
  {id:"j5q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"家",sentenceAfter:"学校まで歩きます。",translation:"从家走到学校。",options:["に","から","で","を"],answerIndex:1,rule:"起点",explanation:"「から」表示空间起点。"},
  {id:"j5q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"ここ",sentenceAfter:"駅までどのくらいですか。",translation:"从这里到车站多远？",options:["が","から","を","に"],answerIndex:1,rule:"空間の起点",explanation:"空间起点用「から」。"},
  {id:"j5q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"9時",sentenceAfter:"5時まで働きます。",translation:"从9点工作到5点。",options:["に","から","で","まで"],answerIndex:1,rule:"時間の起点",explanation:"时间起点「から」+终点「まで」搭配使用。"},
  {id:"j5q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"日本",sentenceAfter:"中国のほうが広いです。",translation:"中国比日本大。",options:["より","から","まで","では"],answerIndex:0,rule:"比較の基準",explanation:"「より」表示比较基准。"},
  {id:"j5q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"電車",sentenceAfter:"バスのほうが安いです。",translation:"巴士比电车便宜。",options:["は","から","まで","より"],answerIndex:3,rule:"比較の基準",explanation:"比较句中用「より」引出比较对象。"},
  {id:"j5q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"明日",sentenceAfter:"の予定は？",translation:"明天之后的安排？",options:["まで","から","まで","より"],answerIndex:1,rule:"時間の起点",explanation:"「明日から」=从明天开始。注意选项中有两个「まで」干扰。"},
  {id:"j5q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"お母さん",sentenceAfter:"プレゼントをもらいました。",translation:"从妈妈那里收到了礼物。",options:["に","より","から","まで"],answerIndex:2,rule:"授受の起点",explanation:"授受动词的给予方用「から」或「に」。此处两个都对但选项只给了「から」。"},
  {id:"j5q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"私",sentenceAfter:"スポーツはテニスが一番好きです。",translation:"运动里我最喜欢网球。",options:["から","まで","では","より"],answerIndex:3,rule:"比較の基準",explanation:"最难：在范围内比较，需要理解整句结构才能判断。"},
];

// ── j6: 助詞総合（Q1最简单 → Q16最难） ──
const joshiSougouQuestions: Question[] = [
  {id:"j6q1",kind:"cloze",prompt:clozePrompt,sentenceBefore:"私",sentenceAfter:"昨日友達と映画を見ました。",translation:"我昨天和朋友看了电影。",options:["が","は","を","に"],answerIndex:1,rule:"主題",explanation:"全句主题用「は」，最基础的助词用法。"},
  {id:"j6q2",kind:"cloze",prompt:clozePrompt,sentenceBefore:"先生",sentenceAfter:"教室に入りました。",translation:"老师进了教室。",options:["は","が","を","で"],answerIndex:1,rule:"新情報",explanation:"首次出现的新信息主语用「が」。"},
  {id:"j6q3",kind:"cloze",prompt:clozePrompt,sentenceBefore:"図書館",sentenceAfter:"静かにしてください。",translation:"在图书馆请保持安静。",options:["に","で","を","から"],answerIndex:1,rule:"動作の場所",explanation:"动作发生场所用「で」。"},
  {id:"j6q4",kind:"cloze",prompt:clozePrompt,sentenceBefore:"バス",sentenceAfter:"会社に行きます。",translation:"坐公交去公司。",options:["に","を","で","から"],answerIndex:2,rule:"手段",explanation:"交通工具用「で」。"},
  {id:"j6q5",kind:"cloze",prompt:clozePrompt,sentenceBefore:"学校",sentenceAfter:"駅まで10分です。",translation:"从学校到车站10分钟。",options:["が","から","に","を"],answerIndex:1,rule:"起点",explanation:"空间起点用「から」。"},
  {id:"j6q6",kind:"cloze",prompt:clozePrompt,sentenceBefore:"壁",sentenceAfter:"ポスターを貼りました。",translation:"在墙上贴了海报。",options:["で","を","に","から"],answerIndex:2,rule:"着点",explanation:"附着点用「に」。"},
  {id:"j6q7",kind:"cloze",prompt:clozePrompt,sentenceBefore:"コーヒー",sentenceAfter:"紅茶、どちらがいいですか。",translation:"咖啡和红茶，哪个好？",options:["や","も","と","が"],answerIndex:2,rule:"並列列挙",explanation:"两个确定选项并列用「と」。"},
  {id:"j6q8",kind:"cloze",prompt:clozePrompt,sentenceBefore:"肉",sentenceAfter:"魚のほうがヘルシーです。",translation:"鱼比肉更健康。",options:["は","から","より","まで"],answerIndex:2,rule:"比較",explanation:"比较基准用「より」。"},
  {id:"j6q9",kind:"cloze",prompt:clozePrompt,sentenceBefore:"田中さん",sentenceAfter:"鈴木さんも来ました。",translation:"田中和铃木都来了。",options:["と","や","が","は"],answerIndex:0,rule:"人物並列",explanation:"两个人物并列用「と」。"},
  {id:"j6q10",kind:"cloze",prompt:clozePrompt,sentenceBefore:"あの店",sentenceAfter:"ラーメンやうどんなどがあります。",translation:"那家店有拉面、乌冬等。",options:["が","に","で","を"],answerIndex:1,rule:"存在場所",explanation:"存在动词场所用「に」。"},
  {id:"j6q11",kind:"cloze",prompt:clozePrompt,sentenceBefore:"誰",sentenceAfter:"このケーキを作りましたか。",translation:"谁做了这个蛋糕？",options:["は","が","を","も"],answerIndex:1,rule:"疑問詞主語",explanation:"疑问词主语必须用「が」。"},
  {id:"j6q12",kind:"cloze",prompt:clozePrompt,sentenceBefore:"昨日何",sentenceAfter:"食べませんでした。",translation:"昨天什么都没吃。",options:["が","を","も","は"],answerIndex:2,rule:"全面否定",explanation:"疑问词+「も」+否定=全面否定。"},
  {id:"j6q13",kind:"cloze",prompt:clozePrompt,sentenceBefore:"駅前",sentenceAfter:"新しいスーパーができました。",translation:"车站前有了新超市。",options:["は","に","を","から"],answerIndex:1,rule:"出現場所",explanation:"出现场所用「に」，和存在动词同理。"},
  {id:"j6q14",kind:"cloze",prompt:clozePrompt,sentenceBefore:"友達",sentenceAfter:"プレゼントをもらいました。",translation:"从朋友那里收到了礼物。",options:["は","から","を","が"],answerIndex:1,rule:"授受起点",explanation:"授受的给予方用「から」。"},
  {id:"j6q15",kind:"cloze",prompt:clozePrompt,sentenceBefore:"彼は医者",sentenceAfter:"、弁護士でもあります。",translation:"他既是医生也是律师。",options:["と","も","で","が"],answerIndex:2,rule:"で＋も",explanation:"「で」+「も」=也作为……。"},
  {id:"j6q16",kind:"cloze",prompt:clozePrompt,sentenceBefore:"日本語",sentenceAfter:"勉強すればするほど面白いです。",translation:"日语越学越有趣。",options:["を","は","が","に"],answerIndex:1,rule:"主題対比",explanation:"最难：对比性主题用「は」，需要理解「〜ば〜ほど」句型。"},
];

// ── h1: ます形→辞書形 ──
const jishoQuestions: Question[] = [
  {id:"h1q1",kind:"transform",prompt:"辞書形に変形してください",subject:"食べます",reading:"たべます",options:["食べる","食べす","食べられる","食べく"],answerIndex:0,rule:"Ⅱ類→る",explanation:"二类动词最简单：去「ます」加「る」→「食べる」。"},
  {id:"h1q2",kind:"transform",prompt:"辞書形に変形してください",subject:"見ます",reading:"みます",options:["見く","見る","見せる","見られる"],answerIndex:1,rule:"Ⅱ類→る",explanation:"二类动词「見ます」→「見る」，同样简单规则。"},
  {id:"h1q3",kind:"transform",prompt:"辞書形に変形してください",subject:"起きます",reading:"おきます",options:["起く","起きる","起かす","起ける"],answerIndex:1,rule:"Ⅱ類→る",explanation:"二类动词去ます加る→「起きる」。注意区分一类动词。"},
  {id:"h1q4",kind:"transform",prompt:"辞書形に変形してください",subject:"書きます",reading:"かきます",options:["書く","書きる","書ける","書かす"],answerIndex:0,rule:"Ⅰ類→う段",explanation:"一类动词：去「ます」后末尾假名变「う」段→「書く」。"},
  {id:"h1q5",kind:"transform",prompt:"辞書形に変形してください",subject:"話します",reading:"はなします",options:["話す","話く","話せる","話る"],answerIndex:0,rule:"Ⅰ類→す",explanation:"「話します」→「話す」，注意不是「話く」。"},
  {id:"h1q6",kind:"transform",prompt:"辞書形に変形してください",subject:"遊びます",reading:"あそびます",options:["遊ぶ","遊べる","遊びる","遊ばす"],answerIndex:0,rule:"Ⅰ類→ぶ",explanation:"「遊びます」→「遊ぶ」，び段变ぶ段。"},
  {id:"h1q7",kind:"transform",prompt:"辞書形に変形してください",subject:"します",options:["する","す","すれ","しる"],answerIndex:0,rule:"不規則",explanation:"最常用不規則动词：「します」→「する」。"},
  {id:"h1q8",kind:"transform",prompt:"辞書形に変形してください",subject:"来ます",reading:"きます",options:["くる","くるい","こる","きる"],answerIndex:2,rule:"不規則",explanation:"最难：不規則カ変「来ます」→「来る」读作「くる」，和汉字读音不直接对应。"},
];

// ── h2: て形 ──
const teFormQuestions: Question[] = [
  {id:"h2q1",kind:"transform",prompt:"て形に変形してください",subject:"食べる",reading:"たべる",options:["食べって","食べて","食べいて","食べんで"],answerIndex:1,rule:"二類動詞",explanation:"二类动词最简单：去る加「て」→「食べて」。"},
  {id:"h2q2",kind:"transform",prompt:"て形に変形してください",subject:"話す",reading:"はなす",options:["話して","話いて","話って","話んで"],answerIndex:0,rule:"す→して",explanation:"「す」→「して」，无音便，规则简单。"},
  {id:"h2q3",kind:"transform",prompt:"て形に変形してください",subject:"書く",reading:"かく",options:["書きて","書いて","書って","書んで"],answerIndex:1,rule:"く→いて",explanation:"「く」→「いて」，注意不是「書きて」。"},
  {id:"h2q4",kind:"transform",prompt:"て形に変形してください",subject:"泳ぐ",reading:"およぐ",options:["泳いで","泳いて","泳ぎて","泳んで"],answerIndex:0,rule:"ぐ→いで",explanation:"「ぐ」→「いで」，浊音保留变「で」。"},
  {id:"h2q5",kind:"transform",prompt:"て形に変形してください",subject:"待つ",reading:"まつ",options:["待いて","待ちて","待って","待んで"],answerIndex:2,rule:"つ→って",explanation:"促音便：「つ」→「って」。"},
  {id:"h2q6",kind:"transform",prompt:"て形に変形してください",subject:"飲む",reading:"のむ",options:["飲みて","飲んで","飲いで","飲って"],answerIndex:1,rule:"む→んで",explanation:"拨音便：「む」→「んで」。"},
  {id:"h2q7",kind:"transform",prompt:"て形に変形してください",subject:"行く",reading:"いく",options:["行いて","行きて","行って","行んで"],answerIndex:2,rule:"例外",explanation:"陷阱：「行く」是「く」结尾唯一例外，变「行って」。"},
  {id:"h2q8",kind:"transform",prompt:"て形に変形してください",subject:"する",options:["して","すって","しって","せて"],answerIndex:0,rule:"不規則",explanation:"最难：不規則「する」→「して」，完全没有规律可循。"},
];

// ── h3: た形・ない形 ──
const taNaiQuestions: Question[] = [
  {id:"h3q1",kind:"transform",prompt:"た形に変形してください",subject:"食べる",reading:"たべる",options:["食べた","食べった","食べんだ","食べいた"],answerIndex:0,rule:"Ⅱ類→た",explanation:"二类动词最简单：去る加「た」。"},
  {id:"h3q2",kind:"transform",prompt:"ない形に変形してください",subject:"食べる",reading:"たべる",options:["食べない","食べらない","食べないる","食べくない"],answerIndex:0,rule:"Ⅱ類→ない",explanation:"二类动词去る直接加「ない」。"},
  {id:"h3q3",kind:"transform",prompt:"た形に変形してください",subject:"書く",reading:"かく",options:["書いた","書った","書んだ","書した"],answerIndex:0,rule:"く→いた",explanation:"和て形变化规则相同：「く」→「いた」。"},
  {id:"h3q4",kind:"transform",prompt:"ない形に変形してください",subject:"書く",reading:"かく",options:["書かない","書ない","書くない","書かなく"],answerIndex:0,rule:"く→かない",explanation:"「く」→「か」+「ない」，变「あ」段。"},
  {id:"h3q5",kind:"transform",prompt:"た形に変形してください",subject:"泳ぐ",reading:"およぐ",options:["泳いだ","泳いた","泳んだ","泳いで"],answerIndex:0,rule:"ぐ→いだ",explanation:"「ぐ」→「いだ」，浊音保留变「だ」。"},
  {id:"h3q6",kind:"transform",prompt:"ない形に変形してください",subject:"する",options:["しない","すない","せない","しらない"],answerIndex:0,rule:"不規則",explanation:"不規則：「する」→「しない」。"},
  {id:"h3q7",kind:"transform",prompt:"た形に変形してください",subject:"来る",reading:"くる",options:["きた","くた","こた","きたる"],answerIndex:0,rule:"不規則",explanation:"不規則：「来る」→「来た（きた）」。"},
  {id:"h3q8",kind:"transform",prompt:"ない形に変形してください",subject:"来る",reading:"くる",options:["こない","くない","きない","こなかった"],answerIndex:0,rule:"不規則",explanation:"最难：「来る」→「来ない（こない）」，読み方も不規則。"},
];

// ── h4: 可能・受身・使役 ──
const kanouUkemiQuestions: Question[] = [
  {id:"h4q1",kind:"transform",prompt:"可能形に変形してください",subject:"食べる",reading:"たべる",options:["食べられる","食べれる","食べさせる","食べすることができる"],answerIndex:0,rule:"Ⅱ類可能形",explanation:"二类最简单：去る加「られる」→「食べられる」。"},
  {id:"h4q2",kind:"transform",prompt:"可能形に変形してください",subject:"書く",reading:"かく",options:["書ける","書かれる","書かせる","書くことができる"],answerIndex:0,rule:"Ⅰ類可能形",explanation:"一类可能形：「く」→「ける」。"},
  {id:"h4q3",kind:"transform",prompt:"受身形に変形してください",subject:"ほめる",options:["ほめられる","ほめれる","ほめさせる","ほめかれる"],answerIndex:0,rule:"Ⅱ類受身形",explanation:"二类受身：去る加「られる」→「ほめられる」（被表扬）。"},
  {id:"h4q4",kind:"transform",prompt:"受身形に変形してください",subject:"書く",reading:"かく",options:["書かれる","書ける","書かせる","書くされる"],answerIndex:0,rule:"Ⅰ類受身形",explanation:"一类受身形：「く」→「かれる」（あ段+れる）。"},
  {id:"h4q5",kind:"transform",prompt:"使役形に変形してください",subject:"食べる",reading:"たべる",options:["食べさせる","食べられる","食べせられる","食べす"],answerIndex:0,rule:"Ⅱ類使役形",explanation:"二类使役：去る加「させる」。「食べさせる」=让别人吃。"},
  {id:"h4q6",kind:"transform",prompt:"使役形に変形してください",subject:"行く",reading:"いく",options:["行かせる","行ける","行かれる","行くさせる"],answerIndex:0,rule:"Ⅰ類使役形",explanation:"一类使役：「く」→「かせる」。「行かせる」=让某人去。"},
  {id:"h4q7",kind:"transform",prompt:"可能形に変形してください",subject:"来る",reading:"くる",options:["こられる","くられる","きられる","くるられる"],answerIndex:0,rule:"不規則可能",explanation:"不規則：「来る」→「来られる（こられる）」。"},
  {id:"h4q8",kind:"transform",prompt:"使役受身形に変形してください",subject:"食べる",reading:"たべる",options:["食べさせられる","食べさせる","食べられる","食べさせれる"],answerIndex:0,rule:"使役受身",explanation:"最难：使役+受身双重叠加，二类去る加「させられる」=被迫吃。"},
];

// ── h5: 変形総合 ──
const henkeiSougouQuestions: Question[] = [
  {id:"h5q1",kind:"transform",prompt:"辞書形に変形してください",subject:"起きます",reading:"おきます",options:["起きる","起く","起かす","起ける"],answerIndex:0,rule:"Ⅱ類辞書形",explanation:"二类动词最简单：去ます加る→「起きる」。"},
  {id:"h5q2",kind:"transform",prompt:"て形に変形してください",subject:"買う",reading:"かう",options:["買って","買いて","買うて","買いて"],answerIndex:0,rule:"う→って",explanation:"促音便：「う」→「って」。"},
  {id:"h5q3",kind:"transform",prompt:"た形に変形してください",subject:"読む",reading:"よむ",options:["読んだ","読いた","読った","読んで"],answerIndex:0,rule:"む→んだ",explanation:"拨音便：「む」→「んだ」。"},
  {id:"h5q4",kind:"transform",prompt:"ない形に変形してください",subject:"話す",reading:"はなす",options:["話さない","話しない","話すない","話せない"],answerIndex:0,rule:"す→さない",explanation:"「す」→「さ」+「ない」→「話さない」。"},
  {id:"h5q5",kind:"transform",prompt:"辞書形に変形してください",subject:"来ます",reading:"きます",options:["来る","くる","こる","きる"],answerIndex:0,rule:"不規則",explanation:"不規則カ変：「来ます」→「来る」。"},
  {id:"h5q6",kind:"transform",prompt:"ない形に変形してください",subject:"寝る",reading:"ねる",options:["寝ない","寝らない","寝くない","寝ないる"],answerIndex:0,rule:"Ⅱ類ない形",explanation:"二类ない形：「寝る」→「寝ない」。"},
  {id:"h5q7",kind:"transform",prompt:"て形に変形してください",subject:"遊ぶ",reading:"あそぶ",options:["遊んで","遊いで","遊って","遊ぶて"],answerIndex:0,rule:"ぶ→んで",explanation:"拨音便：「ぶ」→「んで」。"},
  {id:"h5q8",kind:"transform",prompt:"た形に変形してください",subject:"する",options:["した","すた","したる","しった"],answerIndex:0,rule:"不規則",explanation:"「する」→「した」。"},
  {id:"h5q9",kind:"transform",prompt:"可能形に変形してください",subject:"読む",reading:"よむ",options:["読める","読まれる","読ませる","読むことができる"],answerIndex:0,rule:"む→める",explanation:"一类可能形：「む」→「める」。"},
  {id:"h5q10",kind:"transform",prompt:"受身形に変形してください",subject:"呼ぶ",reading:"よぶ",options:["呼ばれる","呼べる","呼ばせる","呼ぶれる"],answerIndex:0,rule:"ぶ→ばれる",explanation:"一类受身：「ぶ」→「ばれる」。"},
  {id:"h5q11",kind:"transform",prompt:"使役形に変形してください",subject:"立つ",reading:"たつ",options:["立たせる","立てる","立たれる","立つせる"],answerIndex:0,rule:"つ→たせる",explanation:"一类使役：「つ」→「たせる」。"},
  {id:"h5q12",kind:"transform",prompt:"可能形に変形してください",subject:"する",options:["できる","すれる","しれる","せれる"],answerIndex:0,rule:"不規則可能",explanation:"不規則：「する」→「できる」，完全替换。"},
  {id:"h5q13",kind:"transform",prompt:"受身形に変形してください",subject:"する",options:["される","すれる","しれる","せられる"],answerIndex:0,rule:"不規則受身",explanation:"不規則：「する」→「される」。"},
  {id:"h5q14",kind:"transform",prompt:"て形に変形してください",subject:"来る",reading:"くる",options:["来て","来いて","来って","来んで"],answerIndex:0,rule:"不規則",explanation:"不規則：「来る」→「来て（きて）」。"},
  {id:"h5q15",kind:"transform",prompt:"た形に変形してください",subject:"死ぬ",reading:"しぬ",options:["死んだ","死いた","死った","死んで"],answerIndex:0,rule:"ぬ→んだ",explanation:"拨音便：「ぬ」→「んだ」。「死ぬ」是唯一以ぬ结尾的动词。"},
  {id:"h5q16",kind:"transform",prompt:"使役受身形に変形してください",subject:"行く",reading:"いく",options:["行かされる","行ける","行かれる","行くされる"],answerIndex:0,rule:"使役受身",explanation:"最难：一类使役+受身缩约→「行かされる」。「行かせられる」的口语缩约。"},
];

// ── b1: 〜ながら / 〜たり ──
const doujiQuestions: Question[] = [
  {id:"b1q1",kind:"pattern",prompt:patternPrompt,situation:"二つの動作を同時にしていると伝えたい",sentenceBefore:"音楽を",sentenceAfter:"宿題をします。",translation:"一边听音乐一边写作业。",options:["聞きながら","聞いたり","聞くなら","聞いてから"],optionNotes:["同時進行","動作の列挙","仮定の話題","動作の前後"],answerIndex:0,rule:"ます形+ながら",explanation:"两个动作同时进行用「〜ながら」，最简单的用法。"},
  {id:"b1q2",kind:"pattern",prompt:patternPrompt,sentenceBefore:"ご飯を",sentenceAfter:"話しましょう。",translation:"我们边吃饭边聊吧。",options:["食べたり","食べてから","食べながら","食べるなら"],optionNotes:["動作の列挙","動作の前後","同時進行","仮定の話題"],answerIndex:2,rule:"ます形+ながら",explanation:"邀请对方同时做两件事也用「〜ながら」。"},
  {id:"b1q3",kind:"pattern",prompt:patternPrompt,sentenceBefore:"休みの日は本を読んだり、映画を",sentenceAfter:"します。",translation:"休息日看看书、看看电影。",options:["見ながら","見たり","見たら","見ると"],optionNotes:["同時進行","動作の列挙","仮定条件","必然の結果"],answerIndex:1,rule:"た形+り",explanation:"列举多个行为用「〜たり〜たり」。"},
  {id:"b1q4",kind:"pattern",prompt:patternPrompt,sentenceBefore:"京都でお寺を見たり、和菓子を",sentenceAfter:"しました。",translation:"在京都参观了寺庙、吃了和果子。",options:["食べながら","食べたり","食べると","食べるなら"],optionNotes:["同時進行","動作の列挙","必然の結果","仮定の話題"],answerIndex:1,rule:"た形+り",explanation:"「〜たり〜たりしました」列举过去经历。"},
  {id:"b1q5",kind:"pattern",prompt:patternPrompt,sentenceBefore:"彼女は",sentenceAfter:"理由を話しました。",translation:"她一边哭一边说了原因。",options:["泣いたり","泣きながら","泣いてから","泣くと"],optionNotes:["動作の列挙","同時進行","動作の前後","必然の結果"],answerIndex:1,rule:"様子の描写",explanation:"修饰动作方式用「〜ながら」。「泣いてから」是先后顺序。"},
  {id:"b1q6",kind:"pattern",prompt:patternPrompt,sentenceBefore:"彼は",sentenceAfter:"大学に通っています。",translation:"他一边工作一边上大学。",options:["働いたり","働きながら","働くなら","働いたら"],optionNotes:["動作の列挙","同時進行・両立","仮定の話題","仮定条件"],answerIndex:1,rule:"両立の用法",explanation:"「〜ながら」可表示长期兼顾两个状态。"},
  {id:"b1q7",kind:"pattern",prompt:patternPrompt,sentenceBefore:"週末は雨が降ったり、",sentenceAfter:"します。",translation:"周末时而下雨时而放晴。",options:["晴れながら","晴れてから","晴れたり","晴れると"],optionNotes:["同時進行","動作の前後","反復・交替","必然の結果"],answerIndex:2,rule:"反復・交替",explanation:"相反状态交替出现时也用「〜たり〜たり」。"},
  {id:"b1q8",kind:"pattern",prompt:patternPrompt,sentenceBefore:"",sentenceAfter:"スマホを見ないでください。",translation:"请不要边走路边看手机。",options:["歩いたり","歩くと","歩きながら","歩いてから"],optionNotes:["動作の列挙","必然の結果","同時進行","動作の前後"],answerIndex:2,rule:"禁止+ながら",explanation:"最难：注意・禁止句中也用「〜ながら」，需要从语境判断。"},
];

// ── b2: 〜ば / 〜たら / 〜なら ──
const jokenQuestions: Question[] = [
  {id:"b2q1",kind:"pattern",prompt:patternPrompt,sentenceBefore:"春になる",sentenceAfter:"、桜が咲きます。",translation:"一到春天，樱花就会开。",options:["と","なら","ば","ても"],optionNotes:["自然の反復","話題を受ける","仮定条件","逆接の条件"],answerIndex:0,rule:"自然現象の反復",explanation:"每年重复的自然现象用「〜と」，最典型的用法。"},
  {id:"b2q2",kind:"pattern",prompt:patternPrompt,sentenceBefore:"このボタンを押す",sentenceAfter:"、ドアが開きます。",translation:"一按这个按钮门就开。",options:["なら","たら","と","ば"],optionNotes:["話題を受ける","個別の条件","必然・反復の結果","仮定条件"],answerIndex:2,rule:"必然の結果",explanation:"必然结果的说明用「〜と」。"},
  {id:"b2q3",kind:"pattern",prompt:patternPrompt,sentenceBefore:"駅に着い",sentenceAfter:"、電話してください。",translation:"到了车站请给我打电话。",options:["なら","たら","ば","ながら"],optionNotes:["話題を受ける","前提が成立した後","一般的な仮定","同時進行"],answerIndex:1,rule:"成立後の行動",explanation:"条件成立后的个别行为用「〜たら」。"},
  {id:"b2q4",kind:"pattern",prompt:patternPrompt,sentenceBefore:"安けれ",sentenceAfter:"、買います。",translation:"如果便宜我就买。",options:["ば","なら","と","ても"],optionNotes:["仮定条件","話題を受ける","必然の結果","逆接の条件"],answerIndex:0,rule:"い形容詞+ければ",explanation:"一般性假定条件用「〜ば」。"},
  {id:"b2q5",kind:"pattern",prompt:patternPrompt,sentenceBefore:"京都に行く",sentenceAfter:"、春がいいですよ。",translation:"去京都的话春天最好。",options:["なら","たら","ば","と"],optionNotes:["相手の話題を受ける","時間的な条件","一般的な仮定","必然の結果"],answerIndex:0,rule:"話題を受ける条件",explanation:"承接对方话题建议时用「〜なら」。"},
  {id:"b2q6",kind:"pattern",prompt:patternPrompt,sentenceBefore:"暇",sentenceAfter:"、手伝ってくれませんか。",translation:"有空的话能帮我一下吗？",options:["たら","と","なら","ながら"],optionNotes:["成立後の行動","必然の結果","相手の発言を受ける","同時進行"],answerIndex:2,rule:"名詞・な形容詞+なら",explanation:"名詞/な形容词+「なら」。以对方发言为前提的请求。"},
  {id:"b2q7",kind:"pattern",prompt:patternPrompt,sentenceBefore:"分からなけれ",sentenceAfter:"、いつでも聞いてください。",translation:"如果不明白随时问我。",options:["と","ば","なら","ながら"],optionNotes:["必然の結果","仮定条件","話題を受ける","同時進行"],answerIndex:1,rule:"否定仮定",explanation:"否定假定用「〜なければ」。注意「〜と」不能用于请求指示。"},
  {id:"b2q8",kind:"pattern",prompt:patternPrompt,sentenceBefore:"もっと早く出発し",sentenceAfter:"、間に合ったのに。",translation:"要是早点出发就赶上了。",options:["なら","たら","と","ながら"],optionNotes:["話題を受ける","反事実の仮定","必然の結果","同時進行"],answerIndex:1,rule:"反事実の仮定",explanation:"最难：与事实相反的假定「〜たら〜のに」，需要从「〜のに」和整体语境判断。"},
];

// ── b3: 〜そうだ / 〜ようだ ──
const souYouQuestions: Question[] = [
  {id:"b3q1",kind:"transform",prompt:"様態の「そうだ」に変えてください",subject:"おいしい",options:["おいしそうだ","おいしいそうだ","おいしそうだ","おいしいようだ"],answerIndex:0,rule:"い形→そうだ",explanation:"い形容词去「い」加「そうだ」，最简单的变形。"},
  {id:"b3q2",kind:"transform",prompt:"様態のそうだに変えてください",subject:"静かだ",options:["静かそうだ","静かだそうだ","静かのようだ","静かみたいだ"],answerIndex:0,rule:"な形→そうだ",explanation:"な形容词词干直接加「そうだ」→「静かそうだ」。"},
  {id:"b3q3",kind:"cloze",prompt:"空欄に入る語を選んでください",sentenceBefore:"雨",sentenceAfter:"降りそうです。",translation:"看起来要下雨了。",options:["は","が","を","に"],answerIndex:1,rule:"様態の主語",explanation:"「降りそうだ」的主体用「が」。"},
  {id:"b3q4",kind:"cloze",prompt:"空欄に入る語を選んでください",sentenceBefore:"彼は元気な",sentenceAfter:"見えます。",translation:"他看起来很精神。",options:["ように","そうに","らしく","みたいに"],answerIndex:1,rule:"様態の連用形",explanation:"「そうだ」修饰动词时变「そうに」。"},
  {id:"b3q5",kind:"pattern",prompt:patternPrompt,sentenceBefore:"天気予報によると、明日は雪だ",sentenceAfter:"。",translation:"据天气预报说明天会下雪。",options:["そうだ","ようだ","らしい","みたい"],optionNotes:["伝聞","比喩推量","推量","比喩"],answerIndex:0,rule:"伝聞のそうだ",explanation:"传闻用「そうだ」接终止形。"},
  {id:"b3q6",kind:"pattern",prompt:patternPrompt,sentenceBefore:"彼女の肌は雪の",sentenceAfter:"白い。",translation:"她的肌肤像雪一样白。",options:["ように","そうに","らしく","みたいに"],answerIndex:0,rule:"比喩のようだ",explanation:"「AのようにB」=比喻，像A那样B。"},
  {id:"b3q7",kind:"pattern",prompt:patternPrompt,sentenceBefore:"誰かいる",sentenceAfter:"。電気がついている。",translation:"好像有人在，灯亮着。",options:["ようだ","そうだ","らしい","はずだ"],optionNotes:["推量判断","伝聞","推量","当然"],answerIndex:0,rule:"推量のようだ",explanation:"「ようだ」基于观察的主观推断，需要从语境判断。"},
  {id:"b3q8",kind:"pattern",prompt:patternPrompt,sentenceBefore:"ここは昔学校だった",sentenceAfter:"。",translation:"这里好像以前是学校。",options:["らしい","ようだ","そうだ","べきだ"],optionNotes:["客観的推量","主観的判断","伝聞","義務"],answerIndex:0,rule:"推量のらしい",explanation:"最难：「らしい」基于客观信息的推断，比「ようだ」更客观。"},
];

// ── b4: 敬語表現 ──
const keigoQuestions: Question[] = [
  {id:"b4q1",kind:"transform",prompt:"尊敬語に変えてください",subject:"食べる",reading:"たべる",options:["召し上がる","お食べになる","食べられる","お食べします"],answerIndex:0,rule:"尊敬語特例",explanation:"「食べる」的尊敬语「召し上がる」，最常用敬语之一。"},
  {id:"b4q2",kind:"transform",prompt:"尊敬語に変えてください",subject:"行く",reading:"いく",options:["いらっしゃる","お行きになる","行かれる","行かせられる"],answerIndex:0,rule:"尊敬語特例",explanation:"「行く/来る/いる」的尊敬语都是「いらっしゃる」。"},
  {id:"b4q3",kind:"transform",prompt:"謙譲語に変えてください",subject:"言う",reading:"いう",options:["申す","お言いする","言われる","申し上げる"],answerIndex:0,rule:"謙譲語特例",explanation:"「言う」的谦让语是「申す」。"},
  {id:"b4q4",kind:"cloze",prompt:"空欄に入る語を選んでください",sentenceBefore:"私が",sentenceAfter:"ます。",translation:"我来做。",options:["いたし","なさい","され","おし"],answerIndex:0,rule:"するの謙譲語",explanation:"「する」的谦让语是「いたす」。"},
  {id:"b4q5",kind:"transform",prompt:"尊敬語に変えてください",subject:"する",options:["なさる","される","おする","いたす"],answerIndex:0,rule:"不規則尊敬語",explanation:"「する」的尊敬语是「なさる」。"},
  {id:"b4q6",kind:"transform",prompt:"謙譲語に変えてください",subject:"会う",reading:"あう",options:["お目にかかる","お会いする","会われる","会わせる"],answerIndex:0,rule:"謙譲語特例",explanation:"「会う」的谦让语是「お目にかかる」，特殊表达。"},
  {id:"b4q7",kind:"cloze",prompt:"空欄に入る語を選んでください",sentenceBefore:"社長はもうお帰り",sentenceAfter:"。",translation:"社长已经回去了。",options:["しました","になりました","いたしました","されました"],answerIndex:1,rule:"お＋ます形＋になる",explanation:"尊敬语基本形：「お＋ます形＋になる」→「お帰りになる」。"},
  {id:"b4q8",kind:"cloze",prompt:"空欄に入る語を選んでください",sentenceBefore:"お客様が",sentenceAfter:"。",translation:"客人来了。",options:["いらっしゃいました","お見えになりました","来られました","お越しになりました"],answerIndex:0,rule:"尊敬語総合",explanation:"最难：四个选项都是正确的尊敬语表达，但「いらっしゃる」是最标准的。"},
];

// ── b5: 文型総合 ──
const bunkeiSougouQuestions: Question[] = [
  {id:"b5q1",kind:"pattern",prompt:patternPrompt,sentenceBefore:"音楽を聞き",sentenceAfter:"勉強します。",translation:"一边听音乐一边学习。",options:["ながら","たり","たら","なら"],optionNotes:["同時進行","列挙","条件","話題"],answerIndex:0,rule:"同時進行",explanation:"两个动作同时进行用「〜ながら」。"},
  {id:"b5q2",kind:"pattern",prompt:patternPrompt,sentenceBefore:"週末は映画を見",sentenceAfter:"買い物をしたりしました。",translation:"周末看了电影逛了街。",options:["たり","ながら","たら","れば"],optionNotes:["列挙","同時","条件","仮定"],answerIndex:0,rule:"〜たり〜たり",explanation:"列举行为用「〜たり〜たり」。"},
  {id:"b5q3",kind:"pattern",prompt:patternPrompt,sentenceBefore:"春になる",sentenceAfter:"、花が咲きます。",translation:"一到春天花就开。",options:["と","なら","たら","ば"],optionNotes:["必然","仮定","条件","仮定"],answerIndex:0,rule:"必然のと",explanation:"自然规律用「〜と」。"},
  {id:"b5q4",kind:"pattern",prompt:patternPrompt,sentenceBefore:"家に着い",sentenceAfter:"、電話します。",translation:"到家后给你打电话。",options:["たら","と","ば","なら"],optionNotes:["成立後","必然","一般条件","話題"],answerIndex:0,rule:"〜たら",explanation:"条件成立后的个别行为用「〜たら」。"},
  {id:"b5q5",kind:"pattern",prompt:patternPrompt,sentenceBefore:"安けれ",sentenceAfter:"買います。",translation:"如果便宜就买。",options:["ば","たら","と","なら"],optionNotes:["一般仮定","個別条件","必然","話題"],answerIndex:0,rule:"〜ば",explanation:"一般假定用「〜ば」。"},
  {id:"b5q6",kind:"pattern",prompt:patternPrompt,sentenceBefore:"日本に行く",sentenceAfter:"、京都がおすすめです。",translation:"去日本的话推荐京都。",options:["なら","たら","と","ば"],optionNotes:["話題","条件","必然","仮定"],answerIndex:0,rule:"〜なら",explanation:"承接话题建议用「〜なら」。"},
  {id:"b5q7",kind:"pattern",prompt:patternPrompt,sentenceBefore:"おいし",sentenceAfter:"ケーキですね。",translation:"看起来很好吃的蛋糕。",options:["そうな","ような","らしい","みたいな"],optionNotes:["様態","比喩","推量","比喩"],answerIndex:0,rule:"様態のそうだ",explanation:"外观印象用「そうだ」→「おいしそうな」。"},
  {id:"b5q8",kind:"pattern",prompt:patternPrompt,sentenceBefore:"彼は来年留学する",sentenceAfter:"。",translation:"听说他明年留学。",options:["そうだ","ようだ","らしい","はずだ"],optionNotes:["伝聞","推量","推量","当然"],answerIndex:0,rule:"伝聞",explanation:"传闻用「そうだ」接终止形。"},
  {id:"b5q9",kind:"pattern",prompt:patternPrompt,sentenceBefore:"先生が",sentenceAfter:"。",translation:"老师来了。",options:["いらっしゃいました","来ました","来そうでした","来られました"],optionNotes:["尊敬語","普通体","様態","受身"],answerIndex:0,rule:"尊敬語",explanation:"「来る」的尊敬语是「いらっしゃる」。"},
  {id:"b5q10",kind:"pattern",prompt:patternPrompt,sentenceBefore:"私が",sentenceAfter:"ます。",translation:"我来做。",options:["いたし","なさい","され","おし"],optionNotes:["謙譲語","尊敬語","受身","命令"],answerIndex:0,rule:"謙譲語",explanation:"「する」的谦让语是「いたす」。"},
  {id:"b5q11",kind:"pattern",prompt:patternPrompt,sentenceBefore:"彼は日本人の",sentenceAfter:"日本語を話します。",translation:"他像日本人一样说日语。",options:["ように","そうに","らしく","みたいに"],optionNotes:["比喩","様態","推量","口语推量"],answerIndex:0,rule:"比喩のようだ",explanation:"「AのようにB」=比喻。"},
  {id:"b5q12",kind:"pattern",prompt:patternPrompt,sentenceBefore:"あの人はやさし",sentenceAfter:"。",translation:"那个人看起来挺温柔的。",options:["そうだ","ようだ","らしい","みたいだ"],optionNotes:["様態","推量判断","客観推量","口语"],answerIndex:0,rule:"な形+そうだ",explanation:"外观印象：「やさしそうだ」。"},
  {id:"b5q13",kind:"pattern",prompt:patternPrompt,sentenceBefore:"誰もいない",sentenceAfter:"静かだ。",translation:"好像没人，很安静。",options:["みたいで","そうで","ようで","らしくて"],optionNotes:["口语","样态","主观推量","客観推量"],answerIndex:0,rule:"みたい",explanation:"口语中常用「みたい」代替「ようだ」。"},
  {id:"b5q14",kind:"pattern",prompt:patternPrompt,sentenceBefore:"約束は守る",sentenceAfter:"。",translation:"应该遵守约定。",options:["べきだ","そうだ","ようだ","らしい"],optionNotes:["当為","伝聞","推量","客観"],answerIndex:0,rule:"べきだ",explanation:"「べきだ」表示义务。"},
  {id:"b5q15",kind:"pattern",prompt:patternPrompt,sentenceBefore:"ここでタバコを吸っては",sentenceAfter:"。",translation:"这里不可以吸烟。",options:["いけない","ならない","だめ","いけなく"],optionNotes:["禁止","義務","禁止","禁止"],answerIndex:0,rule:"てはいけない",explanation:"「てはいけない」=禁止。"},
  {id:"b5q16",kind:"pattern",prompt:patternPrompt,sentenceBefore:"少々お待ち",sentenceAfter:"。",translation:"请稍等。",options:["ください","なさい","くれ","して"],optionNotes:["丁寧依頼","命令","普通依頼","軽い依頼"],answerIndex:0,rule:"お＋ます形＋ください",explanation:"最难：敬语请求形，四个选项都是祈使形式但只有「ください」符合敬语语境。"},
];

const questionBank: Record<string, Question[]> = {
  j1:waGaQuestions, j2:niDeQuestions, j3:oGaQuestions, j4:moToYaQuestions, j5:karaMadeYoriQuestions, j6:joshiSougouQuestions,
  h1:jishoQuestions, h2:teFormQuestions, h3:taNaiQuestions, h4:kanouUkemiQuestions, h5:henkeiSougouQuestions,
  b1:doujiQuestions, b2:jokenQuestions, b3:souYouQuestions, b4:keigoQuestions, b5:bunkeiSougouQuestions
};

export function getStage(stageId:string):{stage:Stage;categoryLabel:string;categoryId:string;index:number}|null{
  for(const cat of categories){
    const idx=cat.stages.findIndex(s=>s.id===stageId);
    if(idx!==-1)return{stage:cat.stages[idx],categoryLabel:cat.label,categoryId:cat.id,index:idx};
  }
  return null;
}

export function getQuestions(stageId:string):Question[]{
  const found=questionBank[stageId];
  if(found)return found;
  if(stageId.startsWith("j"))return oGaQuestions;
  if(stageId.startsWith("b"))return jokenQuestions;
  return teFormQuestions;
}

export const categories: Category[] = [
  {id:"joshi",label:"助詞",caption:"助詞の使い分けを段階的に攻略する",stages:[
    {id:"j1",title:"は vs が",subtitle:"主題と主語の使い分け",questions:8,status:"current"},
    {id:"j2",title:"に vs で",subtitle:"場所・手段の表現",questions:8,status:"locked"},
    {id:"j3",title:"を vs が",subtitle:"目的語と自動詞",questions:8,status:"locked"},
    {id:"j4",title:"も・と・や",subtitle:"並列助詞の比較",questions:8,status:"locked"},
    {id:"j5",title:"から・まで・より",subtitle:"範囲と起点の表現",questions:8,status:"locked"},
    {id:"j6",title:"総合テスト",subtitle:"助詞のまとめ問題",questions:16,status:"locked"},
  ]},
  {id:"henkei",label:"変形",caption:"動詞・形容詞の活用を順に鍛える",stages:[
    {id:"h1",title:"ます形→辞書形",subtitle:"基本の活用",questions:8,status:"current"},
    {id:"h2",title:"て形",subtitle:"音便の規則",questions:8,status:"locked"},
    {id:"h3",title:"た形・ない形",subtitle:"過去と否定",questions:8,status:"locked"},
    {id:"h4",title:"可能・受身・使役",subtitle:"応用活用",questions:8,status:"locked"},
    {id:"h5",title:"総合テスト",subtitle:"活用のまとめ問題",questions:16,status:"locked"},
  ]},
  {id:"bunkei",label:"文型",caption:"頻出文型を実例で身につける",stages:[
    {id:"b1",title:"〜ながら / 〜たり",subtitle:"同時・並列の文型",questions:8,status:"current"},
    {id:"b2",title:"〜ば / 〜たら / 〜なら",subtitle:"条件表現の比較",questions:8,status:"locked"},
    {id:"b3",title:"〜そうだ / 〜ようだ",subtitle:"推量と伝聞",questions:8,status:"locked"},
    {id:"b4",title:"敬語表現",subtitle:"尊敬語と謙譲語",questions:8,status:"locked"},
    {id:"b5",title:"総合テスト",subtitle:"文型のまとめ問題",questions:16,status:"locked"},
  ]},
];
