import Login from '../pages/Login';
import {connect} from 'react-redux';

export default connect(
  function(state) {
    return {data:state.user}
  }, 
  function(dispatch) {
    return {
      onClickLogin: (wallet) => {
        dispatch({ type: "LOGIN", wallet })
      }
    }
  }
)(Login);