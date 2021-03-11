var {ipcRenderer, remote} = require('electron');
const BrowserWindow = remote.BrowserWindow;
// var ps = null;
// // console.log(ipcRenderer.sendSync('synchronous-message', 'sync ping'));
// ipcRenderer.send('main', {mode: 'async ping'}); // ping을 날려서 연결가능한지 발신(main 프로세스로 ping)
// ipcRenderer.on('response', (event, arg) => { // main으로부터 수신
//   // if(arg?.status == 'async pong'){
//   //   ipcRenderer.send('main', {mode: 'ps-list', data: []}); // mode가 'ps-list'인 메세지를 main 프로세스로 발신
//   // }
// });

var lolInstallationPath;
const path = require('path');
const fsAsync = require('fs');
const fs = require('bluebird').promisifyAll(fsAsync);
const {exec, spawn} =  require('child_process');

if(!fs.existsSync('C:\\rankingLogs')) fs.mkdirSync('C:\\rankingLogs');

var random_log_name = Math.floor(Math.random() * 100000) + 1;
var output = fs.createWriteStream('C:\\rankingLogs\\'+Date.now()+'_'+random_log_name+'.log');
var errorOutput = fs.createWriteStream('C:\\rankingLogs\\'+Date.now()+'_'+random_log_name+'.log');
// custom simple logger
var Console = require('console').Console;
window.console = new Console(output, errorOutput);

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ' + err);
});
// use it like console

// process.on('unhandledRejection', (reason, promise) => {
//   console.log('Unhandled promise rejection on front-end')
//   console.log({reason: reason, promise: promise})
// });

window.addEventListener('error', event => {
  event.preventDefault();
  console.log('addEventListener error', event.error || event);
});

window.addEventListener('unhandledrejection', event => {
  event.preventDefault();
  console.log('unhandledrejection reason: ',event.reason);
  failLogForBarcodeCreation({}, 'unhandledrejection', event);

  setTimeout(()=>{ window.location.href = window.location.href; },1500);
});

// package.json dependencies "winreg": "^1.2.3" -> "winreg-utf8": "^0.1.1" 한글문제로 인해 utf-8가능한걸로 변경
var Registry = require('winreg-utf8');

// var regKeyLol1 = new Registry({                                       // new operator is optional
//   hive: Registry.HKLM,                                        // open registry hive HKEY_CURRENT_USER
//   key:  '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Riot Game league_of_legends.live', // key containing autostart programs
//   utf8: true
// })
// var regKeyLol2 = new Registry({                                       // new operator is optional
//   hive: Registry.HKCU,                                        // open registry hive HKEY_CURRENT_USER
//   key:  "\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Riot Game league_of_legends.live", // key containing autostart programs
//   utf8: true
// })

// regKeyLol1.get('InstallLocation', function (err, item) {
//   if(!!!err && !!key?.value) { 
//     lolInstallationPath = path.join(key.value);
//     
//   }else
//     regKeyLol2.get('InstallLocation', function (err, key) {
//       if(!!!err && !!key?.value 
//           // && false // TEST
//         ) {
//         lolInstallationPath = path.join(key.value);
//         
//       }else{
//         // const tmpPath = "C:\\Riot Games\\League of Legends";
//         // try{
//         //   const isExist = fs.readdirSync( tmpPath, 'utf8');
//         //   lolInstallationPath = tmpPath;
//         //   
//         // }catch(err){
//           
//           if(new URLSearchParams(global.location.search).get('isPopupCheckRunningLol') != 'Y'){
//             barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
//             barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'정상적인 진행을 위해 롤 클라이언트를 켜주시고 로그인 해주세요'}`);
//           }
//           workerIsRunningLol = callWorkerIsRunningLol();
//           // if(confirm('롤을 실행해주세요')){
//           //   exec(`wmic process where "name like '%%lol%%'" get ExecutablePath`, (err, stdout, stderr) => { // TODO 3389뿐만아니라 33890 사용하는프로세스도 가져오기때문에 추후 수정
//           //       if(!!err || !!stderr) {
//           //          
//           //         
//           //         return;
//           //       }
//           //        console.log('stdout', stdout.split("\n")); 
//           //       var stdArray = stdout.split("\n");
//           //       var filteredList = stdArray.filter( (std,index) => {
//           //           if(index!=0 && std!='') 
//           //             return std.trim();
//           //         });
//           //       var pieces = filteredList[0].split('\\');
//           //       if(pieces[2] != 'League of Legends'){ // 비정상 경로는 프로그램 강제 종료
//           //         ipcRenderer.sendSync('synchronous-message', {mode: 'quit'})
//           //       }
//           //       lolInstallationPath = pieces[0] + '\\' + pieces[1] + '\\' + 'League of Legends';
//           //       
//           //     });
//           // }
//         // }

//       }
//     });
  
// });
var processWindow = null;
var barcodeWindow = null;

var callWorkerIsRunningLol = function(){ 
  return setInterval(()=>{
    CheckLolPathWithProcess();
  },10000);
}


// if(new URLSearchParams(global.location.search).get('isPopupCheckRunningLol') != 'Y'){
//   barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
//   barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'정상적인 진행을 위해 롤 클라이언트를 켜주시고 로그인 해주세요'}`);
// }
workerIsRunningLol = callWorkerIsRunningLol();

// 서버 URL
var server_url = 'https://ranking.gg';
// 서버 URL

var invalidLolLogDir = null; // TODO 부정행위가 기록된 폴더는 읽지 않도록 해당 폴더이름을 기록하는 변수

var invalidPattern = ''; // 최종실패 flag
var invalidLolPath = false; // 롤경로 조작여부 flag

var isPlayingLol = false; // TODO flag

var processinglolPath;
var lolLogDirs = [];
var lolPrevClientLogfiles = [];
var prevDirName = '';
var prevFileSize = 0;
var isAlreadyReadLolLog = false; // TODO ( 프로그램실행시 only 1 try 1회성 )이미 ranking프로그램이 저장한 로그가 있는지 확인용 flag
var isAlreadyReadLolClientLog = false;

var authOnce = null; // TODO function auth 의 더미 function 이고 1회용으로 사용가능하다 해당 authOnce 는 다시 function auth로 재할당해서 1회를 다시 추가 해서 사용한다

var copysNetstats = [];//TODO 안씀

var authedLolInfo; // TODO 인증된 바코드포함데이터
var barcode_id = null; // auth_barodes테이블 PK
var auth_barcode = null; // auth_barodes테이블 바코드 값 EX) 2221382871
var user_id =null;

var QuitGame = null;

var isChangedSizeLogDirs = false;

var workerIsRunningLol;
var workerIsInGameLol;
var workerWatchLol;
var workerRemoteDeskTop; // 원격데스크톰 감지 worker
var workerChromeRemote; // 크롬 원격데스크톰 감지 worker
var workerChallenge = null; // 로그파일 카피 and 로그분석 worker
var workerIsClickUSB = null; // 앱에서 USB인증을 눌렀는지 서버에서 http요청하는 worker
var workerIsConnectedUSB = null;// 사용자가 USB를 연결했는지 확인하고 USB인증 프로세스를 call하는 worker
var workerConfirmRetryState = null;

function initLol(){
  invalidLolPath = false; // 롤경로 조작여부 flag

  isPlayingLol = false; // TODO flag

  processinglolPath = null;
  lolLogDirs = [];
  prevDirName = '';
  prevFileSize = 0;
  isAlreadyReadLolLog = false; // TODO ( 프로그램실행시 only 1 try 1회성 ) 게임시작시 기록되는 ..stat.csv 로그파일을 읽었는지 여부 flag
  
  lolPrevClientLogfiles = [];
  isAlreadyReadLolClientLog = false;

  authOnce = null;
  // barcodeWindow?.close();
  barcodeWindow?.destroy();
  barcodeWindow = null;
  processWindow?.destroy();
  processWindow = null;
  authedLolInfo = null;// TODO 인증된 바코드포함데이터 //TODO 안쓸수도 있음
  barcode_id = null;
  auth_barcode = null;
  invalidPattern = ''; // 최종실패 flag

  user_id = null;
  copysNetstats = [];//TODO 안씀

  QuitGame = null;

  isChangedSizeLogDirs = false;
  
  machine_id = null;
  GameID = null;
  start_date = null;
  myPuuid = null;
  myTeamType = null;
  myNickname = null;
  lolHistoryNicknames = [];
  teamMembers = [];
  resultMembers = [];
  finalNetstatsArray = null;
  isReadLolHistoryNicknames = false; 
  isCurrentLolClientLog = false; // LeagueClient.log파일들 안에서 (가장마지막에 찍힌)GameId와 r3dlog의 GameId가 일치하는 경우
  isCompleteWatchLol = false; // LeagueClient.log파일들 안에서 (가장마지막에 찍힌)GameId와 r3dlog의 GameId가 일치하는 경우

  workerChallenge = null;
}

function CheckLolPathWithProcess(){ // 실행중인 롤 process를통해 로 검증및 저장
  exec(`powershell.exe -Command "$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8; (Get-Process -Name *league*).Path;"`, (err, stdout, stderr) => { // TODO 3389뿐만아니라 33890 사용하는프로세스도 가져오기때문에 추후 수정
    if(!!err || !!stderr) {
      console.log('CheckLolPathWithProcess err', err); 
      console.log("CheckLolPathWithProcess no path stderr", stderr);
      if(!!!processinglolPath){
        // spawn( 'xcopy',  [`"${lolInstallationPath}\\Logs\\LeagueClient Logs"`, `"C:\\rankingLogs\\Logs\\GameLogs\\${lolLogDirs[lolLogDirs.length-1]}\\LeagueClientLogs_${Date.now()}"\\`, '/H'], {windowsVerbatimArguments: true} ); // 클라이언트 log 저장
        initWorkerWatchLol(); 
        clearInterval(workerChallenge);
        workerChallenge = null
        window.location.href = window.location.href;
      }
      initLol();
      return;
    }

    console.log('err', err); console.log('stdout', stdout.split("\n")); console.log('stderr', stderr);
    
    //  console.log('stdout', stdout.split("\n")); 
    var stdArray = stdout.split("\n");
    var filteredList = stdArray.filter( (std,index) => {
        if(index!=0 && std!='') 
          return std.trim();
      });
    if(!!!filteredList || !!!filteredList.length) {
      // if(!!!processinglolPath){
      //   initWorkerWatchLol(); 
      //   clearInterval(workerChallenge);
      //   workerChallenge = null
      // }
      // initLol();
      initWorkerWatchLol(); 
      clearInterval(workerChallenge);
      workerChallenge = null;
      initLol();
      return;
    }

    var pieces = filteredList[0].split('\\');
    pieces.pop();
    processinglolPath = pieces.join('\\');
    // if(pieces[1] != 'Riot Games'){ // 비정상 경로는 프로그램 강제 종료
    //   invalidLolPath = true;
    //   ipcRenderer.sendSync('synchronous-message', {mode: 'quit'});
    // }
    // processinglolPath = pieces[0] + '\\' + pieces[1] + '\\' + 'League of Legends';
    console.log("processinglolPath", processinglolPath);
    if(!!!lolInstallationPath){
      lolInstallationPath = processinglolPath;

      clearInterval(workerIsRunningLol);
      workerIsRunningLol = null;
      // if(processinglolPath != lolInstallationPath){
      //   lolInstallationPath = processinglolPath;
      // }
    }
  });
}

var machine_id = null;
var GameID;
var start_date;
var myPuuid;
var myTeamType;
var myNickname;
var lolHistoryNicknames = [];
var teamMembers = [];
var resultMembers = [];
var finalNetstatsArray = null;
var isReadLolHistoryNicknames = false; 
var isCurrentLolClientLog = false; // LeagueClient.log파일들 안에서 (가장마지막에 찍힌)GameId와 r3dlog의 GameId가 일치하는 경우
var isCompleteWatchLol = false; // LeagueClient.log파일들 안에서 (가장마지막에 찍힌)GameId와 r3dlog의 GameId가 일치하는 경우
function initWorkerWatchLol(){
  clearInterval(workerWatchLol);
  machine_id = null;
  GameID = null;
  start_date = null;
  myPuuid = null;
  myTeamType = null;
  myNickname = null;
  lolHistoryNicknames = [];
  teamMembers = [];
  resultMembers = [];
  finalNetstatsArray = null;

  workerWatchLol = null;

  isReadLolHistoryNicknames = false; //
  isCurrentLolClientLog = false;
  isCompleteWatchLol = false;


  lolPrevClientLogfiles = []; // TODO +01/13 초기화 필요
  isAlreadyReadLolClientLog = false;  // TODO +01/13 초기화 필요

  // lolLogDirs = [];  // TODO +01/21 초기화 필요
  // prevDirName = ''; // TODO +01/21 초기화 필요
  // prevFileSize = 0; // TODO +01/21 초기화 필요
  // isPlayingLol = false; // TODO +01/21 초기화 필요
  QuitGame = null;
}

// // TEST ##################### Barcode 테스트 #####################
// barcodeWindow = new BrowserWindow({width:450,height:600,show : true,resizable: false,});
// barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10&portWS=${ws.address().port}`);
// console.log('inject.js path: ', (new URLSearchParams(global.location.search).get('appPath')).replace('file://', '') +'/webview_preloadjs/extension/inject.js' );
// barcodeWindow = new BrowserWindow({show : true,  webPreferences:{preload: (new URLSearchParams(global.location.search).get('appPath')).replace('file://', '') +'/webview_preloadjs/extension/inject.js' } });
// barcodeWindow.loadURL('http://testrankingtest.xyz');
// setTimeout(()=>{
//   window.open(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${encodeURIComponent('멤버들이 같은 챌린지가 아닙니다.')}`, '', 'show=yes, width=450, height=450, resizable=no');
// },10000);
// // TEST ##################### Barcode 테스트 #####################

// //Test Api ########################Start########################
// fetch('http://localhost/c/client/getbarcode', { // ajax 테스트 코드
//   method: 'POST', // *GET, POST, PUT, DELETE, etc.
//   headers: { 'Content-Type': 'application/json' },
//   redirect: 'follow', // manual, *follow, error
//   referrer: 'no-referrer', // no-referrer, *client
//   body: JSON.stringify({
//     // mode: 'CurrentChallenge',
//     game_id: "4881606442",
//     game_nickname: "반도젠학생",
//     start_date: '2020-12-29 18:18:46.043',
//     // is_duo: !!resultMembers.length?'y':'n',
//     // [resultMembers?.[0]?.memberNickname]
//     // membersNickname: [],
//     // history_nicknames: []
//   }), 
// })
// .then(res => res.json())
// .then(result => {
//   if(result?.code != 'success') {
//     authedLolInfo = null;
//     barcode_id = null;
//     auth_barcode = null;
//     user_id = null;
//     
//     return;
//   }
//   authedLolInfo = result;
//   barcodeWindow = window.open(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}`, '','width=500, height=800, nodeIntegration=no, javascript=yes ');
 
//   barcode_id = result.barcode_id;
//   auth_barcode = result.barcode;
//   user_id = result.user_id;

//   startRetryBarcode();
//   workerConfirmRetryState = callWorkerConfirmRetryState();
//   // workerIsClickUSB = callworkerIsClickUSB();
// })
// .catch(err=> {});
// // Test Api ########################End########################
var WebSocket = null;
if(process.env.NODE_ENV === 'production'){
  WebSocket = require('ws');
}else{
  WebSocket = window.require('ws');
}

const ws = new WebSocket.Server( { port: 0 } );
ws.on('connection', function (w) {  
  w.on( 'message' , function (data)  {
    var data = JSON.parse(data);
    switch(data.channel){
      case 'barcode':
        if(data.action == 'connected'){
          
          w.send(JSON.stringify({response_type: "connectedServer"}));
          break;
        }
        if(data.action == 'retryBarcode'){
          getRetryBarcode();
          break;
        }
        break;
      default:  break;
    }
  }); 
  w.on('close', function() { 
       
  });
  // w.send("connectedServer");
});
// barcodeWindow = new BrowserWindow({width:450,height:600,show : true, autoHideMenuBar: true, resizable: false,});
// barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=success&barcode=9999999999&try_barcode_count=1&remained_time=10&portWS=${ws.address().port}`);

var callWorkerWatchLol = function(r3dlogFullPath, now, currentDirName){ 
  
  fs.readFileAsync( r3dlogFullPath, 'utf8')
  .then((file)=>{
      
      var date = file.match(/Logging started at (\S+)/);
      start_date = date[1].replace('T', ' ');

      var matchGameId = file.match(/GameID=([0-9]+)/);
      if(!!matchGameId && matchGameId?.length && matchGameId?.length >= 2) { 
        GameID = matchGameId[1];
        
      }
      
      // var matchTeam = file.match(/Team(Order|Chaos) \S+ (\S+) \*\*LOCAL\*\*[\s\S]+ConnectionState/);
      var matchTeam = file.match(/Team(Order|Chaos) [0-4]\) ([ \S]+) \*\*LOCAL\*\*[ \S]+ConnectionState/);
      // 
      if(!!matchTeam && matchTeam?.length == 3) {
        myPuuid = matchTeam[0].match(/PUUID\((\S+)\)/)?.[1];
        myTeamType = matchTeam[1];
        myNickname = matchTeam[2];
        var matchMyTeam;
        if(myTeamType == 'Order'){
          matchMyTeam = /TeamOrder [0-4]\) ([ \S]+)  - \S+ \S+ \S+ PUUID\((\S+)\) ConnectionState/g;
        }else if(myTeamType == 'Chaos'){
          matchMyTeam = /TeamChaos [0-4]\) ([ \S]+)  - \S+ \S+ \S+ PUUID\((\S+)\) ConnectionState/g;
        }
        console.log('myPuuid'
        // , myPuuid
        );
        console.log('myTeamType'
        // , myTeamType
        );
        var result = true;
        try{
          while(result = matchMyTeam.exec(file)){
            if(!!!result || !!!result?.length || !!!result?.length >= 3){
              break;
            }
            teamMembers.push({memberNickname: result[1], memberPuuid: result[2]});
          }
          console.log("teamMembers"
          , teamMembers
          );
        }catch(err){
          invalidPattern = 'r3dlog parsing ERROR';
          throw err;
        }
        console.log('lolLogDirs',lolLogDirs);
        if(!!!myNickname){
          return;
        }

        for(var i=0; i<lolLogDirs.length; i++){
            var cb = (file)=>{
                var matchHistoryNicknames = file.match(/Team(Order|Chaos) [0-4]\) ([ \S]+) \*\*LOCAL\*\*[ \S]+ConnectionState/);
                if(!!matchHistoryNicknames && matchHistoryNicknames?.length == 3) {
                  var matchGameId = file.match(/GameID=([0-9]+)/);
                  if(!!matchGameId && matchGameId?.length && matchGameId?.length > 1 
                    // && myNickname != matchHistoryNicknames[2]
                    ) { 
                    lolHistoryNicknames.push({nickname: matchHistoryNicknames[2], GameID: matchGameId[1]});
                  }
                }
              };
            var errCb = (err) => {};
            if(i == lolLogDirs.length-1){
              cb = (file)=>{
                  var matchHistoryNicknames = file.match(/Team(Order|Chaos) [0-4]\) ([ \S]+) \*\*LOCAL\*\*[ \S]+ConnectionState/);
                  if(!!matchHistoryNicknames && matchHistoryNicknames?.length == 3) {
                    var matchGameId = file.match(/GameID=([0-9]+)/);
                    if(!!matchGameId && matchGameId?.length && matchGameId?.length > 1
                      // && myNickname != matchHistoryNicknames[2]
                      ) { 
                      lolHistoryNicknames.push({nickname: matchHistoryNicknames[2], GameID: matchGameId[1]});
                    }
                  }
                  isReadLolHistoryNicknames = true;
                };
              errCb = (err) => { isReadLolHistoryNicknames = true; };
            }
            fs.readFileAsync(`${lolInstallationPath}\\Logs\\GameLogs\\${lolLogDirs[i]}\\${lolLogDirs[i]}_r3dlog.txt`, 'utf8')
              .then(cb)
              .catch(errCb);
          }
        
      }
    })
  .catch((err) => { // 파일 처리시 https://nodejs.org/api/errors.html#errors_common_system_errors에서 에러코드 참조
    console.log('file catch', err);
      if (err.code === 'ENOENT') {
        invalidPattern = 'r3dlog.txt NOT FOUND';
        console.error('File not found!!', invalidPattern);
        initWorkerWatchLol();
        clearInterval(workerChallenge);
        workerChallenge = null;
        return;
      }
      throw err;
    });

  return setInterval(()=>{
    if(!!!lolInstallationPath || invalidLolPath){ // registry 또는 dafault로 lol경로 설정시(초기) or 실행중인 lol경로가 비정상적일 때
      return;
    }
    var lolCurrentClientLogfiles = [];
    var source = `${lolInstallationPath}\\Logs\\LeagueClient Logs`;
    var dest = `"C:\\rankingLogs\\Logs\\LeagueClient Logs\\${now}"\\`;
    try{
      var LogfileList = fs.readdirSync( source, 'utf8');
      
      for(var i=0; i<LogfileList.length; i++){
        var clientLog = fs.statSync(`${source}\\` + LogfileList[i]);
        lolCurrentClientLogfiles.push({name: LogfileList[i], size: clientLog.size, isFile: clientLog.isFile()});
      }
    }catch(err){
      throw err;
    }
    console.error("isReadLolHistoryNicknames", isReadLolHistoryNicknames);
    if(isAlreadyReadLolClientLog && lolCurrentClientLogfiles.length == lolPrevClientLogfiles.length && !!GameID && isReadLolHistoryNicknames){
      console.error("lolCurrentClientLogfiles 2");
      for(var i=0; i<lolCurrentClientLogfiles.length; i++){
        if( lolCurrentClientLogfiles[i].name === lolPrevClientLogfiles[i].name){
          // if( !workerLolDuo && lolCurrentClientLogfiles[i].size !== lolPrevClientLogfiles[i].size){
          if( lolCurrentClientLogfiles[i].size !== lolPrevClientLogfiles[i].size && lolCurrentClientLogfiles[i].name.match(/LeagueClient.log/) 
              // || lolCurrentClientLogfiles[i].name.match(/2021-03-02T13-20-09_25060_LeagueClient.log/)  // TEST TODO
            ){
            console.log("captured LolDuo!");
            fs.readFileAsync(`${source}\\${lolCurrentClientLogfiles[i].name}`, 'utf8')
            .then((file)=>{
                var machine = file.match(/common.machine_id: (\S+)/);
                if(!!!machine || !!!machine?.length || !!!machine?.length >= 2){
                  invalidPattern = 'LeagueClient parsing ERROR';
                }
                machine_id = machine[1];

                var GameIDs = [];
                var result = true;
                var matchGameID = /GameID=([0-9]+)/g;
                try{
                  while(result = matchGameID.exec(file)){
                    if(!!!result || !!!result?.length || !!!result?.length >= 2){
                      break;
                    }
                    GameIDs.push(result[1]);
                    console.log("GameIDs", GameIDs);
                  }
                }catch(err){
                  invalidPattern = 'LeagueClient parsing ERROR';
                  throw err;
                }

                console.error('GameIDs.length', GameIDs.length);
                if(!!!GameIDs.length 
                    || GameIDs[GameIDs.length-1] !== GameID // 현재 진행되는 GameID 만
                    // || (GameIDs.length == 1 && GameIDs[GameIDs.length-1] !== GameID) || (GameIDs.length > 1 && GameIDs[GameIDs.length-2] !== GameID) // TEST 전전판에 진행됬던 GameID 만
                  ){ // TODO ORGIN
                  console.log("종료?");
                  return;
                }else{
                  isCurrentLolClientLog = true;
                }

                var matchPartyPlayerInfo = '';
                if(GameIDs.length == 1){
                  // matchPartyPlayerInfo = new RegExp('players: \\[\\{"puuid"[\\s\\S]+"role":"MEMBER"[\\s\\S]+GameID='+GameID);
                  matchPartyPlayerInfo = new RegExp('[\\s\\S]+GameID='+GameID);
                }
                else if(GameIDs.length > 1){
                  matchPartyPlayerInfo = new RegExp(GameIDs[GameIDs.length-2]+'[\\s\\S]+GameID='+GameID);
                }
                
                var match1 = file.match(matchPartyPlayerInfo);
                console.log('match1  '
                // , match1
                );
                if(!!!match1 || !!!match1?.length){
                  return;
                }
                var wholeSentence = match1[0];
                console.log('듀오확인로그');
                // var sentences = wholeSentence.split(GameID);
                // var latest = sentences[sentences.length-1];
                // 
                var  match2 = wholeSentence.match(/[^\s]\S+"role":"MEMBER"\S+[^\s]/);
                console.log('match2 '
                // , match2
                );

                if(!!!match2 || !!!match2?.length){
                  console.error("솔로확정");
                  isCompleteWatchLol = true;
                  clearInterval(workerWatchLol);
                  workerWatchLol = null;
                  return;
                }
                if(!!!myPuuid){
                  return;
                }

                var members = JSON.parse(match2[0]);
                console.log('members '
                // , members
                );
                for(var i=0; i<members.length; i++){
                  if(members[i].puuid != myPuuid){
                    for(var a=0; a<teamMembers.length; a++){
                      if(members[i].puuid == teamMembers[a].memberPuuid){
                        resultMembers.push({memberNickname: teamMembers[a].memberNickname, memberPuuid: teamMembers[a].memberPuuid});
                        
                        break;
                      }
                    }
                  }
                }
                if(!!resultMembers.length){
                  console.error("듀오확정 resultMembers가 있어서 initWorkerWatchLol");
                  isCompleteWatchLol = true;
                  clearInterval(workerWatchLol);
                  workerWatchLol = null;
                  // clearInterval(workerChallenge);
                  // workerChallenge = null;
                }

              })
            .catch((err) => {
              console.log('file catch err', err);
                if(err.code === 'ENOENT') {
                  // invalidPattern = 'LeagueClient.log NOT FOUND';
                  // console.error('File not found!', invalidPattern);
                  // initWorkerWatchLol();
                  // clearInterval(workerChallenge);
                  // workerChallenge = null;
                  return;
                }
                throw err;
              });
          }
        }
      }
    }

    lolPrevClientLogfiles = [...lolCurrentClientLogfiles];
    // 
    isAlreadyReadLolClientLog = true;
  },4000);
}

// var csrf = ''; // TODO flag
// ipcRenderer.on('renderer-main', (event, arg) => { // main으로부터 수신
//   console.log("renderer-main", arg)
//   if(arg?.mode == 'getCsrf'){
//     csrf = arg?.data?.csrf;
//   }
// });

// workerIsRunningLol = callWorkerIsRunningLol(); // TODO TEST league of legend 관련 실제 프로세스가 돌아가지않으면 init lol 및 워커 초기화를 하므로 TEST 시 주석처리

workerIsInGameLol = setInterval(()=>{ // 게임중인지 감지 and 서버요청 worker 
  if(!!!lolInstallationPath || invalidLolPath){ // registry 또는 dafault로 lol경로 설정시(초기) or 실행중인 lol경로가 비정상적일 때
    return;
  }
  // if(!fs.existsSync(lolInstallationPath + '\\Logs\\GameLogs')){
  //   return;
  // }
  try{
    lolLogDirs = fs.readdirSync( lolInstallationPath + '\\Logs\\GameLogs', 'utf8');
    if(!lolLogDirs.length) return;
    var currentDirName = lolLogDirs[lolLogDirs.length-1];
    var currentFileSize = fs.statSync(`${lolInstallationPath}\\Logs\\GameLogs\\${currentDirName}\\${currentDirName}_netstats.csv`).size;
    if(isAlreadyReadLolLog){ //..stat.csv을 읽은적이있는지 
      console.log('currentDirName', currentDirName);
      console.log("prevDirName", prevDirName);
      console.log("currentFileSize", currentFileSize);
      console.log('prevFileSize', prevFileSize);
      if(currentDirName == prevDirName){

        if(currentFileSize !== prevFileSize){
          isChangedSizeLogDirs = true;
        }else{
          isChangedSizeLogDirs = false;
        }

        if(!workerChallenge && currentFileSize !== prevFileSize){
          isPlayingLol = true;
        }else{
          isPlayingLol = false;
          
        }
      }

      console.log("new URLSearchParams(global.location.search).get('invalidLolLogDir')", new URLSearchParams(global.location.search).get('invalidLolLogDir'));
      if(isPlayingLol && new URLSearchParams(global.location.search).get('invalidLolLogDir') != currentDirName){
        console.error("create Playing Worker [workerChallenge]");

        initAuthData();
        initWorkerWatchLol();
        clearKillRemoteDesktopWorkers();
        clearInterval(workerChallenge);
        workerChallenge = null;
        // authOnce = auth;
        workerChallenge = callWorkerCheckLolLog(currentDirName);
      }
    }

    prevDirName = currentDirName;
    prevFileSize = currentFileSize;
    isAlreadyReadLolLog = true;
  }catch(dirErr){
    throw dirErr;
  }
}, 4000);

var N = 0;

var timeBetweenCalls = 4000; // Milliseconds
var startTime = new Date().getTime();

var callWorkerCheckLolLog = function(currentDirName){  // 로그파일 카피 and 로그분석 worker생성함수
  console.log("workerChallenge");
  // 
  var now = Date.now();//파일명에 붙는 prefix
  var r3dlog = `${lolInstallationPath}\\Logs\\GameLogs\\${currentDirName}\\${currentDirName}_r3dlog.txt`;
  workerWatchLol = callWorkerWatchLol(r3dlog, now, currentDirName);

  // isCompleteWatchLol = false;
  // clearInterval(workerChallenge);
  // workerChallenge = null;
  createEndGameWorker(r3dlog, currentDirName);
  return true;
}

var timeout;
function createEndGameWorker(r3dlog, currentDirName){
  var now = new Date().getTime();
  
  console.log('Beat at ' + (now - startTime) + 'ms');

  console.log('isCompleteWatchLol', isCompleteWatchLol);
  if(!isCompleteWatchLol){
    clearTimeout(timeout);
  //   if (new Date().getTime() - now > timeBetweenCalls) {
  //     clearTimeout(timeout);
  //     setTimeout(createEndGameWorker, 0, r3dlog, currentDirName);
  //   }else{
      timeout = setTimeout(createEndGameWorker, timeBetweenCalls, r3dlog, currentDirName);
    // }
    return;
  }
  clearInterval(workerWatchLol);
  workerWatchLol = null;

  fs.readFileAsync( r3dlog, 'utf8')
    .then((file)=>{
      console.log('r3dlog logFile');
      QuitGame = file.match(/GAMESTATE_EXIT/);
      console.error('QuitGame', QuitGame);
      if(!!QuitGame) { //게임 종료 될때
        createKillRemoteDesktopWorkers();
        var url = new URL(global.location);
        url.searchParams.set('invalidLolLogDir', currentDirName);
        global.history.pushState({}, '', url);
        // global.invalidLolLogDir = currentDirName;
        if(isChangedSizeLogDirs){
          clearKillRemoteDesktopWorkers();
          clearTimeout(timeout);
          timeout = setTimeout(createEndGameWorker, timeBetweenCalls, r3dlog, currentDirName);
          return;
        }

        setTimeout(()=>{  // (안정빵 장치) 5분 30초뒤에 무족건 전체 초기화
          // barcodeWindow?.close();
          window.location.href = window.location.href;
        },330000);
        fs.readFileAsync( `${lolInstallationPath}\\Logs\\GameLogs\\${currentDirName}\\${currentDirName}_netstats.csv`, 'utf8')
        .then((file)=>{
          var netstatsArray = file.split(',');
          netstatsArray.pop(); // TODO 맨 마지막 배열에 엔터가 들어가있어서 pop으로 맨끝 배열을 없애준다
          console.log('netstatsArray.length', netstatsArray.length);
          
          if(netstatsArray.length<=36){
            failLogForBarcodeCreation(Object.assign({game_id: GameID, game_nickname: myNickname}, netstatsArray), 'insufficient data of netstat.csv');
            window.location.href = window.location.href;
            return;
          }
          for(var i=0; i<36; i++){
            if(netstatsArray[i] == 'game.time') N = i; 
          }
          // if((netstatsArray.length-1-33)%36 != N){ // TODO 종료체크버전
          //   clearKillRemoteDesktopWorkers();
          //   clearTimeout(timeout);
          //   timeout = setTimeout(createEndGameWorker, timeBetweenCalls, r3dlog, currentDirName);
          //   // failLogForBarcodeCreation(Object.assign({game_id: GameID, game_nickname: myNickname}, netstatsArray), 'Strange last data of netstat.csv');
          //   // window.location.href = window.location.href;
          //   return;
          // }

          console.log('[36 + N]',36 + N);
            // TODO TEST 테스트를 위해 주석
          if(parseInt(netstatsArray[36 + N]) >= parseFloat(1.0)) {
            invalidPattern = 'netstats.csv invalid first time';
            console.error(invalidPattern);
            failLogForBarcodeCreation(Object.assign({game_id: GameID, game_nickname: myNickname}, netstatsArray), invalidPattern);
            barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
            barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'게임 시작이 정상적이지 않아 실패하였습니다.'}`);

            setTimeout(()=>{ window.location.href = window.location.href; },1000);
            return;
          }   
          
          // if(parseInt(netstatsArray[netstatsArray.length - 36 + N]) != 0) {  // TODO 종료체크버전
          //   invalidPattern = 'netstats.csv invalid last time'; 
          //   console.error(invalidPattern);
          //   failLogForBarcodeCreation(Object.assign({game_id: GameID, game_nickname: myNickname}, netstatsArray), invalidPattern);
          //   barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
          //   barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'게임 종료가 정상적이지 않아 실패하였습니다.'}`);
            
          //   setTimeout(()=>{ window.location.href = window.location.href; },1000);
          //   return;
          // }

          if(!isCurrentLolClientLog) {
            invalidPattern = 'is not current log Or is not current real time log';
            console.error(invalidPattern);
            failLogForBarcodeCreation({game_id: GameID, game_nickname: myNickname}, invalidPattern);

            setTimeout(()=>{ window.location.href = window.location.href; },1000);
            return; 
          }
        
          var filteredLolHistoryNicknames = [];
          var prev = '';
          lolHistoryNicknames.map((hist,i)=>{
            if(i == 0 || (!!prev && hist.nickname != prev && !!!filteredLolHistoryNicknames.find(fhist => fhist.nickname == hist.nickname)) ) filteredLolHistoryNicknames.push({nickname: hist.nickname, game_ids: []});
            prev = hist.nickname;
          });
          lolHistoryNicknames.map((hist, h)=>{
            filteredLolHistoryNicknames.map((fhist, n)=>{
              if(fhist.nickname == hist.nickname) fhist.game_ids.push(hist.GameID);
            });
          });
          console.log('RESULT: filteredLolHistoryNicknames',filteredLolHistoryNicknames);

          var game_data = {};
          game_data.machine_id = machine_id;
          game_data.game_id = GameID;
          game_data.game_nickname = myNickname;
          game_data.start_date = start_date;
          var memberNicknames;
          if((memberNicknames = resultMembers.map(member => member.memberNickname)).length){
            game_data.membersNickname = memberNicknames;
          }
          if(filteredLolHistoryNicknames.length >= 2){
            game_data.game_data = JSON.stringify(filteredLolHistoryNicknames);
          }
          if(!invalidPattern){
            fetch(server_url + '/c/client/getbarcode', { // ajax 테스트 코드
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: { 'Content-Type': 'application/json' },
              redirect: 'follow', // manual, *follow, error
              referrer: 'no-referrer', // no-referrer, *client
              body: JSON.stringify(game_data), 
            })
            .then(res => res.json())
            .then((result) => {
              console.log("result: ",result);
              if(result?.code != 'success') {
                barcodeWindow?.destroy();
                if(result.error == '[챌린지검사] 조건에 맞는 솔랭 게임 내역이 없습니다.'){
                  reGetBarcode(game_data);
                  failLogForBarcodeCreation(Object.assign({},game_data), Object.assign({},result), '바코드 생성 재시도');
                  return;
                }else if(result.error == '[챌린지검사] 현재 챌린지 중이 아닙니다.'){
                  var message = '';
                  if(game_data?.membersNickname){
                    message = '<br/>듀오인데 솔로로 신청했거나<br/>챌린지 도전내역이 없습니다.';
                  }else{
                    message = '<br/>솔로인데 듀오로 신청했거나<br/>챌린지 도전내역이 없습니다.';
                  }
                  barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
                  barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${message}`);
                }else if(result.error == '[듀오검사] 멤버들이 같은 챌린지가 아닙니다.'){
                  barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
                  barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'멤버들이 같은 챌린지가 아닙니다.'}`);
                }
                failLogForBarcodeCreation(Object.assign({},game_data), Object.assign({},result));

                initLol();
                clearKillRemoteDesktopWorkers();
                clearInterval(workerIsClickUSB);
                workerIsClickUSB = null;
                console.error(result?.error);

                window.location.href = window.location.href;
                return;
              }

              authedLolInfo = { try_barcode_count: 1};

              barcodeWindow?.destroy();
              barcodeWindow =  new BrowserWindow({width: 600, height: 600, show: true, autoHideMenuBar: true, resizable: false});
              barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10&portWS=${ws.address().port}`);
              barcodeWindow.setContentProtection(true);
              // barcodeWindow = window.open(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no');
            
              barcode_id = result.barcode_id;
              auth_barcode = result.barcode;
              user_id = result.user_id;

              console.log("authedLolInfo 1 : invalidPattern ", authedLolInfo);
              workerIsClickUSB = callworkerIsClickUSB();
            })
            .catch(err=> { 
              failLogForBarcodeCreation(Object.assign({},game_data), Object.assign({},err));
              initLol();
              clearKillRemoteDesktopWorkers();
              window.location.href = window.location.href;
            });
          }else{
            clearKillRemoteDesktopWorkers();
            clearTimeout(timeout);
          }
        
        })
        .catch((err) => { // 파일 처리시 https://nodejs.org/api/errors.html#errors_common_system_errors에서 에러코드 참조
          console.log('file catch', err);
          if (err.code === 'ENOENT') {
            invalidPattern = 'r3dlog.txt NOT FOUND';
          }else{
            invalidPattern = 'authOnce error';
          }
          console.error(invalidPattern);
          var game_data = {};
          game_data.machine_id = machine_id;
          game_data.game_id = GameID;
          game_data.game_nickname = myNickname;
          game_data.start_date = start_date;
          var memberNicknames;
          if((memberNicknames = resultMembers.map(member => member.memberNickname)).length){
            game_data.membersNickname = memberNicknames;
          }
          
          failLogForBarcodeCreation(Object.assign({},game_data), invalidPattern);
  
          initLol();
          clearKillRemoteDesktopWorkers();
          clearInterval(workerIsClickUSB);
          workerIsClickUSB = null;
          console.error(result?.error);
          
          window.location.href = window.location.href;
          throw err;
        });
      }
      else{  // 아직 END_GAME 게임 종료가 아닐때
        clearTimeout(timeout);
      //   if (new Date().getTime() - now > timeBetweenCalls) {
      //     clearTimeout(timeout);
      //     setTimeout(createEndGameWorker, 0, r3dlog, currentDirName);
      //   }else{
          timeout = setTimeout(createEndGameWorker, timeBetweenCalls, r3dlog, currentDirName);
        // }

      }
    })
    .catch((err) => { // 파일 처리시 https://nodejs.org/api/errors.html#errors_common_system_errors에서 에러코드 참조
      console.log('file catch', err);
      if (err.code === 'ENOENT') {
        invalidPattern = 'r3dlog.txt NOT FOUND';
        console.error('File not found!', invalidPattern);
        return;
      }
      invalidPattern = 'authOnce error';
      console.error('fucntion error!', invalidPattern);
      initWorkerWatchLol();
      global.invalidLolLogDir = currentDirName;
      clearInterval(workerChallenge); 
      workerChallenge = null;
      throw err;
    });
  return;
}


// function auth(file, currentDirName){
//   
//   QuitGame = file.match(/GAMESTATE_EXIT/);
//   

//   if(!!QuitGame) { //게임 종료 될때
//     
//     QuitGame = null;
//     isCompleteWatchLol = false;
//     authOnce = function(file, currentDirName){ };
//     clearInterval(workerChallenge);
//     workerChallenge = null;

//     invalidLolLogDir = currentDirName;
//     setTimeout(()=>{
//       fs.readFileAsync( `${lolInstallationPath}\\Logs\\GameLogs\\${currentDirName}\\${currentDirName}_netstats.csv`, 'utf8')
//       .then((file)=>{
//         if(!QuitGame) {
//           finalNetstatsArray = file.split(',');
//           finalNetstatsArray.pop(); // TODO 맨 마지막 배열에 엔터가 들어가있어서 pop으로 맨끝 배열을 없애준다
//         }
//         createKillRemoteDesktopWorkers(); // 원격죽이는 워커 시작
//             // TODO TEST 테스트를 위해 주석 (뺏음 || parseFloat(finalNetstatsArray[finalNetstatsArray.length - 36 + N]) != 0.000000)
//         if(parseInt(finalNetstatsArray[finalNetstatsArray.length - 36 + N]) != 0 ) {invalidPattern = 'netstats.csv invalid last time'; invalidLolLogDir = currentDirName;  window.open(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'게임 종료가 정상적이지 않아 실패하였습니다.'}`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no'); initWorkerWatchLol(); clearInterval(workerChallenge); workerChallenge = null; return;}
//         console.log("finalNetstatsArray[finalNetstatsArray.length - 36 + N]",parseFloat(finalNetstatsArray[finalNetstatsArray.length - 36 + N]) );
//         if(!isCurrentLolClientLog) {invalidPattern = 'is not current log Or is not current real time log'; invalidLolLogDir = currentDirName;  initWorkerWatchLol(); clearInterval(workerChallenge); workerChallenge = null; return;}
//         
//         
//         

//         
//         // spawn( 'xcopy',  [`"${lolInstallationPath}\\Logs\\LeagueClient Logs"`, `"C:\\rankingLogs\\Logs\\GameLogs\\${lolLogDirs[lolLogDirs.length-1]}\\LeagueClientLogs_${now}"\\`, '/H'], {windowsVerbatimArguments: true} ); // 클라이언트 log 저장

//         var filteredLolHistoryNicknames = [];
//         var prev = '';
//         lolHistoryNicknames.map((hist,i)=>{
//           if(i == 0 || (!!prev && hist.nickname != prev && !!!filteredLolHistoryNicknames.find(fhist => fhist.nickname == hist.nickname)) ) filteredLolHistoryNicknames.push({nickname: hist.nickname, game_ids: []});
//           prev = hist.nickname;
//         });
//         lolHistoryNicknames.map((hist, h)=>{
//           filteredLolHistoryNicknames.map((fhist, n)=>{
//             if(fhist.nickname == hist.nickname) fhist.game_ids.push(hist.GameID);
//           });
//         });
//         
//         

//         var game_data = {};
//         game_data.machine_id = machine_id;
//         game_data.game_id = GameID;
//         game_data.game_nickname = myNickname;
//         game_data.start_date = start_date;
//         var memberNicknames;
//         if((memberNicknames = resultMembers.map(member => member.memberNickname)).length){
//           game_data.membersNickname = memberNicknames;
//         }
//         if(filteredLolHistoryNicknames.length >= 2){
//           game_data.game_data = JSON.stringify(filteredLolHistoryNicknames);
//         }
//         if(!invalidPattern){
//           
//           initWorkerWatchLol();
          
//           fetch(server_url + '/c/client/getbarcode', { // ajax 테스트 코드
//               method: 'POST', // *GET, POST, PUT, DELETE, etc.
//               headers: { 'Content-Type': 'application/json' },
//               redirect: 'follow', // manual, *follow, error
//               referrer: 'no-referrer', // no-referrer, *client
//               body: JSON.stringify(game_data), 
//             })
//           .then(res => res.json())
//           .then((result) => {
//             
//             if(result?.code != 'success') {
//               if(result.error == '[챌린지검사] 조건에 맞는 솔랭 게임 내역이 없습니다.'){
//                 reGetBarcode(game_data);
//                 failLogForBarcodeCreation(game_data, result, '바코드 생성 재시도');
//                 return;
//               }else if(result.error == '[챌린지검사] 현재 챌린지 중이 아닙니다.'){
//                 var message = '';
//                 if(game_data?.membersNickname){
//                   message = '<br/>듀오인데 솔로로 신청했거나<br/>챌린지 도전내역이 없습니다.';
//                 }else{
//                   message = '<br/>솔로인데 듀오로 신청했거나<br/>챌린지 도전내역이 없습니다.';
//                 }
//                 window.open(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${message}`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no');
//               }else if(result.error == '[듀오검사] 멤버들이 같은 챌린지가 아닙니다.'){
//                 window.open(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'멤버들이 같은 챌린지가 아닙니다.'}`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no');
//               }
//               failLogForBarcodeCreation(game_data, result);

//               initLol();
//               clearKillRemoteDesktopWorkers();
//               clearInterval(workerIsClickUSB);
//               workerIsClickUSB = null;
//               

//               window.location.href = window.location.href;
//               return;
//             }

//             authedLolInfo = { try_barcode_count: 1};

//             barcodeWindow?.destroy();
//             barcodeWindow =  new BrowserWindow({width: 600, height: 600, show: true, autoHideMenuBar: true, resizable: false});
//             barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10&portWS=${ws.address().port}`);
//             barcodeWindow.setContentProtection(true);
//             // barcodeWindow = window.open(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no');
          
//             barcode_id = result.barcode_id;
//             auth_barcode = result.barcode;
//             user_id = result.user_id;

//             
//             // startRetryBarcode();
//             // workerConfirmRetryState = callWorkerConfirmRetryState();
//             workerIsClickUSB = callworkerIsClickUSB();
//           })
//           .catch(err=> { 
//             failLogForBarcodeCreation(game_data, err);
//             initLol();
//             clearKillRemoteDesktopWorkers();
//             window.location.href = window.location.href;
//           });
//         }
        
//       })
//       .catch((err) => { // 파일 처리시 https://nodejs.org/api/errors.html#errors_common_system_errors에서 에러코드 참조
//         
//         if (err.code === 'ENOENT') {
//           invalidPattern = 'r3dlog.txt NOT FOUND';
//         }else{
//           invalidPattern = 'authOnce error';
//         }
//         
//         var game_data = {};
//         game_data.machine_id = machine_id;
//         game_data.game_id = GameID;
//         game_data.game_nickname = myNickname;
//         game_data.start_date = start_date;
//         var memberNicknames;
//         if((memberNicknames = resultMembers.map(member => member.memberNickname)).length){
//           game_data.membersNickname = memberNicknames;
//         }

//         failLogForBarcodeCreation(game_data, invalidPattern);

//         initLol();
//         clearKillRemoteDesktopWorkers();
//         clearInterval(workerIsClickUSB);
//         workerIsClickUSB = null;
//         

//         window.location.href = window.location.href;
//         throw err;
//       });
//     },4000);
    
//     // authOnce = function(file, currentDirName){ };
//     clearInterval(workerChallenge);
//     workerChallenge = null;
//   }
// }

// // ################TEST################
// setTimeout(()=>{
//   // lolInstallationPath = 'C:\\아물 어쩔\\Riot Games\\League of Legends';
//   workerChallenge = callWorkerCheckLolLog("2021-03-02T13-25-19");
// },12000);
// // ################TEST################

function failLogForBarcodeCreation(game_data, error, etc = null){
  var error_data = {};
  error_data.game_id = game_data.game_id;
  error_data.game_nickname = game_data.game_nickname;
  if(!etc) error_data.error = JSON.stringify(error);
  else error_data.error = JSON.stringify(etc);
  error_data.request_data = JSON.stringify(game_data);

  fetch(server_url + '/c/client/fail-log-for-barcode-creation', { // ajax 테스트 코드
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(error_data), 
  })
    .then(res => res.json())
    .then((result) => {
      console.log('바코드 생성 실패시, 생성 실패 내역 요청');
    })
    .catch(err=> {console.log('바코드 생성 실패시, 생성 실패 내역 요청 err',err); });
}

function updateBarcodeAuthFailedLog(target_barcode_id, error, etc = null){
  var error_data = {};
  error_data.barcode_id = target_barcode_id;
  if(!etc) error_data.error = JSON.stringify(error);
  else error_data.error = JSON.stringify(etc);
  
  fetch(server_url + '/c/client/update-barcode-auth-failed-log', { // ajax 테스트 코드
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(error_data), 
  })
    .then(res => res.json())
    .then((result) => {
      console.log('바코드 생성 후, 인증 실패 내역 기록 요청');
    })
    .catch(err=> { console.log('바코드 생성 후, 인증 실패 내역 기록 요청 err',err); });
}

// window.addEventListener("message", (e) => {
//   
//   if(e.data == 'retry'){
//     getRetryBarcode();
//   }
// });

function initAuthData(){ // TODO +01/13 초기화 필요
  authedLolInfo = null
  barcode_id = null; // auth_barodes테이블 PK
  auth_barcode = null; // auth_barodes테이블 바코드
  user_id =null;
}

function reGetBarcode(game_data){
  console.log("@@@@@@@@@@@@@@Before:ajax reGetBarcode생성요청@@@@@@@@@@@@@@",game_data);
  setTimeout((game_data)=>{
    console.log("@@@@@@@@@@@@@@ajax reGetBarcode생성요청@@@@@@@@@@@@@@",game_data);
    fetch(server_url + '/c/client/getbarcode', { // ajax 테스트 코드
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(game_data), 
      })
    .then(res => res.json())
    .then(result => {
      console.log("result: ",result);
      if(result?.code != 'success') {
        // initAuthData();
        barcodeWindow?.destroy();
        if(result.error == '[플레이인증] 동일한 게임ID가 이미 바코드 발급을 받았습니다.'){
          console.error(result?.error);
          return;
        }else if(result.error == '[챌린지검사] 현재 챌린지 중이 아닙니다.'){
          var message = '';
          if(game_data?.membersNickname){
            message = '<br/>듀오인데 솔로로 신청했거나<br/>챌린지 도전내역이 없습니다.';
          }else{
            message = '<br/>솔로인데 듀오로 신청했거나<br/>챌린지 도전내역이 없습니다.';
          }
          barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
          barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${message}`);
          
        }else if(result.error == '[듀오검사] 멤버들이 같은 챌린지가 아닙니다.'){
          barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
          barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'멤버들이 같은 챌린지가 아닙니다.'}`);
        }
        updateBarcodeAuthFailedLog(barcode_id, Object.assign({},result));
        
        initLol();
        clearKillRemoteDesktopWorkers();
        clearInterval(workerIsClickUSB);
        workerIsClickUSB = null;
        console.error(result?.error);
        window.location.href = window.location.href;
        return;
      }

      if(!!!barcode_id){
        return;
      }

      authedLolInfo = { try_barcode_count: 1};

      barcodeWindow?.destroy();
      barcodeWindow =  new BrowserWindow({width: 600, height: 600, show: true,  autoHideMenuBar: true, resizable: false});
      barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10&portWS=${ws.address().port}`);
      barcodeWindow.setContentProtection(true);
      // barcodeWindow = window.open(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=${result.code}&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=10`, '', 'show=yes, autoHideMenuBar=yes, width=450, height=450, resizable=no');

      barcode_id = result.barcode_id;
      auth_barcode = result.barcode;
      user_id = result.user_id;

      console.log("authedLolInfo 1 : invalidPattern ", authedLolInfo);
      workerIsClickUSB = callworkerIsClickUSB();
    })
    .catch(err=> {
      console.log('reGetBarcode err',err);
      updateBarcodeAuthFailedLog(barcode_id, 'reGetBarcode catch err');

      initLol();
      clearKillRemoteDesktopWorkers();
      clearInterval(workerIsClickUSB);
      workerIsClickUSB = null;
      window.location.href = window.location.href;
    });
    
  },5000, game_data);
}

function getRetryBarcode(){
  // barcodeWindow?.close();
  barcodeWindow?.destroy();
  console.log("authedLolInfo 2 : getRetryBarcode ", authedLolInfo);
  if(!authedLolInfo?.try_barcode_count || authedLolInfo?.try_barcode_count >= 3){
    // clearInterval(workerConfirmRetryState);
    // workerConfirmRetryState =null;
    return;
  }
  fetch(server_url + '/c/client/client-get-retry-barcode', { // ajax 테스트 코드
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({
        user_id: user_id,
        barcode_id: barcode_id,
        try_barcode_count: authedLolInfo.try_barcode_count
      }), 
    })
  .then(res => res.json())
  .then(result => {
    console.log("getRetryBarcode result: ",result);
    if(result?.code == '403') {
      console.error(result?.error);

      updateBarcodeAuthFailedLog(barcode_id, Object.assign({},result));
        
      initLol();
      clearKillRemoteDesktopWorkers();
      clearInterval(workerIsClickUSB);
      workerIsClickUSB = null;
      window.location.href = window.location.href;
      return;
    }
    
    authedLolInfo = result;
    auth_barcode = result.barcode;

    barcodeWindow?.destroy();
    barcodeWindow =  new BrowserWindow({width: 600, height: 600, show: true,  autoHideMenuBar: true, resizable: false});
    barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/barcode.html?success=success&barcode=${result.barcode}&try_barcode_count=${authedLolInfo.try_barcode_count}&remained_time=${result.remained_time}&portWS=${ws.address().port}`);
    barcodeWindow.setContentProtection(true);
  })
  .catch(err=> {
    console.log('getRetryBarcode err',err);
    updateBarcodeAuthFailedLog(barcode_id, 'getRetryBarcode catch err');
        
    initLol();
    clearKillRemoteDesktopWorkers();
    clearInterval(workerIsClickUSB);
    workerIsClickUSB = null;
    window.location.href = window.location.href;
  });
}

function callworkerIsClickUSB(){ 
   
  setTimeout(()=>{  // (안정빵 장치) 5분 5초뒤에 결과확인후 인증유무 메세지 출력후 전체 초기화
    // barcodeWindow?.close();
    barcodeWindow?.destroy();
    fetch(server_url + '/c/pc/usb/isClick', { // ajax 테스트 코드
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
          'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({barcode_id: barcode_id}), 
    })
    .then(res => res.json())
    .then(res => {
      if(!!res.result.verified_at){
        barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
        barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'인증에 성공하였습니다.'}`);
      }else if(res.result.code == '403' || (res.result.is_verified =='false' && res.result.is_verified_usb =='false')){
        if(res.result.code == '403' ) updateBarcodeAuthFailedLog(barcode_id, Object.assign({},res.result));
        barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
        barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'인증에 실패하였습니다.'}`);
      }
    })
    .catch(err=> { console.log('err',err); });
    setTimeout(()=>{
      window.location.href = window.location.href;
    },2000);
  },305000);
  return setInterval(()=>{
    fetch(server_url + '/c/pc/usb/isClick', { // ajax 테스트 코드
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify({barcode_id: barcode_id}), 
      })
    .then(res => res.json())
    .then(res => {
      console.log('callworkerIsClickUSB result',res);
      if(!!res.result.verified_at){
        initLol();
        clearKillRemoteDesktopWorkers();
        clearInterval(workerIsClickUSB);
        workerIsClickUSB = null;

        barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
        barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'인증에 성공하였습니다.'}`);
        
        window.location.href = window.location.href;
        return;
      }else if(res.result.code == '403' || (res.result.is_verified =='false' && res.result.is_verified_usb =='false')){
        if(res.result.code == '403'){
          updateBarcodeAuthFailedLog(barcode_id, Object.assign({},res.result));
        }
        
        initLol();
        clearKillRemoteDesktopWorkers();
        clearInterval(workerIsClickUSB);
        workerIsClickUSB = null;

        barcodeWindow = new BrowserWindow({width:450,height:450,show : true, autoHideMenuBar: true, resizable: false,});
        barcodeWindow.loadURL(new URLSearchParams(global.location.search).get('appPath') + `/notification.html?message=${'인증에 실패하였습니다.'}`);
        window.location.href = window.location.href;
        return;
      }
      if(res.result.usb_auth_app_state == 'Y' && !workerIsConnectedUSB){
        console.error('Discovered app click[USB 인증 버튼]');
        workerIsConnectedUSB = callWorkerIsConnectedUSB();
        // clearInterval(workerIsClickUSB); 
        // workerIsClickUSB=null;
      }
    })
    .catch(err=> {});
  }, 3000);
};

function callWorkerIsConnectedUSB(){ 
  return setInterval(()=>{
    exec(`powershell.exe -Command " \
            try{ \
              $shell = New-Object -ComObject Shell.Application; \
              $drives = $shell.NameSpace(17).Self; \
              $phone = $drives.GetFolder.Items() | ?{$_.Type -match '휴대용 장치' -or $_.Type -match '휴대폰' -or $_.Type -match '휴대[ \\S]+' -or $_.Type -match 'portable[ \\S]+'}; \
              if(!$phone) {return 0;} return 1; \
            }catch{ \
              $_.Exception; \
              $_.Exception.Gettype().FullName; \
            } \
          "`, (err, stdout, stderr) => {
      console.log('err', err); console.log('stdout', "'" + stdout + "'"); console.log('stderr', stderr);
      if(!!err) return;
      if(!(stdout.trim() == '1')) return;
      console.error('USB connected'); 
      getPhoneInfo();
      clearInterval(workerIsConnectedUSB);
      workerIsConnectedUSB = null;
    });
  },2000);
}

function getPhoneInfo(){ // Phone의 DCIM파일정보를 evidence로써 랜덤으로 수집해서 저장하는
  exec(`powershell.exe -Command " \
          Function Get-FileMetaData{ \
            Param([System.__ComObject]$folder); \
            foreach($sFolder in $folder){ \
              $a = 0; \
              $objShell = New-Object -ComObject Shell.Application; \
              $objFolder = $objShell.namespace($sFolder); \
              \
              foreach($File in $objFolder.items()){ \
                $FileMetaData = New-Object PSOBJECT; \
                  for ($a ; $a  -le 266; $a++){ \
                    if($objFolder.getDetailsOf($File, $a)){ \
                      if($objFolder.getDetailsOf($File, $a) -match ' X '){ \
                        $hash += @{$('너비높이') = $($objFolder.getDetailsOf($File, $a)) }; \
                      }else{ \
                        $hash += @{$($objFolder.getDetailsOf($objFolder.items, $a)) = $($objFolder.getDetailsOf($File, $a)) }; \
                      } \
                      \
                      $FileMetaData | Add-Member $hash; \
                      $hash.clear(); \
                    }  \
                  } \
                $a=0; \
                $FileMetaData; \
              } \
            } \
          }; \
          \
          try{ \
            Remove-Variable -Name * -ErrorAction SilentlyContinue; \
            $shell = New-Object -ComObject Shell.Application; \
            $drives = $shell.NameSpace(17).Self; \
            $phone = $drives.GetFolder.Items() | ?{$_.Type -match '휴대용 장치' -or $_.Type -match '휴대폰' -or $_.Type -match '휴대[ \\S]+' -or $_.Type -match 'portable[ \\S]+'}; \
            if(!$phone) {return 0;} \
            \
            $root_folder = $phone.GetFolder.Items() | ?{$_}; \
            if(!$root_folder) {return 0;} \
            \
            $dcim = $root_folder.GetFolder.Items() | ?{$_.Name -eq 'DCIM'}; \
            if(!$dcim) {return 0;} \
            \
            $limit = 5; \
            $object = @{count= 0; pictures= @(); }; \
            if($phone.Name -match '[ \\S]*apple[ \\S]*'){ \
              $folders = $dcim.GetFolder.Items() | ?{$_.Name -match '[ \\S]*apple[ \\S]*'}; \
              \
              $merge_files = @(); \
              ForEach($fold in $folders){ \
                $items = $fold.GetFolder.Items() | ?{$_.Name -cmatch '^((?!IMG_E)IMG_[ \\S]*)'}; \
                $merge_files = @($merge_files) + $items; \
              } \
              $random_files = $merge_files | Get-Random -Count $limit; \
              $object.count = $merge_files.Count; \
              $OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8; \
              \
              ForEach( $folder in $folders ){ \
                $files = Get-FileMetaData $folder; \
                ForEach( $obj in $files ){ \
                  if(!!$obj.'이름'){  \
                    if( !($random_files | ?{$_.Name -eq $obj.'이름'}) ){ continue;} \
                    $object.pictures += @{ name= $obj.'이름'; date= (Get-Date -Date ($obj.'만든 날짜')).ToString('yyyy-MM-dd HH:mm:ss'); }; \
                  }else{  \
                    if( !($random_files | ?{$_.Name -eq $obj.'Name'}) ){ continue;} \
                    $object.pictures += @{ name= $obj.'Name'; date= (Get-Date -Date ($obj.'Created')).ToString('yyyy-MM-dd HH:mm:ss'); }; \
                  } \
                } \
              } \
            }else{ \
              $folder = $dcim.GetFolder.Items() | ?{$_.Name -eq 'Camera'}; \
              \
              $files = Get-FileMetaData $folder; \
              $object.count = $files.Count; \
              \
              $random_files = $files | Get-Random -Count $limit; \
              $OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8; \
              ForEach( $obj in $random_files ){ \
                if(!!$obj.'이름'){  \
                  $object.pictures += @{ name= $obj.'이름'; date= (Get-Date -Date ($obj.'수정한 날짜')).ToString('yyyy-MM-dd HH:mm:ss'); }; \
                }else{  \
                  $object.pictures += @{ name= $obj.'Name'; date= (Get-Date -Date ($obj.'Modified')).ToString('yyyy-MM-dd HH:mm:ss'); }; \
                } \
              } \
            } \
            \
            return ConvertTo-Json $object; \
          } \
          catch{ \
              $_.Exception; \
              $_.Exception.Gettype().FullName; \
          } \
  "`, (err, stdout, stderr) => {
    console.log('err', err); console.log('stdout', stdout); console.log('stderr', stderr);
    if(!!err) return;
    if(stdout.trim() == '0') {
      workerIsConnectedUSB = callWorkerIsConnectedUSB();
      return;
    }

    fetch(server_url + '/c/pc/usb/updatePhoneData', { // ajax 테스트 코드
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify({
          barcode_id: barcode_id,
          // auth_barcode: auth_barcode,
          auth_phone_data: JSON.stringify(JSON.parse(stdout.trim()))
        }), 
      })
    .then(res => res.json())
    .then(res => {
      if(res.result?.code == '403') {
        console.error(res.result.error);
        updateBarcodeAuthFailedLog(barcode_id, Object.assign({},res.result));
        
        initLol();
        clearKillRemoteDesktopWorkers();
        clearInterval(workerIsClickUSB);
        workerIsClickUSB = null;
        window.location.href = window.location.href;
        return;
      }
      console.error('USB 가져오기 성공',JSON.parse(stdout));
    })
    .catch(err=> {
      console.log('err',err);
      updateBarcodeAuthFailedLog(barcode_id, 'updatePhoneData 실패 catch err');
        
      initLol();
      clearKillRemoteDesktopWorkers();
      clearInterval(workerIsClickUSB);
      workerIsClickUSB = null;
      window.location.href = window.location.href;
    });
    
    clearInterval(workerIsConnectedUSB);
    workerIsConnectedUSB = null;
  });
}

// // const psList =  require('ps-list');
// // const {exec} =  require('child_process');

// // ps = setInterval(()=>{
// //   psList().then((processes) => { //process 리스트 비동기적으로 취득 
// //     var disallowedArray = processes.filter((ps) => ps.name == 'notepad.exe');

// //     disallowedArray.map((ps) =>
// //       exec(`taskkill /F /T /PID ${ps.pid} `, (err, stdout, stderr) => { }) 
// //     );
    
// //     ipcRenderer.send('main', {mode: 'ps-list', data: []}); // mode가 'ps-list'인 메세지를 main 프로세스로 발신
// //   }).catch(err=>err);
// // }, 5000);
var remoteDeskTopPortKey = new Registry({
  hive: Registry.HKLM,  
  key:  '\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp'
});

function clearKillRemoteDesktopWorkers(){
  clearInterval(workerRemoteDeskTop);
  workerRemoteDeskTop = null;
  clearInterval(workerChromeRemote);
  workerChromeRemote = null;
}

function createKillRemoteDesktopWorkers(){
  remoteDeskTopPortKey.get('PortNumber', function (err, item) { // 원격데스크톱 port 획득
    console.error('remoteDeskTop PortNumber', parseInt(item.value, 16));
    workerRemoteDeskTop = setInterval(()=>{
      var port = parseInt(item.value, 16);

      exec(`netstat -ano | findstr :${port} `, (err, stdout, stderr) => { // TODO 3389뿐만아니라 33890 사용하는프로세스도 가져오기때문에 추후 수정
        if(!!err) return;
        console.error('netstat err', err); console.log('stdout', stdout); console.log('stderr', stderr);
        var arr = stdout.split(/\s+/);

        for(var i=0; i<arr.length; i++){
          if(arr[i].match(/^[0-9]+$/)){
            console.log("arr[i]",arr[i]);
            // exec(`taskkill /F /T /s localhost /u administrator /PID ${arr[i]} `, (err, stdout, stderr) => {
            //   if(!!err)  else 
            //     
            // }); 
            const child = spawn( 'taskkill',  ['/F', '/T', '/s', 'localhost', '/u', 'administrator', '/PID', arr[i]], {windowsVerbatimArguments: true} );
            child.once('error', (error)=>{
              console.error('remoteDeskTop netstat child.on error:', error);
              if(!!error) child.kill();
            });
            child.stdout.once('data', (data) => {
              console.error('remoteDeskTop netstat child.on stdout:', data);
            });
            child.stderr.once('data', (data) => {
              console.error('remoteDeskTop netstat child.on stderr:', data);
              if(!!data) child.kill();
            });
          }
        }
      });
      // const netstat = spawn( 'netstat', ['-ano', '|', 'findstr :', `:${port}`], {windowsVerbatimArguments: true} );
      // 
      // netstat.once('error', (error)=>{
      //   
      //   if(!!error) netstat.kill();
      // });
      // netstat.stdout.once('data', (data) => {
      //    
      //   var arr = data.split(/\s+/);
      //   for(var i=0; i<arr.length; i++){
      //     if(arr[i].match(/^[0-9]+$/)){
      //       
      //       const child = spawn( 'taskkill',  ['/F', '/F', '/s', 'localhost', '/u', 'administrator', '/PID', arr[i]], {windowsVerbatimArguments: true} );
      //       child.once('error', (error)=>{
      //         
      //         if(!!error) child.kill();
      //       });
      //       child.stdout.once('data', (data) => {
      //       });
      //       child.stderr.once('data', (data) => {
      //         if(!!data) child.kill();
      //       });
      //     }
      //   }
      // });
      // netstat.stderr.once('data', (data) => {
      //   
      //   if(!!data) netstat.kill();
      // });
    }, 5000);
  });

  workerChromeRemote = setInterval(()=>{ // TODO TEST 테스트를위해 잠시 주석
    exec(`tasklist | findstr remot`, (err, stdout, stderr) => {
      if(!!err) return;
      console.error('ChromeRemote err', err); console.log('stdout', stdout); console.log('stderr', stderr);
      var arr = stdout.split(/\s+/);

      for(var i=0; i<arr.length; i++){
        if(arr[i].match(/^[0-9]+$/)){
          console.log("arr[i]",arr[i]);
          // exec(`taskkill /F /T /s localhost /u administrator /PID ${arr[i]} `, (err, stdout, stderr) => {
          //   if(!!err) ipcRenderer.send('main', {mode: 'ps-list', data: 'kill fail'}); else ipcRenderer.send('main', {mode: 'ps-list', data: 'kill sucess'});
          //     
          // }); 
          const child = spawn( 'taskkill',  ['/F', '/T', '/s', 'localhost', '/u', 'administrator', '/PID', arr[i]], {windowsVerbatimArguments: true} );
          child.once('error', (error)=>{
            console.error('ChromeRemote tasklist child.on error:', error);
            if(!!error) child.kill();
          });
          child.stdout.once('data', (data) => {
            console.error('ChromeRemote tasklist child.on stdout:', data);
          });
          child.stderr.once('data', (data) => {
            console.error('ChromeRemote tasklist child.on stderr:', data);
            if(!!data) child.kill();
          });
        }
      }
    });
  },4000);

}
