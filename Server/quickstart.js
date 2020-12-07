var {google} = require('googleapis');

google.youtube('v3').search.list({
  key:'AIzaSyDr3Or2gSBGrmtoUdITCTtexGNmMAah__w',
  part:'snippet',
  channelId:'UC14UlmYlSNiQCBe9Eookf_A',
  q:'barcelona vs levante 27 april 2019',
  maxResults:'1',
  order: 'relevance' 
  
}).then(res=>{
  console.log(res.data.items);
}).catch(err=>{
  console.log(err);
});