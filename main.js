import * as gsUtil from './util/gsutils'
const chai = require('chai')
const chaiHTTP = require('chai-http')
chai.use(chaiHTTP)
const jp = require('jsonpath')

const getDataJsonPath = async(_rawData, _jsonpath) => {
    return jp.value(JSON.parse(_rawData),_jsonpath)
}

const removeItem = async(array, item) => {
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
        }
    }
}


describe('Get sonarqube data', ()=>{
    it('Get sonarqube data', async()=>{
        let gsheet = new gsUtil.Doc('1RizUCVgkbioxuRrIojm6c4yrRzdYPLk_HstIaA91Kak')
        //let gsheet = new gsUtil.Doc('1B_qi-fUDhT1WMMXc49hDqwfEyTw1cp-6f4xb62FeeB8')
        await gsheet.init()
        await gsheet.getSheet('Unit Tests')
        // await gsheet.getSheet('James')
        let api = "https://sonarqube.lumigame.com/api"
        const agent = chai.request.agent(api)
        await agent.post('/authentication/login?login=james.nguyen&password=Sn123457')
        let gamebasep   = await agent.get('/components/search_projects?filter=tags%20IN%20(gamebase)')
        let allprojects   = await agent.get('/components/search?qualifiers=TRK')
        const objectkeys = JSON.parse(allprojects.text);
        let pkeys = jp.query(objectkeys,"$..key")
        const obgamebasekeys = JSON.parse(gamebasep.text);
        let pgamebasekeys = jp.query(obgamebasekeys,"$..key")
        let l1 = [], allcodecoverage =[]
        let lstexclude = ['l1-game-admin','l1-game-guides','sc-base-database','l1-game-server','l1-instant-game-client','l1-game-client-mobi']
        for (const i of pkeys) {
            if(i.includes('l1-')){
                l1.push(i)
            }
        }
        const allkeys = pgamebasekeys.concat(l1)
        //remove exclude keys
        for(let k of lstexclude){
            await removeItem(allkeys,k)
        }
        // Get code coverage
         for(const j of allkeys){
            let jcoverage   = await agent.get(`/measures/component?component=${j}&metricKeys=coverage`)
            let jvalue = await getDataJsonPath(jcoverage.text,"$..value")
            jvalue = (typeof jvalue !== 'undefined') ? jvalue : 0
            allcodecoverage.push(jvalue)
        }
        // console.log(allkeys.length,allcodecoverage.length);
        console.log(allkeys,allcodecoverage);
        let scslotgamebase = allcodecoverage[allkeys.indexOf('sc-slot-game-base')]
        allcodecoverage[allkeys.indexOf('l1-four-guardians-service')] = scslotgamebase
        allcodecoverage[allkeys.indexOf('l1-heroes-slot-service')] = scslotgamebase
        // console.log(allkeys,allcodecoverage);
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
        var currenttime = date +' '+ time

 let t=1, f=1
// update datetime
await gsheet.setcellvalue(11,6,currenttime)


//  update code coverage
 for (const i of allcodecoverage){
    await gsheet.setcellvalue(f,2,parseFloat(i))
    f++
}

//update project name
  for (const i of allkeys){
            // console.log('update', i)
            await gsheet.setcellvaluelink(t,1,i,`https://sonarqube.lumigame.com/dashboard?id=${i}`)
            t++
  }


  
})

})