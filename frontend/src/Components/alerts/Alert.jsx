import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearAlertMessage,
  selectAlertMessage,
} from '##/src/store/slices/alertSlice.js';
import { setComponentDisplayName } from '##/src/utility/utility.js';

/**
 * Alert component to display messages from Redux state.
 */
function Alert() {
  const dispatch = useDispatch();
  const message = useSelector(selectAlertMessage);
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        dispatch(clearAlertMessage());
        setVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!visible) return null;

  return (
    <div className="fixed z-20 bottom-4 left-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in max-w-[70vw]">
      <div data-testid="alert-message">{parse(message)}</div>
      <button
        className="ml-auto text-gray-300 hover:text-white transition cursor-pointer font-inter"
        onClick={() => {
          dispatch(clearAlertMessage());
          setVisible(false);
        }}
      >
        X
      </button>
    </div>
  );
}

setComponentDisplayName(Alert, 'Alert');

export default Alert;
