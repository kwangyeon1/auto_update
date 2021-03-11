import React from 'react';
import '../../css/extension.global.css';
import _step1Png from '../../images/step1.png';

export default function Step1() {
  return (
    <div className="tab-pane" id="step1">
			<div className="button-wrapper">
				<p className="nsk" style={{fontSize: "20px", textAlign: "left",     marginBottom: "30px"}}>step1</p>
				<p className="nsk" style={{fontSize: "20px",  textAlign: "left", marginLeft: "20px"}}>랭킹지지 본인인증 서비스입니다</p>
				<p className="nsk" style={{fontSize: "15px", fontWeight: "normal",textAlign: "left", marginLeft: "26px",    marginBottom: "0px"}}>플레이하실 인게임 아이디가</p>
				<p className="nsk" style={{fontSize: "15px", fontWeight: "normal",textAlign: "left", marginLeft: "26px",    marginBottom: "0px"}}>본인의 소유인지 확인하고</p>
				<p className="nsk" style={{fontSize: "15px", fontWeight: "normal",textAlign: "left", marginLeft: "26px",    marginBottom: "0px"}}>랭킹지지 서비스에 등록하는 과정입니다</p>
				<p className="nsk" style={{fontSize: "15px", fontWeight: "normal",textAlign: "left", marginLeft: "26px",    marginBottom: "20px"}}>먼저 랭킹지지에 로그인해주세요</p>
				<img src={_step1Png} style={{padding: "6px 12px",maxHeight: "250px"}} />
				{/* <button type="button" id="step1_btn" className="btn btn-default" style={{backgroundColor: "#3165e1",borderRadius: "10px",height: "60px",color: "white",fontSize: "20px",width: "90%"}}>
					<span>시작하기</span>
				</button> */}
			</div>
		</div>
  );
}
