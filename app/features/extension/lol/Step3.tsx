import React from 'react';
import '../../../css/extension.global.css';
import styles from './Step3.css';
import './Step3.css';

export default function Step3() {
  return (
		<div className="tab-pane" id="step9">
			<div className={'button-wrapper' + ' ' + styles.lol_step9} style={{display:'block'}}>
				<p className={'nsk' + ' ' + styles.lol_step9}>step3</p>
				<p className={'nsk' + ' ' + styles.lol_step9}>휴대폰 본인인증해주세요</p>
				<p className={'nsk' + ' ' + styles.lol_step9}>본인명의로 가입된</p>
				<p className={'nsk' + ' ' + styles.lol_step9}>모든 인게임 아이디를 조회합니다</p>

				<p className={'nsk' + ' ' + styles.lol_step9}>아래 이미지를 보고 사이트에서 따라해주세요</p>
				<img className={styles.lol_step9}/>
				<img className={styles.lol_step9}/>
			</div>

			{/* <div className="button-wrapper lol_disabled_account_step9" style="display:none;">
				<p className="nsk" style="white-space: nowrap; font-size: 20px; text-align: left; margin-left: 20px;">계정을 활성화 해주세요</p>
				<p className="nsk" style="font-size: 17px; text-align: left; margin-left: 20px; margin-bottom: 0px;">본인 명의로 가입된</p>
				<p className="nsk" style="font-size: 17px; text-align: left; margin-left: 20px; margin-bottom: 60px;">휴면 또는 비활성 계정을 활성화해주세요</p>
				<img src="../images/lol_active_account_link.png" style="padding: 6px 12px;max-height: 300px; float: left;">
				<button type="button" id="lol_active_account_link9" className="btn btn-default" style="background-color: #c2c5cc;border-radius: 10px;height: 60px;color: white;font-size: 20px;width: 320px;bottom: 30px; left: 55px;">
					<span>활성화하러 가기</span>
				</button>
			</div> */}
		</div>
  );
}
