"use strict";
class KimiAI{
    constructor(){
        this.url="https://kimi.moonshot.cn/api/chat/ctgki2bodd0lg722cfg0/completion/stream";
        this.headers={
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc0MTc3MzY0NCwiaWF0IjoxNzMzOTk3NjQ0LCJqdGkiOiJjdGRiOGo0MXU2NjJqMXA3MTE2ZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJjcmxvc2Q0aW1sbmFxNzR2a2l0ZyIsInNwYWNlX2lkIjoiY3Jsb3NkNGltbG5hcTc0dmtpczAiLCJhYnN0cmFjdF91c2VyX2lkIjoiY3Jsb3NkNGltbG5hcTc0dmtpcmciLCJyb2xlcyI6WyJ2aWRlb19nZW5fYWNjZXNzIl19.-htFgOce89QbyvmGNCmmcMF13rQVahS61YoAmnn2tSg5Y9MQrWiqrrWx6_aGuehNMQ54uu1swj5Hbcj4K0L1yw",
            "Content-Type": "application/json",
            "Priority": "u=3, i",
            "R-Timezone": "Asia/Shanghai",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
            "x-msh-device-id": "7447463090716676364",
            "x-msh-platform": "web",
            "x-msh-session-id": "1730622506026587196",
            "X-Traffic-Id": "crlosd4imlnaq74vkitg",
            "Sec-Fetch-Mode":"cors",
            "Sec-Fetch-Dest":"empty",
            "Sec-Fetch-Site":"same-origin",
            "Cookie":" _ga_YXD8W70SZP=GS1.1.1734428938.20.0.1734428938.0.0.0; _clsk=16zx1rv%7C1734428826519%7C1%7C1%7Ck.clarity.ms%2Fcollect; _ga=GA1.1.1765488079.1733997620; _ga_Z0ZTEN03PZ=GS1.1.1734428823.6.1.1734428823.0.0.0; _gcl_au=1.1.588158291.1733997620; Hm_lpvt_358cae4815e85d48f7e8ab7f3680a74b=1734410883; Hm_lvt_358cae4815e85d48f7e8ab7f3680a74b=1734232243,1734264376,1734358701,1734363286; _clck=rfr59t%7C2%7Cfrs%7C0%7C1812; HMACCOUNT=5FA335BDD7201AED; kimi-auth=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2VyLWNlbnRlciIsImV4cCI6MTc0MTc3MzY0NCwiaWF0IjoxNzMzOTk3NjQ0LCJqdGkiOiJjdGRiOGo0MXU2NjJqMXA3MTE2ZyIsInR5cCI6ImFjY2VzcyIsImFwcF9pZCI6ImtpbWkiLCJzdWIiOiJjcmxvc2Q0aW1sbmFxNzR2a2l0ZyIsInNwYWNlX2lkIjoiY3Jsb3NkNGltbG5hcTc0dmtpczAiLCJhYnN0cmFjdF91c2VyX2lkIjoiY3Jsb3NkNGltbG5hcTc0dmtpcmciLCJyb2xlcyI6WyJ2aWRlb19nZW5fYWNjZXNzIl19.-htFgOce89QbyvmGNCmmcMF13rQVahS61YoAmnn2tSg5Y9MQrWiqrrWx6_aGuehNMQ54uu1swj5Hbcj4K0L1yw",
        }
    }

    async *post(content){
        try{
            const body={
                messages: [ { role: 'user', content:content} ],
                use_search: true,
                extend: { sidebar: true },
                kimiplus_id: 'kimi',
                use_research: false,
                use_math: false,
                refs: [],
                refs_file: []
            }
            const response =await fetch(this.url,{
                "body": JSON.stringify(body),
                "cache": "default",
                "credentials": "include",
                "headers":this.headers,
                "method": "POST",
                "mode": "cors",
                "redirect": "follow",
                "referrer": "https://kimi.moonshot.cn/chat/ctgki2bodd0lg722cfg0",
                "referrerPolicy": "strict-origin-when-cross-origin"
            });

            if(!response){
                console.log("请求失败",response.status);
                return ;
            }
    
            const reader=response.body.getReader();
    
            var doing=true;
            while(doing){
                const {done,value} =await reader.read();
                if(done) break;
                if(value) yield value;
            }
            reader.releaseLock();
        }catch(error){
            console.log("error_post",error);
            return null;
        }
    }
}

export default KimiAI;