import React from 'react';
import { useDispatch } from 'react-redux';
import styles from './Top.css'
import {
  initValid
} from './extensionSlice';

export default function Top() {
	const dispatch = useDispatch();
  return (
    <div style={{backgroundColor : "white" }}>
      <label style={{display: "inline-block", textAlign: "center",margin: "0 2px", fontSize: "5px"}}>
				<input type="button"  className={styles.pop} id="pop" />
				팝업진행
			</label>
      <label style={{display: "inline-block",textAlign: "center",margin: "0 2px",fontSize: "5px"}}>
				<input type="button"  className={styles.go_link} id="go_link" />
				링크연결
			</label>
			<label style={{display: "inline-block",textAlign: "center",    margin: "0 2px 0 80px", fontSize: "5px"}}>
				<input type="button"  className={styles.init} id="init" 
					onClick={() => {
            dispatch(initValid());
          }}
				/>
				처음부터
			</label>
		</div>
  );
}
