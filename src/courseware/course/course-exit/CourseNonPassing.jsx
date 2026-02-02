import React, { useEffect } from 'react';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { Alert, Button } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { useModel } from '../../../generic/model-store';

import CatalogSuggestion from './CatalogSuggestion';
import DashboardFootnote from './DashboardFootnote';
import messages from './messages';
import { logClick, logVisit } from './utils';

const CourseNonPassing = ({ reason = 'incomplete' }) => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);
  const {
    org,
    tabs,
    title,
    certificateData,
    canViewCertificate,
  } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  const certificateExpected = !!certificateData && canViewCertificate;
  const progressTab = tabs.find(tab => tab.slug === 'progress');
  const progressLink = progressTab && progressTab.url;

  const courseHomeLink = `/learning/course/${courseId}/home`;

  useEffect(() => {
    const visitVariant = reason === 'low_grade'
      ? 'nonpassing-low-grade'
      : 'nonpassing-incomplete';
    logVisit(org, courseId, administrator, visitVariant);
  }, [org, courseId, administrator, reason]);

  let alertMessage;
  let button = null;

  if (reason === 'low_grade') {
    alertMessage = intl.formatMessage(messages.endOfCourseDescriptionLowGrade);
    if (progressLink) {
      button = (
        <Button
          variant="primary"
          className="flex-shrink-0 mt-3 mt-sm-0 mb-1 mb-sm-0 ml-sm-5"
          href={progressLink}
          onClick={() => logClick(org, courseId, administrator, 'view_grades')}
        >
          {intl.formatMessage(messages.viewGradesButton)}
        </Button>
      );
    }
  } else {
    alertMessage = intl.formatMessage(messages.endOfCourseDescriptionIncomplete);
    button = (
      <Button
        variant="outline-primary"
        className="flex-shrink-0 mt-3 mt-sm-0 mb-1 mb-sm-0 ml-sm-5"
        href={courseHomeLink}
        onClick={() => logClick(org, courseId, administrator, 'return_to_course')}
      >
        {intl.formatMessage(messages.returnToCourseButton)}
      </Button>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${intl.formatMessage(messages.endOfCourseTitle)} | ${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="row w-100 mx-0 mb-4 px-5 py-4 border border-light justify-content-center">
        <div className="col-12 p-0 h2 text-center">
          { intl.formatMessage(messages.endOfCourseHeader) }
        </div>
        <Alert variant="primary" className="col col-lg-10 mt-4">
          <div className="row w-100 m-0 align-items-start">
            <div className="flex-grow-1 col-sm p-0">
              {alertMessage}
            </div>

            {button}
          </div>
        </Alert>
        <DashboardFootnote variant="nonpassing" />
        <CatalogSuggestion variant="nonpassing" />
      </div>
    </>
  );
};

export default CourseNonPassing;
