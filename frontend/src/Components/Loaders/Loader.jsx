import PropTypes from 'prop-types';
import { memo } from 'react';

import { LOADING_TYPE } from '##/src/utility/utility.js';
import { setComponentDisplayName } from '##/src/utility/utility.js';

const DEFAULT_LOADER_MESSAGE = {
  [LOADING_TYPE.APPLICATION]: 'Welcome to codecast',
  [LOADING_TYPE.PROCESSING]: 'Processing...',
};

function Loader({ show, message, type }) {
  if (!show) return null;

  return (
    <div
      className={`
        fixed inset-0 grid place-items-center 
        ${type === LOADING_TYPE.PROCESSING ? 'bg-transparent' : 'bg-blue-royal '}
        z-1000
      `}
    >
      <div
        className={`text-center ${type === LOADING_TYPE.PROCESSING ? 'text-blue-royal' : 'text-white-hot'} `}
      >
        <h4 className="text-[1.8vw] font-semibold mb-[4vh]">
          {message || DEFAULT_LOADER_MESSAGE[type]}
        </h4>
        <span className="dui-loading dui-loading-bars w-[5vw]"></span>
      </div>
    </div>
  );
}

Loader.propTypes = {
  message: PropTypes.string,
  show: PropTypes.bool,
  type: PropTypes.oneOf([LOADING_TYPE.APPLICATION, LOADING_TYPE.PROCESSING])
    .isRequired,
};

setComponentDisplayName(Loader, 'Loader');

export default memo(Loader);
