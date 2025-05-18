class ChatQW{
    constructor(){
        this.url="https://qianwen.biz.aliyun.com/dialog/conversation";
        this.headers={
            "Accept": "text/event-stream",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Content-Type": "application/json",
            "Priority": "u=3, i",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
            "X-Platform": "pc_tongyi",
            "X-XSRF-TOKEN": "0e33df98-1e2d-474a-ac19-a67ec68a8cad",
            "Cookie":"aui=1728643480022280435; sca=e4a6eea5; tfstk=cuE1BR_rGSEEx6JFNm6EOvjC3R3RaB-sLOG3C9uSpEZ2KnkKpsfw4bZO5-AK0xHC.; isg=BG1tONdR9q0IXZL6TInKC5KWdg_nyqGcavKjVK9yqYRzJo3YdxqxbLvkEnrAvblU; atpsida=8612965c02b1bea8be20b343_1734448114_1; cna=pkHhH5J9RQcBASQIhFZx8U0X; acw_tc=1069cb2a-b039-9814-a818-7254bbb8cba59e256cad1dad9c1db84432630c587cb4; _samesite_flag_=true; _tb_token_=57e737976bb3e; cookie2=163bac54d8c9cfc825c0a40e2f3cc7d2; t=81f538bf43a3fd3350d0edaf64cbe57e; UM_distinctid=193bf8a6784d44-0a0187c2b509f98-3c62654b-13c680-193bf8a67852dc3; cnaui=1728643480022280435; tongyi_sso_ticket=IffhzcQ6eUm2IOSLydbmkzpf8Gz1g_BynogsOH1apRX0qcdzyjCf$oLNrgxGrjIrHqOl*Gu9Cf_90; tongyi_guest_ticket=Em82P$1ucJtKdvAtQIrbU3atsYIvy*K7c7WStc*kmmiYLRlZnew2YCtQau6xQ53c2yDcQuUoyW8_0",
            "Sec-Fetch-Dest":"empty",
            "Sec-Fetch-Mode":"cors",
            "Sec-Fetch-Site":"same-site"
        }
    }

    async *post(content){
        try{
            const body={
                "model": "",
                "action": "next",
                "mode": "chat",
                "userAction": "chat",
                "requestId": "72bc68b9c97c4eed800365ba139589d3",
                "sessionId": "",
                "sessionType": "text_chat",
                "parentMsgId": "",
                "params": {
                    "agentId": "",
                    "searchType": "",
                    "pptGenerate": false,
                    "bizScene": "",
                    "bizSceneInfo": {}
                },
                "contents": [
                    {
                        "content": content,
                        "contentType": "text",
                        "role": "user",
                        "ext": {
                            "searchType": "",
                            "pptGenerate": false
                        }
                    }
                ]
            }

            const response =await fetch(this.url,{
                body:JSON.stringify(body),
                headers:this.headers,
                "method": "POST",
                "mode": "cors",
                "redirect": "follow",
                "referrer": "https://tongyi.aliyun.com/",
                "referrerPolicy": "no-referrer-when-downgrade"
            });

            if(!response) return null;

            const reader=response.body.getReader();

            for(;;){
                const {done,value}=await reader.read();
                if(done) break;
                if(value) yield value;
            }
            reader.releaseLock()

        }catch(error){
            console.log("error",error);
            return null;
        }
    }
}

export default ChatQW;