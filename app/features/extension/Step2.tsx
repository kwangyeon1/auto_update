import React from 'react';
import '../../css/extension.global.css';
import styles from './Step2.css';
import { useDispatch, useSelector } from 'react-redux';
import { setWebViewValid } from './extensionSlice';
import { selectStep1Csrf } from './step1Slice';

export default function Step2() {
	const dispatch = useDispatch();
	const lol = (e: React.SyntheticEvent) => { // rendering후 event이기때문에 dispatch를 참조하기위해서는 inline형식으로 dispatch를 위한 event를 정의 한다
		e.preventDefault();
		console.log("롤 인증하기");		
		dispatch(setWebViewValid('https://account.leagueoflegends.co.kr/id-finder', '/extension/step2.js'));
	}
	const verified_csrf = useSelector(selectStep1Csrf);
	const test = () => {
		
		fetch('http://testrankingtest.xyz/c/test', { // ajax 테스트 코드
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, cors, *same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'same-origin', // include, *same-origin, omit
				headers: {
						'Content-Type': 'application/json',
						'X-CSRF-TOKEN': verified_csrf
						// 'Content-Type': 'application/x-www-form-urlencoded',
				},
				redirect: 'follow', // manual, *follow, error
				referrer: 'no-referrer', // no-referrer, *client
				body: JSON.stringify({}), // body data type must match "Content-Type" header
		})
		.then(response => console.log(response.json()))
	}
  return (
    <div className="tab-pane" id="step2">
			<div className="button-wrapper">
				<p className="nsk" style={{fontSize: '20px',textAlign: 'left',     marginBottom: '30px'}}>step2</p>
				<p className="nsk" style={{fontSize: '20px', textAlign: 'left', marginLeft: '20px'}}>플레이하실 게임을 선택해주세요</p>
				<p className="nsk" style={{fontSize: '15px',fontWeight: 'normal', textAlign: 'left', marginLeft: '26px',    marginBottom: '0px'}}>인증하려는 게임을 선택하고</p>
				<p className="nsk" style={{fontSize: '15px', fontWeight: 'normal', textAlign: 'left', marginLeft: '26px',    marginBottom: '20px'}}>게임 사이트에 로그인해주세요</p>
				<div><img className={styles.step2_lol} style={{maxHeight: '90px'}} /></div>
				<div>	
					<button type="button" onClick={lol} id="step2_lol" className={styles.step2_lol + " btn btn-default"}>
						<span>롤 인증하기</span>
					</button>
				</div>
				<div>	
					<button type="button" onClick={test} id="step2_lol" className={styles.step2_lol + " btn btn-default"}>
						<span>테스트</span>
					</button>
				</div>
			</div>
		</div>
  );
}