import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import Header from '@edx/frontend-component-header';

import getLearningHeaderMenu from './LearningHeaderMenu';
import messages from './messages';

const CustomLearningHeader = ({
  courseOrg,
  courseNumber,
  courseTitle,
  showUserDropdown = true,
}) => {
  const { authenticatedUser, config: appConfig } = React.useContext(AppContext);
  const { formatMessage } = useIntl();

  const discoveryUrl = appConfig.DISCOVERY_API_BASE_URL ||
    appConfig.DISCOVERY_BASE_URL ||
    appConfig.COURSE_CATALOG_URL ||
    `${appConfig.LMS_BASE_URL}/courses`;

  const headerMenu = getLearningHeaderMenu(
    formatMessage,
    authenticatedUser,
    discoveryUrl,
  );

  return (
    <>
      <Header
        mainMenuItems={headerMenu.mainMenu}
        secondaryMenuItems={headerMenu.secondaryMenu}
        userMenuItems={showUserDropdown ? headerMenu.userMenu : null}
      />
    </>
  );
};

export default CustomLearningHeader;