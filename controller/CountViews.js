class CountViews{
    constructor(){
        this.views=0;
        this.time=24*60*60;
        this.cache=[
            {views:1099,time:'2024-12-20'},
            {views:1129,time:'2024-12-21'},
            {views:1234,time:'2024-12-22'},
            {views:2323,time:'2024-12-23'},
            {views:1092,time:'2024-12-24'},
            {views:1890,time:'2024-12-25'},
            {views:902,time:'2024-12-26'},
            {views:622,time:'2024-12-27'}
        ];
        this.max=365*10;
        this.timeId=null;
    }
    startCount(){
        if(this.timeId!==null){
            clearInterval(this.timeId);
            this.timeId=null;
        }
        this.timeId=setInterval(()=>{
            const date=new Date();
            const now=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
            this.cache.push({
                views:this.views,
                time:now
            });
            if(this.cache.length>this.max)
                this.cache.splice(0,365);
        },this.time);
    }
    Count=async(req,res,next)=>{
        this.views++;
        next();
    }
    Views=async(req,res)=>{
        return res.status(200).json({message:"ok",data:this.cache});
    }
}
export default new CountViews();