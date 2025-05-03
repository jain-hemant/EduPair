import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { USER_ROLES } from '##/shared/directory.js';
import { selectMe } from '##/src/store/slices/userSlice.js';
import { can, setComponentDisplayName } from '##/src/utility/utility.js';

/**
 * This component checks if the current user can perform some action.
 * Based on that check, it renders one of two options.
 * It also passes on any additional props to the chosen option.
 * Such props may be provided by a parent component and are meant to be used
 * by the child component being rendered.
 */
function Can({
  // By default render nothing
  no = () => null,
  perform,
  // By default render nothing
  yes = () => null,
  ...rest
}) {
  const user = useSelector(selectMe) || { role: USER_ROLES.guest };
  return can({ role: user.role, perform }) ? yes(rest) : no(rest);
}

Can.propTypes = {
  // What to do when the action cannot be performed
  no: PropTypes.func,
  // The action to be performed
  perform: PropTypes.string.isRequired,
  // What to do when the action can be performed
  yes: PropTypes.func,
};

setComponentDisplayName(Can, 'Can');

export default Can;
